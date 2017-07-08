'use strict'
const config = require('../../config/config.js');
const easyimg = require('easyimage');

var image = {};

image.cropImage = function(filname,pointx, pointy, cropwidth, cropheight){
  return easyimg.crop({
    src: filname,
    dst: filname,
    cropwidth: cropwidth,
    cropheight: cropheight,
    x: pointx,
    y: pointy,
    gravity: 'North'
  }).then(function(image) {
    console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
  },
  function (err) {
    console.log(err);
  });
}

module.exports = image;
