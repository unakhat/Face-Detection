'use strict';

const Joi = require('joi');
const serviceHandler = require('../../handlers/facebiometric/faceModelCreationHandler');

module.exports = {
    handler: function(request, reply){
      serviceHandler.handler(request, reply);
    },
    description: 'Biometric Service',
    notes: 'Detecting face and creating learning model in single query.(Single file at a time.)',
    tags: ['api'],
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    validate: {
        payload: {
          file : Joi.object().meta({ swaggerType: 'file' }).optional(),
          userName : Joi.string().required()
        }
    },
    plugins: {
      'hapi-swagger': {
          payloadType: 'form'
      },
    }
};
