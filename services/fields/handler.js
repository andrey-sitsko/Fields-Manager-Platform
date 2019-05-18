'use strict';

const AWS = require('aws-sdk');
const http = require('http');
const crypto = require("crypto");
const { promisify } = require("util");

const s3Client = new AWS.S3();

const s3Upload = promisify(s3Client.putObject.bind(s3Client))

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*'
};

const s3FieldParams = (fieldId, body) => ({
  Bucket: 'epam-jam1',
  Key: `fields/${fieldId}/coords.json`,
  ACL: 'public-read',
  Body: JSON.stringify(body),
  ContentType: 'application/json',
});

module.exports.match = async (event) => {
  console.log(event);

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
      s3FieldParams(id, data)
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
