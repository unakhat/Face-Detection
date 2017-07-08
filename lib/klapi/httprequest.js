/**
 * @description Perform an http request
 * @param {String} entryPoint The base address for the request
 * @param {String} path The path that point to the url
 * @param {String} method The HTTP method to use for the request
 * @param {Array[String]} urlParams The array of parameter to put into the url
 * @param {Array[Buffer]} files The array of files to send to the request
 * @param {function(errors, data)} callback The function to return the response
 * @param {Array[String]} bodyParams Optional parameter to put the parameter in the body of the request
 * @throws {Error} If a required parameter was no specified
 * @throws {Error} If the http request failed
 */
var httpRequest = function(base64Auth, entryPoint, port, path, method, urlParams, files, rejectUnauthorized, callback) {

	// check the parameter
	if (!isDefined(base64Auth) || !isDefined(entryPoint) || !isDefined(urlParams) || !isDefined(callback))
		throw new Error('A required parameter for the http request was not set correctly')

	if(!isDefined(files))
		files = new Array()

	var connection = (entryPoint.substring(0, 5) == 'https') ? require('https')	: require('http')

	// Prepare the packet wrapper for the multipart
	var crlf = "\r\n"
	var boundary = '---------------------------KeyLemonPrettyUniqueBoundary'
	var delimiter = crlf + "--" + boundary
	var preamble = ""
	var epilogue = ""
	var closeDelimiter = delimiter + "--"

	var multipartBody = new Buffer(0)


	// send the data in the body
	if(method == 'POST'){

		/**
		* Send the data in the body
		*/
		for ( var key in urlParams){

			if(urlParams[key] == '')
				continue
							
			var headersForm = [	'Content-Disposition: form-data; name="' + key + '" ' + crlf ]

			multipartBody = concatBuffers(
				[
					multipartBody,
					new Buffer(preamble + delimiter + crlf + headersForm.join('') + crlf), 
					new Buffer(urlParams[key]), 
					new Buffer(closeDelimiter + epilogue)
				]
			)

		}
	}
	// send the data in the url
	else{
		// format the url parameters
		var urlParameter = prepareUrl(urlParams)
	}


	/**
	* Send the image data
	*/
	
	if(isDefined(files)){
		var headers = [	'Content-Disposition: form-data; name="fileToUpload"; filename="dummy"' + crlf ]


		for(var i = 0; i < files.length ; i++){
			multipartBody = concatBuffers(
				[
					multipartBody, 
					new Buffer(preamble + delimiter + crlf + headers.join('') + crlf), 
					files[i], 
					new Buffer(closeDelimiter + epilogue)
				]
			)
		}
	}

	var path = isDefined(path) ? path : ''
	if (isDefined(urlParameter)){
		path += urlParameter
	}

	// prepare the request header
	var options = {
		hostname : entryPoint.split('://')[1],
        port : port,
		method : isDefined(method) ? method : 'GET',
		path : path,
		headers : {
			'Authorization' :  'Basic ' + base64Auth,
			'Content-Length' :   multipartBody.length,
			'Content-Type' : 'multipart/form-data; boundary=' + boundary
		},
        rejectUnauthorized : rejectUnauthorized,
	}

	// prepare request
	var req = connection.request(options, function(response) {

		var data = ''

		response.setEncoding('utf8')

		response.on('data', function(jsonData) {
            data += jsonData
        });

        response.on('end', function(){
        	if (data != ''){
	            var jsonResponse = JSON.parse(data, null, 1)
        	}else{
	            var jsonResponse = JSON.parse('{}', null, 1)
        	}
            var jsonErrors = false;

            if(jsonResponse.hasOwnProperty('errors')){
                jsonErrors = jsonResponse.errors
                delete jsonResponse.errors
            }

            callback(jsonErrors, jsonResponse)
        })

		response.on('close', function() {
			response.emit('end')
		})
	})

	// write data parameter
	req.write(multipartBody)

	req.on('error', function(e) {
		console.log("Ajax error : " + e.message)
	})

	// execute the request
	req.end()

}

/**
 * @private 
 * @description format the URL with the parameter
 * @param {dictionary} urlParams The dictionnary containing the parameter
 * @returns {String} The formatted URL
 */
function prepareUrl(urlParams) {

	var urlString = "?"
	for ( var key in urlParams){
		if (String(urlParams[key]).length > 0 ){
			urlString += key + "=" + encodeURIComponent(urlParams[key]) + "&"
		}
	}
	urlString = urlString.substring(urlString.length - 1, urlString)
	return urlString
}

/*
 * @private
 * @params {Object} objet The object to test 
 * @returns {Boolean} True if the object is set, false otherwise
 */
function isDefined(object) {
	return (typeof object != "undefined" && object != undefined)
}

/**
 * @private 
 * @param {array[Buffer]} buffers The buffer to concat
 * @return {Buffer} The result of the concatened buffers
 */
function concatBuffers(buffers) {
    if(typeof Buffer.concat === 'undefined') {
        var length = 0,
            index = 0,
            offset,
            buffs = [];

        buffers.forEach(function(buf) {
            Buffer.isBuffer(buf) || (buf = new Buffer(buf));
            length += buf.length;
            buffs.push(buf);
        });

        buffers = new Buffer(length);

        buffs.forEach(function(buf) {
            offset = buf.length;

            buf.copy(buffers, index, 0, offset);
            index += offset;
        });

        return buffers;
    }

    return Buffer.concat(buffers);
}

module.exports = httpRequest
