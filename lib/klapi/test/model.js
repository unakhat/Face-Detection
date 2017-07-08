var assert = require('assert');
var async = require('async');

var klapi = require("../klapi");
var cons = require('./constants');

describe('Model', function(){

    var api;

    beforeEach(function(){
        api = new klapi.KlAPI(cons.creds.username, cons.creds.apikey, cons.creds.host, cons.creds.port, cons.creds.verifySSL);
    })

    describe('createModel, getModel, editModelName, deleteModel', function(){
        var modelId;
        this.timeout(10000);
        it('should create a model, rename it, get it and then delete it', function(done){
            async.series([
                function(callback){
                    api.createModel([cons.penelope_urls[0]], null, null, 'some name', function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.name, 'some name');
                        modelId = res.model_id;
                        callback();
                    });
                },
                function(callback){
                    api.editModelName(modelId, 'new name', function(error, res){
                        assert.equal(false, error);
                        assert.equal('new name', res.name);
                        callback();
                    })
                },
                function(callback){
                    api.getModel(modelId, function(error, res){
                        assert.equal(false, error);
                        assert.equal('new name', res.name);
                        assert.equal(modelId, res.model_id);
                        assert.equal('face', res.modality);
                        assert.notEqual(typeof res.nb_faces, 'undefined');
                        callback();
                    })
                },
                function(callback){
                    api.deleteModel(modelId, function(error, res){
                        assert.equal(false, error);
                        callback();
                    });
                }
            ], function(err, result){
                done();
            })
        });

    })

    describe('adaptModel', function(){
        var modelId;
        this.timeout(10000);
        it('should create a model then add new faces to it', function(done){
            async.series([
                function(callback){
                    api.createModel([cons.penelope_urls[0]], null, null, 'penelope', function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.name, 'penelope');
                        assert.equal(res.modality, 'face');
                        modelId = res.model_id;
                        callback();
                    });
                },
                function(callback){
                    api.adaptModel(modelId, [cons.penelope_urls[1], cons.penelope_urls[2], cons.penelope_urls[3]], null, null, function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.name, 'penelope');
                        assert.equal(res.modality, 'face');
                        assert.equal(res.nb_faces, 4)
                        callback();
                    });
                }
            ], function(err, result){
                done();
            })
        })
    })

    describe('listModels', function(){
        it('should list models', function(done){
            async.series([
                function(callback){
                    api.listModels(null, null, null, function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.nb_models, 'undefined');
                        assert.notEqual(typeof res.models, 'undefined');
                        callback();
                    })
                },
                function(callback){
                    api.listModels(null, null, 'face', function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.nb_models, 'undefined');
                        assert.notEqual(typeof res.models, 'undefined');
                        callback();
                    })
                },
                function(callback){
                    api.listModels(null, null, 'speaker', function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.nb_models, 'undefined');
                        assert.notEqual(typeof res.models, 'undefined');
                        callback();
                    })
                }
            ], function(err, result){
                done();
            })
        })
    })

    describe('createSpeakerModel', function(){
        this.timeout(10000);
        it('should create a model from audio data', function(done){
            async.series([
                function(callback){
                    api.createSpeakerModel(cons.martin_url, null, "MLK", function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.name, 'MLK');
                        assert.equal(res.modality, 'speaker');
                        callback();
                    })
                },
            ], function(err, result){
                done();
            })
        })
    })

})