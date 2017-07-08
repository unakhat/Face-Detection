'use strict';

const Joi = require('joi');
const serviceHandler = require('../../handlers/facebiometric/faceRecognizeHandler');

module.exports = {
    handler: function(request, reply){
      serviceHandler.handler(request, reply);
    },
    description: 'HPE API Service',
    notes: 'The Face Detection API analyzes an image to find faces. It returns the position of the left and top edges of a bounding box that contains the face, and the width and height of the bounding box.',
    tags: ['api'],
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    validate: {
        payload: {
          file : Joi.object().meta({ swaggerType: 'file' }).optional()
        }
    },
    plugins: {
      'hapi-swagger': {
          payloadType: 'form'
      },
    }
};
