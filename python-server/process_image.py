from __future__ import print_function

import os
import json
from io import BytesIO
from time import time
from collections import Counter

import joblib
from PIL import Image
import numpy as np
from labelme.utils.draw import label_colormap, draw_label
import exifread
import requests
from sklearn.cluster import DBSCAN
from scipy.spatial import ConvexHull, Delaunay
from flask import Flask, request, jsonify, Response

### Business logic ###

SUPPORTED_TASK_NAMES = ["detect_artifacts"] # , "detect_unhealthy"

MODELS_DIR = "models"
METADATA_FILENAME = "metadata.json"
PROJECTOR_FILENAME = "projector.model"
CLF_FILENAME_DICT = {
    "detect_artifacts": "clf_rf_e10_d7.model"
}

def get_models():
    print("Loading models")
    models = {}
    for task_name in SUPPORTED_TASK_NAMES:
        metadata = json.load(open(os.path.join(MODELS_DIR, task_name, METADATA_FILENAME)))
        assert "A" in metadata and "labels" in metadata # A = tile side length in pixels
        projector = joblib.load(os.path.join(MODELS_DIR, task_name, PROJECTOR_FILENAME))
        clf = joblib.load(os.path.join(MODELS_DIR, task_name, CLF_FILENAME_DICT[task_name]))
        models[task_name] = (metadata, projector, clf)
    return models

models = get_models() # TODO: Maybe move into an object?

def input_to_tile_vectors(arr, A):
    assert len(arr.shape) == 3 and arr.shape[-1] == 3
    tile_count_h, tile_count_w = arr.shape[0] // A, arr.shape[1] // A
    tile_vectors = np.array([arr[A*i:A*(i+1),A*j:A*(j+1),:].flatten()
                             for i in range(tile_count_h) for j in range(tile_count_w)])
    return tile_vectors

def tile_classes_to_output_small(tile_classes, shape, A):
    assert len(shape) == 2
    tile_count_h, tile_count_w = shape[0] // A, shape[1] // A
    assert tile_count_h * tile_count_w == len(tile_classes)
    return tile_classes.reshape((tile_count_h, tile_count_w))

def tile_classes_to_output(tile_classes, shape, A):
    assert len(shape) == 2
    output = np.zeros(shape, dtype=np.uint8)
    tile_count_h, tile_count_w = shape[0] // A, shape[1] // A
    assert tile_count_h * tile_count_w == len(tile_classes)
    idx = 0
    for i in range(tile_count_h):
        for j in range(tile_count_w):
            output[A*i:A*(i+1),A*j:A*(j+1)] = tile_classes[idx]
            idx += 1
    return output

# TODO: Make denoising part of the model?
def refine_small_mask(mask, iter_count=5):
    TOLERANCE_IN_3x3_SUBMASK = 5 # out of 8 (9 - 1)
    assert len(mask.shape) == 2
    h, w = mask.shape
    refined_mask = mask.copy()
    for _ in range(iter_count):
        for i in range(1, h - 1):
            for j in range(1, w - 1):
                submask = mask[i-1:i+2,j-1:j+2].flatten()
                bincount = np.bincount(submask)
                most_frequent_label = np.argmax(bincount)
                if bincount[most_frequent_label] >= TOLERANCE_IN_3x3_SUBMASK:
                    refined_mask[i,j] = most_frequent_label
    return refined_mask

def predict_mask(img_as_arr, model, respond_fast):
    metadata, projector, clf = model
    A = metadata["A"]
    # t1 = time()
    tile_vectors = input_to_tile_vectors(img_as_arr, A)
    # t2 = time()
    tile_vectors_low_dimensional = projector.transform(tile_vectors)
    # t3 = time()
    tile_classes = clf.predict(tile_vectors_low_dimensional)
    # t4 = time()
    # TODO: Make denoising part of the model?
    field_boundary_points = None
    if not respond_fast:
        output_mask_small = tile_classes_to_output_small(tile_classes, img_as_arr.shape[:2], A)
        output_mask_small_refined = refine_small_mask(output_mask_small)
        field_boundary_points = get_field_boundary_points(output_mask_small_refined, A)
        tile_classes = output_mask_small_refined.flatten()
    # t5 = time()
    output_mask = tile_classes_to_output(tile_classes, img_as_arr.shape[:2], A)
    # t6 = time()
    # print("Input to tile vectors:    %.4f" % (t2 - t1))
    # print("Dimensionality reduction: %.4f" % (t3 - t2))
    # print("Prediction:               %.4f" % (t4 - t3))
    # print("Denoising:                %.4f" % (t5 - t4))
    # print("Classes to mask:          %.4f" % (t6 - t5))
    return output_mask, field_boundary_points

