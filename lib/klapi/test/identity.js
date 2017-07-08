var assert = require('assert');
var async = require('async');

var klapi = require("../klapi");
var cons = require('./constants');

describe('Identity', function(){

    var api;

    beforeEach(function(){
        api = new klapi.KlAPI(cons.creds.username, cons.creds.apikey, cons.creds.host, cons.creds.port, cons.creds.verifySSL);
    })

    describe('createIdentity, editIdentityName', function(){
        var identityId;
        it('should create a identity and rename it', function(done){
            async.series([
                function(callback){
                    api.createIdentity({ name : 'some name' }, function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.name, 'some name');
                        identityId = res.identity_id;
                        callback();
                    });
                },
                function(callback){
                    api.editIdentityName(identityId, 'new name', function(error, res){
                        assert.equal(false, error);
                        assert.equal('new name', res.name);
                        callback();
                    })
                }
            ], function(err, result){
                done();
            })
        });
    })

    describe('createIdentity, addModelsToIdentity, removeModelFromIdentity, deleteIdentity', function(){
        var modelId1;
        var modelId2;
        var identityId;
        this.timeout(10000);

        before(function(done){
            async.series([
                function(callback){
                    api.createModel([cons.penelope_urls[0]], null, null, null, function(error, res){
                        assert.equal(false, error);
                        modelId1 = res.model_id;
                        callback();
                    })
                },
                function(callback){
                    api.createModel([cons.penelope_urls[1]], null, null, null, function(error, res){
                        assert.equal(false, error);
                        modelId2 = res.model_id;
                        callback();
                    })
                }
            ], function(err, res){
                done();
            })
        })

        it('should create a identity then add and remove model then delete it', function(done){
            async.series([
                function(callback){
                    api.createIdentity({modelsId : [modelId1], name : 'some identity'}, function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 1);
                        assert.equal(res.name, 'some identity');
                        identityId = res.identity_id;
                        callback();
                    });
                },
                function(callback){
                    api.addModelsToIdentity(identityId, [modelId2], function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 2);
                        assert.equal(res.name, 'some identity');
                        callback();
                    });
                },
                function(callback){
                    api.removeModelFromIdentity(identityId, [modelId2], function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 1);
                        assert.equal(res.name, 'some identity');
                        callback();
                    });
                },
                function(callback){
                    api.deleteIdentity(identityId, function(error, res){
                        assert.equal(false, error);
                        callback();
                    });
                }
            ], function(err, res){
               done(); 
            })
        })
    })

    describe('listIdentites', function(){
       it('should list identities', function(done){
            api.listIdentities(null, null, function(error, res){
                assert.equal(false, error);
                assert.notEqual(typeof res.nb_identities, 'undefined');
                assert.notEqual(typeof res.identities, 'undefined');
                done();
            })
       })
    })

    describe('createIdentityShortcut speaker and face', function(){
        this.timeout(10000);
        it('should create a identity and a model at the same time', function(done){
            async.series([
                function(callback){
                    api.createIdentity({ urls : [cons.penelope_urls[0]], modality : 'face' }, function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.identity_id, 'undefined');
                        assert.equal(res.nb_models, 1)
                        callback();
                    });
                },
                function(callback){
                    api.createIdentity({ urls : [cons.martin_url], modality : 'speaker' }, function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.identity_id, 'undefined');
                        assert.equal(res.nb_models, 1)
                        callback();
                    })
                }
            ], function(err, result){
                done();
            })
        });
    })
})