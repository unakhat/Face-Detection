'use strict';

const Joi = require('joi');
const serviceHandler = require('../../handlers/facebiometric/faceModelHandler');

module.exports = {
  handler: function(request, reply){
    serviceHandler.handler(request, reply);
  },
  description: 'Biometric Service',
  notes: 'URL of all for specific models',
  tags: ['api'],
  validate: {
    payload: {
      imgURLs : Joi.array().items(Joi.string().required()), // array of strings
      modelName : Joi.string().required()
    }
  }
};
