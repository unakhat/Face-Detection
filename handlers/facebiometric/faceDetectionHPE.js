'use strict';

var havenondemand = require('havenondemand')
const config = require('../../config/config.js');
const Promise = require('bluebird');

var client = new havenondemand.HODClient(config('HAVEN_ON_DEMAND_API_KEY'));

var service = {};

service.detectfaces = function(data){
  return new Promise(function(resolve, reject){
    client.call('detectfaces', data, function(err,resp,body){
      if(err){
        return reject(err);
      }
      return resolve(body);
    })
  });
}
module.exports = service;
/***
{
  "face": [
    {
      "left": 334,
      "top": 170,
      "width": 414,
      "height": 414
    }
  ]
}
*/
