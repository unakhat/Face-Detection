'use strict';

const klapi = require('../../lib/klapi/klapi');
const config = require('../../config/config.js');
const Promise = require('bluebird');
const api =  new klapi.KlAPI(
  config('KLAPI_USER_NAME'), config('KLAPI_API_KEY'), 'https://klws.keylemon.com');

var service = {};

service.createModel = function(faces, modelName){
  return new Promise(function(resolve, reject){
    api.createModel(
      faces, //array of faces.
      null,
      null,
      modelName,    // The name of the model
      function(errors, model){
        // check if an errors has occured
        if(errors){
          console.log(errors);
          return reject(new Error(errors));
        }
        return resolve(model);
      }
    );
  });
}
/***
* Recognize given face from given set of modelsIds
**/
service.recognizeSingleFace = function(faceUrls, modelIds){
  console.log(faceUrls);
  return new Promise(function(resolve, reject){
    api.recognize(
      {
        imagesUrl: faceUrls,
        facesId: null,      // Existing face id
        modelsId: modelIds, // The model(s) to test
        max_result: null,    // maximum resluts number (null = all)
      },
      function(errors, result) {
        if(errors){
          console.log(errors);
          if(errors[0].error_id === 13){
            let message = {
              error: 'Not a clear face.'
            }
            return resolve(message);
          }else if(errors[0].error_id === 4){
            let message = {
              error: 'Face too small too recognize.'
            }
            return resolve(message);
          }
          return reject(new Error(errors));
        }
        console.log(result);
        if(result.faces.length >= 0){
          if(result.faces[0].results.length >= 0){
            let score = result.faces[0].results[0].score;
            let name = result.faces[0].results[0].name;
            if(score >= 0.5){
              let message = {
                success: name
              }
              return resolve(message);
            }
          }
        }
        let message = {
          error: 'Authentication Failed'
        }
        return resolve(message);
      }
    )
  });
}

module.exports = service;