def mask_to_image(mask):
    # Encoding classes with a colormap, see /usr/local/lib/python2.7/dist-packages/labelme/utils/_io.py
    assert mask.min() >= -1 and mask.max() < 255
    mask_pil = Image.fromarray(mask.astype(np.uint8), mode='P')
    colormap = label_colormap(255)
    mask_pil.putpalette((colormap * 255).astype(np.uint8).flatten())
    return mask_pil

def mask_to_image_blended(mask, input_img_as_arr, label_names):
    # IMPORTANT: To suppress showing legend, edit /usr/local/lib/python2.7/dist-packages/labelme/utils/draw.py
    # Comment out the line with plt.legend
    return Image.fromarray(draw_label(mask, input_img_as_arr, label_names))

def predict_mask_dummy(img_as_arr):
    # This is a dummy method generating random masks
    return np.uint8(255*np.random.randint(0, 2, size=img_as_arr.shape))

def mask_to_image_dummy(mask):
    # This is a dummy method straightforwardly mapping the mask into an image
    return Image.fromarray(mask)

def to_float(coord):
    degrees, minutes, seconds = coord.values
    return degrees.num / (1.0 * degrees.den) + minutes.num / (60.0 * minutes.den) + seconds.num / (3600.0 * seconds.den)

# See details on calculating meters per pixel here: https://www.drewsilcock.co.uk/meters-per-pixel
# The formulae are:
# $\mu_x = \frac{2h \tg \left(\frac{\alpha_x}{2}\right)}{r_x}$
# $\mu_y = \frac{2h \tg \left(\frac{\alpha_y}{2}\right)}{r_y}$
# Here:
# - $r_x$, $r_y$ are the picture's width and height, obtained from EXIF data
# - $\alpha_x$, $\alpha_y$ are the camera's angles of view, hardcoded for now (model-specific)
# - $h$ is the drone flight height, hardcoded for now (need additional data source)
ANGLE_OF_VIEW_HORIZONTAL = 1.153936460835047 # 2*np.arctan(6.17 / (2*4.74))
ANGLE_OF_VIEW_VERTICAL = 0.8949713632087425 # 2*np.arctan(4.55 / (2*4.74))
FLIGHT_HEIGHT = 130.0

def measure_terrain(tags):
    terrain_size_x = 2 * FLIGHT_HEIGHT * np.tan(ANGLE_OF_VIEW_HORIZONTAL / 2)
    terrain_size_y = 2 * FLIGHT_HEIGHT * np.tan(ANGLE_OF_VIEW_VERTICAL / 2)
    r_x, r_y = tags["EXIF ExifImageWidth"].values[0], tags["EXIF ExifImageLength"].values[0]
    return terrain_size_x, terrain_size_y, terrain_size_x / r_x, terrain_size_y / r_y

def get_field_boundary_points(mask, A):
    target_class = 2 # TODO: Should be part of the model
    clusterizer = DBSCAN(eps=1.01) # TODO: Should be part of the model
    ys, xs = np.where(mask == target_class)
    X_pixel_coords = np.vstack([xs.reshape((1, -1)), ys.reshape((1, -1))]).T
    y_pixel_coords = clusterizer.fit_predict(X_pixel_coords)
    c = Counter(y_pixel_coords)
    largest_hub = sorted(c, key=lambda x: -c[x])[0]
    # assert X_pixel_coords[y_pixel_coords == largest_hub, :].shape[0] > 0.5 * X_pixel_coords.shape[0]
    hull = ConvexHull(X_pixel_coords[y_pixel_coords == largest_hub, :])
    return (A * X_pixel_coords[hull.vertices, :]).tolist()

def get_binary_data(request, from_url):
    if not from_url:
        return request.get_data()
    else:
        assert "url" in request.get_json(force=True) # TODO: Allow to send the URL via GET
        url = request.get_json()["url"]
        r = requests.get(url)
        assert r.status_code == 200
        return r.content

def parse_request(request, from_url):
    assert "task_name" in request.args
    task_name = request.args.get("task_name")
    assert task_name in models, "Unsupported task_name %s" % task_name
    with_original = "with_original" in request.args
    to_array = "to_array" in request.args
    respond_fast = "respond_fast" in request.args
    binary_data = get_binary_data(request, from_url)
    return binary_data, task_name, with_original, to_array, respond_fast

