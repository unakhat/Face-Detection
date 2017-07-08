/**
 * @version 1.1.0
 * @author <a href="mailto:info@keylemon.com">KeyLemon</a>
 * @description Create an instance of the wrapper
 * @class The main class of the wrapper
 * @constructor
 * @param {String} username The KeyLemon API username
 * @param {String} clientKey The KeyLemon API key
 * @param {String} entryPointURL The URL of the server (ie : https://api.keylemon.com)
 * @throws {Error} Missing arguments to initialize API
 * @throws {Error} Not allowed to use the API
 */
var KlAPI = function(username, clientKey, entryPointURL, entryPointPort, verifySSL) {

	// check the parameters
	if (!isDefined(username) || !isDefined(clientKey))
		throw new Error('Missing arguments to initialize API')

		// user credentials
	var key = clientKey
	var user = username
	var base64Auth =  new Buffer(user + ':' + key).toString('base64')

	// entry point url
	var SERVER_URL = null
	var ENTRY_POINT = "/api/"

	if (!isDefined(entryPointURL))
		this.SERVER_URL = "https://api.keylemon.com"
	else
		this.SERVER_URL = entryPointURL

    if(!isDefined(entryPointPort))
        this.SERVER_PORT = 443
    else
        this.SERVER_PORT = entryPointPort

    if(!isDefined(verifySSL))
    	this.verifySSL = true
    else
    	this.verifySSL = verifySSL

	/***********************************************************************
	 * METHOD FOR FACE MANAGEMENT
	 **********************************************************************/

	/**
	 * @description Get an existing face by the id
	 * @param {String} faceId The id of the face
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for getFace function
	 */
	this.getFace = function(faceId, properties, callback) {
		if (!isDefined(faceId) || !isDefined(callback))
			throw new Error('Missing arguments for getFace function')

		var params = {}
		if (isDefined(properties) && properties){
			params.properties = properties
		}

		getFaceLink.request(faceId, params, null, callback)

	}

	/**
	 * @description Detect faces from image url or image data
	 * @param {Array[String]} urls Images urls
	 * @param {Array[Buffer]} datas Images data
	 * @param {function(errors, data)} success The success callback function
	 * @throws {Error} Missing arguments for detectFacesFromUrl function
	 * @throws {Error} The argument must be an array
	 */
	this.detectFaces = function(urls, datas, properties, callback) {

		var params = {}
		if(assertArray(urls)){
			urls = createListFromArray(urls)
			params.urls = urls == null ? '' : urls
		}

		if (isDefined(properties) && properties){
			params.properties = properties + ""
		}

		postFaceLink.request(null, params, isDefined(datas) ? datas : null , callback)
	}

	/***************************************************************************
	 * METHOD FOR FACEMODEL MANAGEMENT
	 **************************************************************************/

	/**
	 * @description Create a FaceModel from images or faces
	 * @param {Array[String]} imagesUrl The array of url pointing to an image
	 * @param {Array[Buffer]} imagesData The array of images data
	 * @param {Array[String]} facesId The array of faces id
	 * @param {String} name The name of the model (optional, set to null to use default value)
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for createModel function
	 * @throws {Error} The arugment must be an array
	 */
	this.createModel = function(imagesUrl, imagesData, facesId, name, callback) {

		if (!isDefined(callback))
			throw new Error('Missing arguments for createModel function')

		if(assertArray(imagesUrl))
			imagesUrl = createListFromArray(imagesUrl)
		if(assertArray(imagesData))
		if(assertArray(facesId))
			facesId = createListFromArray(facesId)

		postModelLink.request(null, {
			'urls' : (imagesUrl == null ? '' : imagesUrl),
			'faces' : (facesId == null ? '' : facesId),
			'name' : (name == null ? '' : name)
		}, isDefined(imagesData) ? imagesData : null, callback)

	}

	this.createSpeakerModel = function(urls, sampleData, name, callback) {

		if(isArray(urls))
			urls = createListFromArray(urls)

		postSpeakerModelLink.request(null, {
			'urls' : (urls == null ? '' : urls),
			'name' : (name == null ? '' : name)
		}, isDefined(sampleData) ? sampleData : null, callback)

	}

	/**
	 * @description Get an existing model with by the id
	 * @param {String} modelId The id of the face
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for getModel function
	 */
	this.getModel = function(modelId, callback) {
		if (!isDefined(modelId) || !isDefined(callback))
			throw new Error('Missing arguments for getModel function')

		getModelLink.request(modelId, {}, null, callback)
	}

	/**
	 * @description List existing models
	 * @param {function(Array[FaceModel])} callback The callback function
	 * @throws {Error} Missing arguments for getModel function
	 */
	this.listModels = function(offset, limit, modality, callback) {
		if (!isDefined(callback))
			throw new Error('Missing arguments for listModels function')

		getModelLink.request(null, {
			'offset' : (offset == null ? '' : offset),
			'limit' : (limit == null ? '' : limit),
			'modality' : (modality == null ? '' : modality)
		}, null, callback)
	}

	/**
	 * @description Edit the name of a model
	 * @param {String} modelId The model id
	 * @param {String} name The name of the model
	 * @param {function(errors, data)} callback The callback function
	 */
	this.editModelName = function(modelId, name, callback) {

		if (!isDefined(modelId) || !isDefined(name) || !isDefined(callback))
			throw new Error('Missing arguments for editModelName function')

		putModelLink.request(modelId, {
			'name' : name
		}, null, callback)
	}

	/**
	 * @description Perform face recognition
	 * @param {Array[String]} imagesUrl The images url containing the face to test
	 * @param {Array[Buffer]} imagesData The images data containing the face to test
	 * @param {Array[String]} facesId The faces to test
	 * @param {Array[String]} modelsId The models to test the faces again
	 * @param {function(errors, data)} callback The callback function
	 * @param {integer} maxResult The maximum result returned (optional : set to null to use default value)
	 * @throws {Error} Missing arguments for recognize function
	 * @throws {Error} The arugments must be an array
	 */
	this.recognize = function(params, callback) {
		var postParameters = {};

		if(isDefined(params.imagesUrl)){
			if(isArray(params.imagesUrl)){
				postParameters.urls = createListFromArray(params.imagesUrl)
			}else{
				postParameters.urls = params.imagesUrl
			}
		}
		if(isDefined(params.facesId)){
			if(isArray(params.facesId)){
				postParameters.faces = createListFromArray(params.facesId)
			}else{
				postParameters.faces = params.facesId
			}
		}
		if(isDefined(params.modelsId)){
			if(isArray(params.modelsId)){
				postParameters.models = createListFromArray(params.modelsId)
			}else{
				postParameters.models = params.modelsId
			}
		}
		if(isDefined(params.mean))
			postParameters.mean = params.mean
		if(isDefined(params.max_result))
			postParameters.max_result = params.max_result
		if(isDefined(params.async))
			postParameters.async = params.async

		recognizeLink.request(null, postParameters, isDefined(params.imagesData) ? params.imagesData : null, callback)
	}

	this.getStatus = function(statusId, callback) {

		if (!isDefined(statusId))
			throw new Error('Missing arguments for getStatus function')

		getStatusLink.request(statusId, {}, null, callback)
	}

	this.getStatusResult = function(statusId, callback) {

		if (!isDefined(statusId))
			throw new Error('Missing arguments for getStatusResult function')

		getStatusResultLink.request(statusId, {}, null, callback)
	}

	/**
	 * @description Adapt the FaceModel with new faces
	 * @param {String} modelId The model id to adapt
	 * @param {Array[String]} imagesUrl The images url containing the face to add
	 * @param {Array[Buffer]} imagesData The images data containing the face to add
	 * @param {Array[String]} facesId The faces id used to adapt model
	 * @param {function(errors, data)} callback the callback function
	 * @throws {Error} Missing arguments for adaptFaceModel function
	 * @throws {Error} The first arugment must be an array
	 */
	this.adaptModel = function(modelId, imagesUrl, imagesData, facesId, callback) {

		if (!isDefined(modelId) || !isDefined(callback))
			throw new Error('Missing arguments for adaptFaceModel function')

		if(assertArray(imagesUrl))
			imagesUrl = createListFromArray(imagesUrl)
		if(assertArray(imagesData))
		if(assertArray(facesId))
			facesId = createListFromArray(facesId)

		postModelLink.request(modelId, {
			'faces' : (facesId == null ? '' : facesId),
			'urls' : (imagesUrl == null ? '' : imagesUrl)
		}, isDefined(imagesData) ? imagesData : null, callback)

	}

	/**
	 * @description Delete the model by the id
	 * @param {String} modelId The model id
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for adaptFaceModel function
	 */
	this.deleteModel = function(modelId, callback) {

		if (!isDefined(modelId) || !isDefined(callback))
			throw new Error('Missing arguments for adaptFaceModel function')

		var modelId = createListFromArray(modelId)

		deleteModelLink.request(modelId, {}, null, callback)
	}

	/***************************************************************************
	 * METHOD FOR GROUP MANAGEMENT
	 **************************************************************************/

	/**
	* @description Get a group from the id
	* @param {string} groupId The id of the group
	* @param {function(errors, data)} callback The callback function
	* @throws {Error} Missing arguments for createGroup function
	*/
	 this.getGroup = function(groupId, callback){

	 	if(!isDefined(groupId) || !isDefined(callback))
	 		throw new Error('Missing arguments for getGroup function')

	 	getGroupLink.request(groupId, {}, null, callback)

	 }

	/**
	 * @description Create a group
	 * @param {Array[String]} modelsId The array of id of FaceModel to add
	 * @param {String} name The name of the group (optional, set to null to use default value)
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for createGroup function
	 * @throws {Error} The first arugment must be an array
	 */
	this.createGroup = function(modelsId, name, callback) {

		if (assertArray(modelsId))
			modelsId = createListFromArray(modelsId)

		postGroupLink.request(null, {
			'models' : (modelsId == null ? '' : modelsId),
			'name' : (name == null? '' : name)
		}, null, callback)
	}

	/**
	 * @description Get an existing group by the id
	 * @param {String} groupId The id of the model to get
	 * @param {Integer} limit The number of model to get (20 by default)
	 * @param {Integer} offset The offset (0 by default)
	 * @param {function(Array[Group])} callback The callback function
	 * @throws {Error} Missing arguments for getModelsInGroup function
	 */
	this.listModelsInGroup = function(groupId, limit, offset, callback) {

		if (!isDefined(groupId) || !isDefined(callback))
			throw new Error('Missing arguments for listModelsInGroup function')

		if(!isDefined(limit))
			limit = 20
		if(!isDefined(offset))
			offset = 0

		getGroupLink.request(groupId, {
			'limit' : limit,
			'offset' : offset
		}, null, callback)
	}

	/**
	 * @description List existing group
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for getGroupInfo function
	 */
	this.listGroups = function(offset, limit, callback) {

		if (!isDefined(callback))
			throw new Error('Missing arguments for listGroups function')

		getGroupLink.request(null, {
			'offset' : (offset == null ? '' : offset),
			'limit' : (limit == null ? '' : limit),
		}, null, callback)

	}

	this.addMemberToGroup = function(groupId, modelsId, groupsId, identitiesId, callback){
		var postParameters = {};
		if (isDefined(modelsId)){
			if (isArray(modelsId)){
				modelsId = createListFromArray(modelsId)
			}
			postParameters['models'] = modelsId;
		}
		if (isDefined(groupsId)){
			if (isArray(groupsId)){
				groupsId = createListFromArray(groupsId)
			}
			postParameters['groups'] = groupsId;
		}
		if (isDefined(identitiesId)){
			if (isArray(identitiesId)){
				identitiesId = createListFromArray(identitiesId)
			}
			postParameters['identities'] = identitiesId;
		}

		postGroupLink.request(groupId, postParameters, null, callback)
	}

	this.removeMemberFromGroup = function(groupId, memberId, callback){
        deleteGroupLink.request(groupId + "/" + memberId, {}, null, callback)
	}

	/**
	 * @description Add a new FaceModel into a Group
	 * @param {String} groupId The id of the group
	 * @param {Array[String]} modelsId The array of FaceModel to add
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for addModelsToGroup function
	 * @throws {Error} The first arugments must be an array
	 */
	this.addModelsToGroup = function(groupId, modelsId, callback) {
		this.addMemberToGroup(groupId, modelsId, null, null, callback)
	}

	/**
	 * @description Delete a group
	 * @param {String} groupId The id of the group to delete
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for deleteGroup function
	 */
	this.deleteGroup = function(groupId, callback) {

		if (!isDefined(groupId), !isDefined(callback))
			throw new Error('Missing arguments for deleteGroup function')

		deleteGroupLink.request(groupId, {}, null, callback)
	}

    /**
     * @description Remove a FaceModel of a group
     * @param {String} groupId The id of the group
     * @param {String} modelId The model id to remove
     * @param {function(errors, data)} callback The callback function
     * @throws {Error} Missing arguments for removeModelFromGroup function
     * @throws {Error} The first arugments must be an array
     */
    this.removeModelFromGroup = function(groupId, modelId, callback) {
		this.removeMemberFromGroup(groupId, modelId, callback)
    }

	/**
	 * @description Edit the name of a group
	 * @param {String} groupId The group id
	 * @param {String} name The name of the group
	 * @param {function(errors, data)} callback The callback function
	 */
	this.editGroupName = function(groupId, name, callback) {
		putGroupLink.request(groupId, { 'name' : name }, null, callback)
	}

	/**
	 * @description Create an identity
	 * @param params.modelsId The comma separated models ids
	 * @param params.name The identity name
	 * @param params.urls Public urls of images or audio samples
	 * @param params.faces Face ids to use if modality is face
	 * @param params.data Uploaded data of images or audio samples
	 * @param params.modality If creating an identity with data, the modality to use (speaker or face)
	 */
	this.createIdentity = function(params, callback) {
		var postParameters = {};
		var modelsId = null;

		if(isDefined(params.name)){
			postParameters.name = params.name
		}
		if(isDefined(params.urls)){
			if (isArray(params.urls)){
				postParameters.urls = createListFromArray(params.urls)
			}else{
				postParameters.urls = params.urls
			}
		}
		if(isDefined(params.modelsId)){
			if (isArray(params.modelsId)){
				postParameters.models = createListFromArray(params.modelsId)
			}else{
				postParameters.models = params.modelsId
			}
		}
		if(isDefined(params.faces)){
			if (isArray(params.faces)){
				postParameters.faces = createListFromArray(params.faces)
			}else{
				postParameters.faces = params.faces
			}
		}

		var link = postIdentityLink;

		if(isDefined(params.modality) && params.modality === "face"){
			link = postIdentityFaceLink
		}
		if(isDefined(params.modality) && params.modality === "speaker"){
			link = postIdentitySpeakerLink
		}

		link.request(null, postParameters, null, callback)
	}

	/**
	 * @description Edit the name of an identity
	 * @param {String} identityId The identity id
	 * @param {String} name The name of the identity
	 * @param {function(errors, data)} callback The callback function
	 */
	this.editIdentityName = function(identityId, name, callback) {
		putIdentityLink.request(identityId, { 'name' : name }, null, callback)
	}

	/**
	 * @description Delete an identity
	 * @param {String} identityId The id of the identity to delete
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for deleteIdentity function
	 */
	this.deleteIdentity = function(identityId, callback) {

		if (!isDefined(identityId), !isDefined(callback))
			throw new Error('Missing arguments for deleteIdentity function')

		deleteIdentityLink.request(identityId, {}, null, callback)
	}

	/**
	 * @description List existing identities
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for getIdentityInfo function
	 */
	this.listIdentities = function(offset, limit, callback) {

		if (!isDefined(callback))
			throw new Error('Missing arguments for listIdentities function')

		getIdentityLink.request(null, {
			'offset' : (offset == null ? '' : offset),
			'limit' : (limit == null ? '' : limit),
		}, null, callback)

	}

	/**
	 * @description Add a new FaceModel into an Identity
	 * @param {String} identityId The id of the identity
	 * @param {Array[String]} modelsId The array of FaceModel/SpeakerModel to add
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for addModelsToIdentity function
	 * @throws {Error} The first arugments must be an array
	 */
	this.addModelsToIdentity = function(identityId, modelsId, callback) {

		if (!isDefined(identityId))
			throw new Error('Missing arguments for addModelsToIdentity function')

		if (assertArray(modelsId))
			modelsId = createListFromArray(modelsId)

		postIdentityLink.request(identityId, {
			'models' : modelsId
		}, null, callback)
	}

    /**
     * @description Remove a FaceModel/Speaker from an identity
     * @param {String} identityId The id of the identity
     * @param {String} modelId The model id to remove
     * @param {function(errors, data)} callback The callback function
     * @throws {Error} Missing arguments for removeModelFromIdentity function
     * @throws {Error} The first arugments must be an array
     */
    this.removeModelFromIdentity = function(identityId, modelId, callback) {

        if (!isDefined(identityId) || !isDefined(modelId) || !isDefined(callback))
            throw new Error( 'Missing arguments for removeModelFromIdentity function')

        deleteIdentityLink.request(identityId + "/" + modelId, {}, null, callback)
    }

	/**
	 * @description Open a new stream to test a model
	 * @param {String} modelId The model id to test
	 * @param {function(errors, data)} callback The callback function
	 */
	this.openNewStream = function(modelId, callback){

		if(!isDefined(modelId || !isDefined(callback)))
			throw new Error('Missing arguments for openNewStream function')

		postStreamLink.request(null, {
			'model' : modelId
		}, null, callback)
	}

	/**
	 * @description Post a new image on the stream (should not be used through the wrapper)
	 * @param {String} streamId The stream id
	 * @param {String} imageData The data of the image to send encoded in base64
	 * @param {function(errors, data)} callback The callback function
	 */
	this.postNewImage = function(streamId, imageData, callback){

		if(!isDefined(streamId) || !isDefined(imageData))
			throw new Error('Missing arguments for postNewImage function')

		postStreamLink.request(streamId, {
			'image' : imageData
		}, null, callback)

	}

	/**
	 * @description Get the state of the stream
	 * @param {String} streamId The stream id
	 * @param {function(errors, data)} callback The callback function
	 */
	this.getStreamState = function(streamId, callback){

		if(!isDefined(streamId) || !isDefined(callback))
			throw new Error('Missing arguments for getStreamState function')

		getStreamLink.request(streamId, {}, null, callback)
	}

	this.getImage = function(imageId, callback) {
		getImageLink.requestFile(imageId, {}, callback)
	}

	/***************************************************************************
	 * METHOD FOR ADMIN MANAGEMENT
	 **************************************************************************/

	/**
	 * @description Get the usage of the account
	 * @param {function(errors, data)} callback The callback function
	 * @throws {Error} Missing arguments for getUsage function
	 */
	this.getUsage = function(callback) {

		if (!isDefined(callback))
			throw new Error('Missing arguments for getUsage function')

		getUsageLink.request(null, {}, null, callback)
	}

	/**
	 * @private
	 * @description Create a String list (values seperated by a comma) from an array of string
	 * @param {Array[String]} objects The array to tranform
	 * @return {String} The string list
	 */
	function createListFromArray(objects) {

		if(objects == null)
			return ''

		if(Object.prototype.toString.call( objects ) === '[object String]' ) {
           return objects
		}

		var objectList = ""

		for ( var i = 0; i < objects.length; i++)
			objectList += objects[i] + ','

		objectList = objectList.substring(objectList.length - 1, objectList)

		return objectList
	}

	function assertArray(object){
		if(isDefined(object))
			if( object instanceof Array)
				return true
			else
				throw new Error('The argument must be an array')
		else
			return false;

	}


	/*
	 * @private @description Determine if an object is set correctly @params
	 * {Object} objet The object to test @returns {Boolean} True if the object
	 * is set, false otherwise
	 */
	function isDefined(object) {
		return (typeof object != "undefined" && object != undefined)
	}

	function isArray(object){
		return Object.prototype.toString.call( object ) === '[object Array]'
	}

	var RelationLink = require('./relationlink.js')

	/*
	 * API INITIALIZATION
	 */

	// initialize link
	var getFaceLink = 	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'face/', 'GET', this.verifySSL)
	var postFaceLink =	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'face/', 'POST', this.verifySSL)

	var getModelLink = 	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'model/', 'GET', this.verifySSL)
	var postModelLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'model/', 'POST', this.verifySSL)
	var postSpeakerModelLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'speaker/model/', 'POST', this.verifySSL)
	var putModelLink = 	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'model/', 'PUT', this.verifySSL)
	var deleteModelLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'model/', 'DELETE', this.verifySSL)

	var getGroupLink = 	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'group/', 'GET', this.verifySSL)
	var postGroupLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'group/', 'POST', this.verifySSL)
	var putGroupLink = 	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'group/', 'PUT', this.verifySSL)
	var deleteGroupLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT	+ 'group/', 'DELETE', this.verifySSL)

	var recognizeLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'recognize/', 'POST', this.verifySSL)
	var getStatusLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'status/', 'GET', this.verifySSL)
	var getStatusResultLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'status/{0}/result/', 'GET', this.verifySSL)
	var getUsageLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'infos/', 'GET', this.verifySSL)
	var getStreamLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'stream/', 'GET', this.verifySSL)
	var postStreamLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'stream/', 'POST', this.verifySSL)

	var getIdentityLink = 	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'identity/', 'GET', this.verifySSL)
	var postIdentityLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'identity/', 'POST', this.verifySSL)
	var postIdentityFaceLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'identity/face/', 'POST', this.verifySSL)
	var postIdentitySpeakerLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'identity/speaker/', 'POST', this.verifySSL)
	var putIdentityLink = 	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'identity/', 'PUT', this.verifySSL)
	var deleteIdentityLink = new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT	+ 'identity/', 'DELETE', this.verifySSL)

	var getImageLink = 	new RelationLink(base64Auth, this.SERVER_URL, this.SERVER_PORT, ENTRY_POINT + 'image/', 'GET', this.verifySSL)

}

exports.KlAPI = KlAPI
