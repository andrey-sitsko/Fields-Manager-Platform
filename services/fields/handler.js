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
    {
      "lat": 51.520173035107824,
      "lng": -0.08995056152343751
    },
    {
      "lat": 51.520173035107824,
      "lng": -0.09012222290039064
    }
  ]
};

const s3FieldParams = (fieldId, body) => ({
  Bucket: 'epam-jam1',
  Key: `fields/${fieldId}/coords.json`,
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

    const centers = getCenters(fieldCoords);

    console.log(centers);

    const fileList = await allBucketKeys(s3Client, 'epam-jam1');

    console.log(fileList);

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
      s3FieldParams(id, mock.area)
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        headers: { ...CORS },
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
      body: JSON.stringify({
        headers: { ...CORS },
        status: 'ERROR',
        data: {
          error: e
        }
      }),
    };

  }
};
