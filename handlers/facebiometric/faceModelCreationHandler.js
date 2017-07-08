'use strict';

const uploads = require('./hapiSaveUploads');
const easyimage = require('./easyimage');
const cloudinary = require('./cloudinary');
const hpeFace = require('./faceDetectionHPE');
const klapi = require('./klapiService');
var service = {};

service.handler = function(request, reply){
  let params = {
    ifFileOnFileSystem : false,
    fileSystemPath : null,
    ifActualImageUploaded : false,
    actualImageUploadId : null,
    ifCropedImageUploaded : false,
    cropedImageUploadId : null,
    learningModelCreated : false
  };
  let userName = request.payload.userName;
  /**
  * Step1 : Store File on local file system.
  * Step2 : Detect face HPE Service.
  * Step3 : Upload and Crop using cloudinary service.
  * Step4 : Upload Croped Image.
  */
  return uploads.savefile(request)
  .then(function(file){
    params.ifFileOnFileSystem = true;
    params.fileSystemPath = file;
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
        return cloudinary.uploadCrop(file, pointx, pointy, width, height, userName)
        .then(function(result){
          try{
            let jsonStr = JSON.stringify(result);
            let jsonData = JSON.parse(jsonStr);
            params.ifActualImageUploaded = true;
            params.actualImageUploadId = jsonData.public_id;
            return cloudinary.upload(jsonData.eager[0].url, userName)
            .then(function(cropResult){
              try{
                let jsonStr = JSON.stringify(cropResult);
                let jsonData = JSON.parse(jsonStr);
                params.ifCropedImageUploaded = true;
                params.cropedImageUploadId = jsonData.public_id;
                //call to klapi service
                let faceImages = [];
                faceImages.push(jsonData.url);
                let modelName = jsonData.tags[0];
                return klapi.createModel(faceImages, modelName)
                .then(function(klapiResult){
                  params.learningModelCreated = true;
                  deleteFiles(params);
                  return reply(klapiResult);
                });
              } catch(err){
                console.log(err);
                //deleteOperation
                return deleteFiles(params);
              }
            });
          }catch(err){
            console.log(err);
            //delete operation
            return deleteFiles(params);
          }
        })
      }else{ //no face found hpe service.
        //delete operation
        return deleteFiles(params);
      }
    }).catch(function(err){
      console.log(err);
      //delete opeartion
      deleteFiles(params);
      return reply(err);
    });
  });
}

service.handlerV3 = function(request, reply){
  let params = {
    ifFileOnFileSystem : false,
    fileSystemPath : null,
    ifActualImageUploaded : false,
    actualImageUploadId : null,
    ifCropedImageUploaded : false,
    cropedImageUploadId : null,
    learningModelCreated : false
  };
  let userName = request.payload.userName;
  /**
  * Step1 : Store File on local file system.
  * Step2 : Detect face HPE Service.
  * Step3 : Upload and Crop using cloudinary service.
  * Step4 : Upload Croped Image.
  */
  return uploads.savefile(request)
  .then(function(file){
    params.ifFileOnFileSystem = true;
    params.fileSystemPath = file;
    return cloudinary.upload(file, userName)
      .then(function(cropResult){
        try{
          let jsonStr = JSON.stringify(cropResult);
          let jsonData = JSON.parse(jsonStr);
          params.ifCropedImageUploaded = true;
          params.cropedImageUploadId = jsonData.public_id;
          //call to klapi service
          let faceImages = [];
          faceImages.push(jsonData.url);
          let modelName = jsonData.tags[0];
          return klapi.createModel(faceImages, modelName)
          .then(function(klapiResult){
            params.learningModelCreated = true;
            deleteFiles(params);
            return reply(klapiResult);
          });
        } catch(err){
          console.log(err);
          //deleteOperation
          return deleteFiles(params);
        }
      });
  }).catch(function(err){
    console.log(err);
    //delete opeartion
    deleteFiles(params);
    return reply(err);
  });
}

/**
* After learning over, or because of failure
* delete file from file system and cloudinary.
* param = {
  ifFileOnFileSystem : true,
  fileSystemPath : 'path',
  ifActualImageUploaded : true,
  actualImageUploadId : '',
  ifCropedImageUploaded : true,
  cropedImageUploadId : '',
  learningModelCreated : true,
}
**/
function deleteFiles(params){
  if(params.learningModelCreated === true){
    deleteFilesAfterSuccess(params);
  }else{
    deleteFilesAfterFailure(params);
  }
}

function deleteFilesAfterFailure(params){
  deleteFilesAfterSuccess(params);
  //croped file
  if(params.ifCropedImageUploaded === true){
    cloudinary.delete(params.cropedImageUploadId)
    .then(function(res){
      return;
    }).catch(function(err){
      return console.log(err);
    });
  }
}

function deleteFilesAfterSuccess(params){
  //file system
  if(params.ifFileOnFileSystem === true){
    uploads.delete(params.fileSystemPath);
  }
  //actual file
  if(params.ifActualImageUploaded === true){
    cloudinary.delete(params.actualImageUploadId)
    .then(function(res){
      return;
    }).catch(function(err){
      return console.log(err);
    });
  }
}

module.exports = service;
