'use strict';

const uploads = require('./hapiSaveUploads');
const easyimage = require('./easyimage');
const cloudinary = require('./cloudinary');
const hpeFace = require('./faceDetectionHPE');
const moment = require('moment');
var service = {};

service.handler = function(request, reply){
  return uploads.savefile(request)
  .then(function(file){
    let fileObj = {
      file : file
    };
    return hpeFace.detectfaces(fileObj)
    .then(function(hperes){
      if(hperes.face.length > 0){
        let pointx = hperes.face[0].left;
        let pointy = hperes.face[0].top;
        let width = hperes.face[0].width;
        let height = hperes.face[0].height;
        //console.log(hperes);
        return cloudinary.uploadCrop(file, pointx, pointy, width, height)
        .then(function(result){
          let jsonStr = JSON.stringify(result);
          let jsonData = JSON.parse(jsonStr);
          return cloudinary.upload(jsonData.eager[0].url).then(reply);
        }).catch(reply);
      }
    }).catch(reply);
  });
}

service.handlerV2 = function(request, reply){
  return uploads.savefile(request)
  .then(function(file){
    let fileObj = {
      file : file
    };
    return cloudinary.upload(file)
    .then(reply).catch(reply);
  });
}

module.exports = service;
