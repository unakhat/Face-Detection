'use strict';
const config = require('../../config/config.js');
const fs = require('fs');

var uploads = {};

uploads.savefile = function(request){
  return new Promise(function(resolve, reject){
    let data = request.payload;
    if (data.file) {
      let name = data.file.hapi.filename;
      let path = config('UPLOADS_PATH') + name;
      let file = fs.createWriteStream(path);
      file.on('error', function (err) {
        return reject(err);
      });
      data.file.pipe(file);
      data.file.on('end', function (err) {
        if(err){
          return reject(err);
        }
        return resolve(path);
      });
    }
  });
}

uploads.delete = function(filePath){
  return fs.unlink(filePath);
}

module.exports = uploads;
