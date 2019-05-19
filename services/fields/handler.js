'use strict';

const AWS = require('aws-sdk');
const http = require('http');
const crypto = require('crypto');
const { promisify } = require('util');
const s3Client = new AWS.S3();

const s3Upload = promisify(s3Client.putObject.bind(s3Client));
const s3Get = promisify(s3Client.getObject.bind(s3Client));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*'
};

const mock = {
  area: [
    {"lat":53.92393936111111,"lng":27.693696},
    // {
    //   "lat": 51.520173035107824,
    //   "lng": -0.08995056152343751
    // },
    // {
    //   "lat": 51.520173035107824,
    //   "lng": -0.09012222290039064
    // }
  ]
};

const s3FieldParams = (fieldId, body) => ({
  Bucket: 'epam-jam1',
  Key: `fields/${fieldId}/meta.json`,
  ACL: 'public-read',
  Body: JSON.stringify(body),
  ContentType: 'application/json',
});

function rad2degr(rad) { return rad * 180 / Math.PI; }
function degr2rad(degr) { return degr * Math.PI / 180; }

function getCenters(coords) {
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (let i = 0; i< coords.length; i++) {
    let lat = degr2rad(coords[i]['lat']);
    let lng = degr2rad(coords[i]['lng']);
    sumX += Math.cos(lat) * Math.cos(lng);
    sumY += Math.cos(lat) * Math.sin(lng);
    sumZ += Math.sin(lat);
  }

  let avgX = sumX / coords.length;
  let avgY = sumY / coords.length;
  let avgZ = sumZ / coords.length;

  let lng = Math.atan2(avgY, avgX);
  let hyp = Math.sqrt(avgX * avgX + avgY * avgY);
  let lat = Math.atan2(avgZ, hyp);

  return { lat: rad2degr(lat), lng: rad2degr(lng) };
};

async function allBucketKeys(s3, bucket) {
  const params = {
    Bucket: bucket,
  };

  var keys = [];
  for (;;) {
    var data = await s3.listObjects(params).promise();

    data.Contents.forEach((elem) => {
      keys = keys.concat(elem.Key);
    });

    if (!data.IsTruncated) {
      break;
    }
    params.Marker = data.NextMarker;
  }

  return keys;
};

module.exports.match = async (event) => {
  try {
    const data = event.Records[0].s3;
    const bucketName = data.bucket.name;
    const objectName = data.object.key;

    console.log(bucketName);
    console.log(objectName);

    const fieldCoordsParams = {
      Bucket: bucketName, 
      Key: objectName,
    };

    const { Body } = await s3Get(fieldCoordsParams);

    const fieldCoords = JSON.parse(Body);

    console.log(fieldCoords);

    const centers = getCenters(fieldCoords.coords);

    console.log(centers);

    const fileList = await allBucketKeys(s3Client, 'epam-jam1');

    const images = fileList.filter(file => file.search('images') !== -1 && file.search('.json') !== -1)
    
    const coordsData = await Promise.all(images.map(img => s3Get({ Bucket: bucketName,  Key: img })));

    const imagesAndCoords = coordsData.map((img, i) => ({
      coords: JSON.parse(img.Body.toString()),
      name: images[i]
    }));
    
    const matchedCoords = imagesAndCoords.find(s => s.coords.lat === centers.lat);
    
    if (!matchedCoords) return { statusCode: 200 }

    const imageUrl = `https://s3.amazonaws.com/${bucketName}/${matchedCoords.name}`;

    console.log(imageUrl);

    // call recognize api
    const prediction = {
      "id": objectName.replace('fields/', '').replace('/meta.json', ''),
      "name": fieldCoords.name,
      "fieldShape": fieldCoords.coords,
      "photos": [{
        "class_areas": {
          "bush": 2021.8091862405313, 
          "field": 15103.386228094381, 
          "field_shadowed": 108.63382305087225, 
          "road": 1154.8502744198556, 
          "trees": 2728.046351214885
        }, 
        "class_percentages": {
          "bush": 0.09574444444444444, 
          "field": 0.7152333333333334, 
          "field_shadowed": 0.0051444444444444445, 
          "road": 0.05468888888888889, 
          "trees": 0.12918888888888888
        }, 
        "lat": 53.923339416666664, 
        "lng": 27.68277516666667,
        "terrain_size": {
          "mpp_x": 0.0423048523206751, 
          "mpp_y": 0.055461790904828875, 
          "terrain_size_x": 169.2194092827004, 
          "terrain_size_y": 124.78902953586497
        },
        src: imageUrl.replace('json', 'JPG')
      }]
    };


    prediction.photos[0].dmz = 1 - prediction.photos[0].class_percentages.field - prediction.photos[0].class_percentages.road;

    await s3Upload({
      Bucket: 'epam-jam1',
      Key: objectName.replace('meta', 'prediction'),
      ACL: 'public-read',
      Body: JSON.stringify(prediction),
      ContentType: 'application/json',
    });

    return {
      statusCode: 200,
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 200,
    };
  }
};

module.exports.fieldCreate = async (event) => {
  console.log(event.body);

  try {
    const data = JSON.parse(event.body || '{}');
    const id = crypto.randomBytes(16).toString("hex");
    await s3Upload(
      s3FieldParams(id, { name: 'field', coords: mock.area })
    );

    return {
      statusCode: 200,
      headers: { ...CORS },
      body: JSON.stringify({
        status: 'OK',
        data: {
          fieldId: id,
        }
      }),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      headers: { ...CORS },
      body: JSON.stringify({
        status: 'ERROR',
        data: {
          error: e.message || ''
        }
      }),
    };
  }
};

module.exports.fieldDetails = async (event) => {
  console.log(event);
  try {
    const { id } = event.pathParameters;

    const fileList = await allBucketKeys(s3Client, 'epam-jam1');

    const fieldKey = fileList.find(file => file.search('fields') !== -1 && file.search(`${id}`) !== -1 && file.search('prediction.json') !== -1)
    console.log(fieldKey);
    const data = await s3Get({ Bucket: 'epam-jam1',  Key: fieldKey });

    return {
      statusCode: 200,
      headers: { ...CORS },
      body: JSON.stringify({
        status: 'OK',
        data: JSON.parse(data.Body.toString())
      })
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      headers: { ...CORS },
      body: JSON.stringify({
        status: 'ERROR',
        data: {
          error: e.message || ''
        }
      }),
    };
  }
};

module.exports.fields = async (event) => {
  try {
    const data = JSON.parse(event.body || '{}');
    const id = crypto.randomBytes(16).toString("hex");
    const fileList = await allBucketKeys(s3Client, 'epam-jam1');
    const predictions = fileList.filter(file => file.search('field') !== -1 && file.search('prediction.json') !== -1)
    const images = await Promise.all(predictions.map(img => s3Get({ Bucket: 'epam-jam1',  Key: img })));
     
    return {
      statusCode: 200,
      headers: { ...CORS },
      body: JSON.stringify({
        status: 'OK',
        data: images.map(img => JSON.parse(img.Body.toString())).map(v => ({
          id: v.id,
          name: v.name,
          src: v.photos[0].src
        }))
      }),
    };

  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      headers: { ...CORS },
      body: JSON.stringify({
        status: 'ERROR',
        data: {
          error: e.message || ''
        }
      }),
    };

  }
};