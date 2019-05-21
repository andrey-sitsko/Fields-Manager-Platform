cd out
ls | sed "s/.json//" | xargs -n 1 -I{} labelme_json_to_dataset {}.json -o {}