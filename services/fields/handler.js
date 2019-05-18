'use strict';
const aws = require('aws-sdk');
const http = require('http');
const crypto = require("crypto");

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*'
};

module.exports.match = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }, null, 2),
  };
};

module.exports.fieldCreate = async (event) => {
  console.log(event.body);

  try {
    const data = JSON.parse(evt.body || '{}');
    const id = crypto.randomBytes(16).toString("hex");

    return {
      statusCode: 200,
      body: JSON.stringify({
        headers: { ...CORS },
        data: {
          fieldId: id,
          status: 'OK',
        }
      }),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        headers: { ...CORS },
        data: {
          status: 'ERROR',
        }
      }),
    };

  }
};
