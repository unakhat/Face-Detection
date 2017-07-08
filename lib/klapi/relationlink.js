/**
 * @private
 * @constructor
 * @description Class used to call the api link
 * @class This class links the entry point of the API with the wrapper
 * @prama {String} base64Auth The authorization encoded in base 64
 * @param {String} baseUrl The base address of the API
 * @param {String} path The address extension of the function
 * @throws {Error} Required parameters for the RelationLink of the API was not set
 */
var RelationLink = function(base64Auth, baseUrl, port, path, method, verifySSL) {

	var request = require('./httprequest.js')

	if (!isDefined(base64Auth) || !isDefined(baseUrl) || !isDefined(path))
		throw new Error(
				'Required parameters for the RelationLink of the API was not set')

	var auth = base64Auth
	var address = baseUrl
	var method = isDefined(method) ? method : 'GET'
	var rejectUnauthorized = isDefined(verifySSL) ? verifySSL : true

	/**
	 * @description Perform a http request
	 * @param {String} resource The url of the resource
	 * @param {Dictionnary} urlParams The parameters to put into the url
	 * @param {String} method The http method
	 * @param {String} files The Array of files to post
	 * @param {function(errors, data)} callback The callback function
	 */
	this.request = function(resource, urlParams, files, callback) {
		var finalPath = path;
		if(resource != null){
			if(path.indexOf("{") != -1){
				finalPath = finalPath.replace("{0}", resource)
			}else{
				finalPath = finalPath + resource + '/'
			}
		}
		request(auth, address, port, finalPath, method, urlParams, files, rejectUnauthorized, callback)
	}

	this.requestFile = function(resource, urlParams, callback){
        //var noderequest = require('request').defaults({ encoding: null });
		var connection = (baseUrl.substring(0, 5) == 'https') ? require('https') : require('http')
    	var options = {
			hostname : address.split('://')[1],
	        port : port,
			method : 'GET',
			path : path + resource + '/',
			headers : {
				'Authorization' :  'Basic ' + base64Auth,
			},
	        rejectUnauthorized : rejectUnauthorized,
		}
        connection.request(options, function (res) {
        	var data = [], dataLen = 0;
			res.on('data', function(chunk) {
				data.push(chunk);
				dataLen += chunk.length;
			})
			res.on('end', function() {
				var buf = new Buffer(dataLen);
			    for (var i=0,len=data.length,pos=0; i<len; i++) {
				    data[i].copy(buf, pos);
				    pos += data[i].length;
				}
	        	callback(false, buf);
	        })
        }).end(); 
    }

	/*
	 * @params {Object} objet The object to test @returns {Boolean} True if the
	 * object is set, false otherwise
	 */
	function isDefined(object) {
		return (typeof object != "undefined" && object != undefined)
	}
}

module.exports = RelationLink
