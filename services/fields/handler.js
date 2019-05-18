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

module.exports.match = async (event) => {
  const data = event.Records[0].s3;
  const bucketName = data.bucket.name;
  const objectName = data.object.key;

  const fieldCoordsParams = {
    Bucket: bucketName, 
    Key: objectName,
  }

  const { Body } = await s3Get(fieldCoordsParams);

  const fieldCoords = JSON.parse(Body);

  console.log(fieldCoords);


  return {
    statusCode: 200,
  };
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