def _process_image(request, from_url=False):
    binary_data, task_name, with_original, to_array, respond_fast = parse_request(request, from_url)
    model = models[task_name]
    input_img = Image.open(BytesIO(binary_data))
    input_img_as_arr = np.asarray(input_img)
    mask, _ = predict_mask(input_img_as_arr, model, respond_fast)
    if to_array and not with_original:
        return jsonify(mask.flatten().tolist())
    output_img = mask_to_image(mask) if not with_original else mask_to_image_blended(mask, input_img_as_arr, model[0]["labels"])
    if to_array:
        return jsonify(np.asarray(output_img).flatten().tolist())
    else:
        output_img_as_bytes = BytesIO()
        output_img.save(output_img_as_bytes, format="PNG")
        r = Response(output_img_as_bytes.getvalue(), mimetype="image/png")
        r.headers["Content-Type"] = "image/png"
        return r
    # TODO: The JSON files produced with to_array are very large.
    # Consider deprecating this argument and using https://github.com/devongovett/png.js instead

def _get_gps_coordinates(request, from_url=False):
    binary_data = get_binary_data(request, from_url)
    tags = exifread.process_file(BytesIO(binary_data))
    return jsonify({
        "lng": to_float(tags["GPS GPSLongitude"]),
        "lat": to_float(tags["GPS GPSLatitude"])
    })

def _get_image_metadata(request, from_url=False):
    binary_data, task_name, _, _, _ = parse_request(request, from_url)
    model = models[task_name]
    # Class area ratios
    input_img = Image.open(BytesIO(binary_data))
    input_img_as_arr = np.asarray(input_img)
    mask, field_boundary_points = predict_mask(input_img_as_arr, model, respond_fast=False) # wouldn't work otherwise
    c = Counter(mask.flatten())
    denom = float(len(mask.flatten()))
    class_area_ratios = {model[0]["labels"][k]: v / denom for k, v in c.items()}
    # Latitude and longitude
    tags = exifread.process_file(BytesIO(binary_data))
    lng, lat = to_float(tags["GPS GPSLongitude"]), to_float(tags["GPS GPSLatitude"])
    # Meters per pixel, terrain size
    terrain_size_x, terrain_size_y, mpp_x, mpp_y = measure_terrain(tags)
    # Class areas
    class_areas = {k: v * denom * mpp_x * mpp_y for k, v in class_area_ratios.items()}
    # Put this all together
    return jsonify({
        "lng": lng, "lat": lat,
        "class_percentages": class_area_ratios,
        "terrain_size": {
            "terrain_size_x": terrain_size_x, "terrain_size_y": terrain_size_y,
            "mpp_x": mpp_x, "mpp_y": mpp_y
        },
        "class_areas": class_areas,
        "field_boundary_points": field_boundary_points
    })

def _get_labels(request):
    assert "task_name" in request.args
    task_name = request.args.get("task_name")
    assert task_name in models, "Unsupported task_name %s" % task_name
    return jsonify(models[task_name][0]["labels"])

def _match_photos_with_field(request):
    input_json = request.get_json(force=True)
    assert "shapes" in input_json and "photos" in input_json
    shapes, photos = input_json["shapes"], input_json["photos"]
    for p in shapes:
        assert "lat" in p and "lng" in p
    for p in photos:
        assert "lat" in p and "lng" in p
    shapes_arr = np.array([(p["lat"], p["lng"]) for p in shapes])
    photos_arr = np.array([(p["lat"], p["lng"]) for p in photos])
    polygon = Delaunay(shapes_arr)
    return jsonify((polygon.find_simplex(photos_arr) >= 0).tolist())

### Service ###

app = Flask(__name__)
app.config["JSONIFY_PRETTYPRINT_REGULAR"] = True

@app.route('/')
def index():
    return "hello world\n"

@app.route('/api/v1.0/process_image', methods=['POST'])
def process_image():
    return _process_image(request)

@app.route('/api/v1.0/get_gps_coordinates', methods=['POST'])
def get_gps_coordinates():
    return _get_gps_coordinates(request)

@app.route('/api/v1.0/get_image_metadata', methods=['POST'])
def get_image_metadata():
    return _get_image_metadata(request)

@app.route('/api/v1.0/process_image_from_url', methods=['POST'])
def process_image_from_url():
    return _process_image(request, from_url=True)

