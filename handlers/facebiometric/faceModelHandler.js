'use strict';
const klapi = require('./klapiService');
var service = {};

service.handler = function(request, reply){
  let faceImages = request.payload.imgURLs;
  let modelName = request.payload.modelName;
  klapi.createModel(faceImages, modelName)
  .then(reply).catch(function(err){
    console.log(err);
    return reply(err);
  });
}

module.exports = service;
