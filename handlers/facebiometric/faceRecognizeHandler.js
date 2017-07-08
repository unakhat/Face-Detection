'use strict';

const klapiService = require('./klapiService');
const uploads = require('./hapiSaveUploads');
const cloudinary = require('./cloudinary');

var service = {};

let modelIds = new Array();
modelIds.push('7dc58205-9735-4aef-ad83-416f7fdc0852');
modelIds.push('1842eee3-df68-4a4c-827c-b6b4f3dfb868');
modelIds.push('879e143f-b632-4363-bc40-273b579665cc');
modelIds.push('8aa62bf6-a5d1-4db7-ab0d-f343711205b8');
modelIds.push('eefea113-4896-463e-bea6-9f871f06401e');
modelIds.push('85b27095-5a90-432d-8fe7-26b47168e6cd');

service.handler = function(request, reply){
  return uploads.savefile(request)
  .then(function(file){
    //trying to send data, it is not working, need to pass imagesUrl
    //so upload it in cloudinary, then use that url.
    return cloudinary.upload(file)
    .then(function(result){
      let jsonStr = JSON.stringify(result);
      let jsonData = JSON.parse(jsonStr);
      let faces = [];
      faces.push(jsonData.url);
      return klapiService.recognizeSingleFace(faces, null)
      .then(reply)
    })
  }).catch(function(err){
    console.log(err);
    reply(err);
  });
}

service.handlerV2 = function(request, reply){
  let params = {
    ifFileOnFileSystem : false,
    fileSystemPath : null,
    ifActualImageUploaded : false,
    actualImageUploadId : null,
    isVerfied : false
  };
  return uploads.savefile(request)
  .then(function(file){
    params.ifFileOnFileSystem = true;
    params.fileSystemPath = file;
    //trying to send data, it is not working, need to pass imagesUrl
    //so upload it in cloudinary, then use that url.
    return cloudinary.upload(file)
    .then(function(result){
      try{
        let jsonStr = JSON.stringify(result);
        let jsonData = JSON.parse(jsonStr);
        let faces = [];
        faces.push(jsonData.url);
        params.ifActualImageUploaded = true;
        params.actualImageUploadId = jsonData.public_id;
        return klapiService.recognizeSingleFace(faces, modelIds)
        .then(function(klapiResult){
          deleteFiles(params);
          return reply(klapiResult);
        });
      }catch(err){
        console.log(err);
        deleteFiles(params);
        return reply(err);
      }
    })
  }).catch(function(err){
    console.log(err);
    deleteFiles(params);
    let message = {
      error : 'Internal Server Error'
    }
    return reply(err);
  });
}
/***
params = {
  ifFileOnFileSystem : false,
  fileSystemPath : null,
  ifActualImageUploaded : false,
  actualImageUploadId : null,
  isVerfied : false
}
*/
function deleteFiles(params){
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