@app.route('/api/v1.0/get_gps_coordinates_from_url', methods=['POST'])
def get_gps_coordinates_from_url():
    return _get_gps_coordinates(request, from_url=True)

@app.route('/api/v1.0/get_image_metadata_from_url', methods=['POST'])
def get_image_metadata_from_url():
    return _get_image_metadata(request, from_url=True)

@app.route('/api/v1.0/match_photos_with_field', methods=['POST'])
def match_photos_with_field():
    return _match_photos_with_field(request)

@app.route('/api/v1.0/get_labels', methods=['GET'])
def get_labels():
    return _get_labels(request)

if __name__ == '__main__':
    app.run(host="0.0.0.0") # debug=True to debug

# # # # # # # # # # # #
# Call syntax

# Return pixel mask representing classes detected in the input image
# curl -X POST --data-binary @path/to/input.jpg 'http://localhost:5000/api/v1.0/process_image?task_name=detect_artifacts' > output.png

# Return this pixel mask, blended with the original image
# curl -X POST --data-binary @path/to/input.jpg 'http://localhost:5000/api/v1.0/process_image?task_name=detect_artifacts&with_original' > output.png

# Return the image's full metadata: latitude / longitude, area ratios under various classes, pixel to meters ratio, etc. Generally, the metadata format may differ in different tasks
# curl -X POST --data-binary @path/to/input.jpg 'http://localhost:5000/api/v1.0/get_image_metadata?task_name=detect_artifacts' > output.json

# Return the image's latitude and longitude only (task name is not required)
# curl -X POST --data-binary @path/to/input.jpg 'http://localhost:5000/api/v1.0/get_gps_coordinates' > output.json

# Same as before, but with URL instead of binary data blob
# curl -X POST -d '{"url": "example.com/image.jpg"}' 'http://localhost:5000/api/v1.0/process_image_from_url?task_name=detect_artifacts' > output.png
# curl -X POST -d '{"url": "example.com/image.jpg"}' 'http://localhost:5000/api/v1.0/process_image_from_url?task_name=detect_artifacts&with_original' > output.png
# curl -X POST -d '{"url": "example.com/image.jpg"}' 'http://localhost:5000/api/v1.0/get_image_metadata_from_url?task_name=detect_artifacts' > output.json
# curl -X POST -d '{"url": "example.com/image.jpg"}' 'http://localhost:5000/api/v1.0/get_gps_coordinates_from_url' > output.json

# Return the list of classes in a particular task
# curl -X GET 'http://localhost:5000/api/v1.0/get_labels?task_name=detect_artifacts' > output.json

# # # # # # # # # # # #
# Working example - ALL THESE CALLS ARE EXPECTED TO WORK IF YOU HAVE SET EVERYTHING UP CORRECTLY

# mkdir example_outputs
# curl -X POST --data-binary @new-photos/DJI_0098.jpg 'http://localhost:5000/api/v1.0/process_image?task_name=detect_artifacts' > example_outputs/process_image.png
# curl -X POST --data-binary @new-photos/DJI_0098.jpg 'http://localhost:5000/api/v1.0/process_image?task_name=detect_artifacts&with_original' > example_outputs/process_image_with_original.png
# curl -X POST --data-binary @new-photos/DJI_0098.jpg 'http://localhost:5000/api/v1.0/get_image_metadata?task_name=detect_artifacts' > example_outputs/get_image_metadata.json
# curl -X POST --data-binary @new-photos/DJI_0098.jpg 'http://localhost:5000/api/v1.0/get_gps_coordinates' > example_outputs/get_gps_coordinates.json
# curl -X POST -d '{"url": "https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG"}' 'http://localhost:5000/api/v1.0/process_image_from_url?task_name=detect_artifacts' > example_outputs/process_image_from_url.png
# curl -X POST -d '{"url": "https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG"}' 'http://localhost:5000/api/v1.0/process_image_from_url?task_name=detect_artifacts&with_original' > example_outputs/process_image_with_original_from_url.png
# curl -X POST -d '{"url": "https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG"}' 'http://localhost:5000/api/v1.0/get_image_metadata_from_url?task_name=detect_artifacts' > example_outputs/get_image_metadata_from_url.json
# curl -X POST -d '{"url": "https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG"}' 'http://localhost:5000/api/v1.0/get_gps_coordinates_from_url' > example_outputs/get_gps_coordinates_from_url.json
# curl -X GET 'http://localhost:5000/api/v1.0/get_labels?task_name=detect_artifacts' > example_outputs/get_labels.json
