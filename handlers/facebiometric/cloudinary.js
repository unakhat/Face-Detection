'use strict';

const cloudinary = require('cloudinary');
const config = require('../../config/config.js');
const Promise = require('bluebird');
const moment = require('moment');

cloudinary.config({
  cloud_name: config('CLOUDINARY_CLOUD_NAME'),
  api_key: config('CLOUDINARY_API_KEY'),
  api_secret: config('CLOUDINARY_API_SECRET')
});

var image = {};
//{x: 355, y: 410, width: 300, height: 200, crop: "crop"}
image.uploadCrop = function(file, pointx, pointy, width, height, tagName){
  return new Promise(function(resolve,reject){
    cloudinary.uploader.upload(
      file,
      function(result) {
        return resolve(result);
      },
      {
        public_id: `IMG_${moment().unix()}`,
        crop: 'limit',
        eager: [
          {
            x: pointx,
            y: pointy,
            width: width,
            height: height,
            crop: 'crop'
          }
        ],
        tags: [tagName]
      }
    );
  });
}

image.upload = function(file, tagName){
  return new Promise(function(resolve,reject){
    cloudinary.uploader.upload(
      file,
      function(result) {
        return resolve(result);
      },
      {
        public_id: `IMG_${moment().unix()}`,
        crop: 'limit',
        tags: [tagName]
      }
    );
  });
}

image.delete = function(publicId){
  return new Promise(function(resolve, reject){
    cloudinary.uploader.destroy(
      publicId,
      function(result){
        if(result){
          if(result.result === 'ok'){
            return resolve('ok');
          }
        }
        return reject(new Error('Cloudinary File Delete Failed!'));
      }
    );
  });
}

module.exports = image;
