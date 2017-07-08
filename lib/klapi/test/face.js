var assert = require('assert');
var async = require('async');

var klapi = require("../klapi");
var cons = require('./constants');

describe('Face', function(){

    var api;

    before(function(done){
        api = new klapi.KlAPI(cons.creds.username, cons.creds.apikey, cons.creds.host, cons.creds.port, cons.creds.verifySSL);
        done();
    })

    describe('detectFaces', function(){
        it('should return a face_id and bbox', function(done){
            api.detectFaces([cons.lena_url], null, false, function(error, response){
                assert.equal(false, error);
                assert.equal(response.faces.length, 1);
                done();
            });
        });
    })

    describe('detectFaces with gender and age', function(){
        it('should return a face_id with bbox, gender and age', function(done){
            api.detectFaces([cons.lena_url], null, 'true', function(error, response){
                assert.equal(false, error);
                assert.equal(response.faces.length, 1);
                assert.equal(response.faces[0].gender, 'female');
                assert.equal(response.faces[0].age > 0, true);
                done();
            });
        });
    })

    describe('detectFaces wrong url', function(){
        this.timeout(5000);
        it('should return an error and no face', function(done){
            api.detectFaces(["http://wrong_url.toto"], null, false, function(error, response){
                assert.notEqual(false, error);
                done();
            });
        });
    })

    describe('detectFaces from disk', function(){
        it('should return a face_id and bbox', function(done){
            var request = require('request').defaults({ encoding: null });
            request.get(cons.penelope_urls[0], function (err, res, body) {
                api.detectFaces(null, [body], false, function(error, response){
                    assert.equal(false, error);
                    assert.equal(response.faces.length, 1);
                    done();
                });
            }); 
        });
    })

    describe('getFace, getImage', function(){
        var someFace;
        var imageId;
        this.timeout(5000);

        before(function(done){
            api.detectFaces([cons.lena_url], null, null, function(error, response){
                someFace = response.faces[0];
                done();
            });
        })

        it('should get a face and and image', function(done){
            async.series([
                function(callback){
                    api.getFace(someFace.face_id, false, function(error, response){
                        assert.equal(false, error);
                        assert.equal(someFace.x, response.x);
                        assert.equal(someFace.y, response.y);
                        assert.equal(someFace.w, response.w);
                        assert.equal(someFace.h, response.h);
                        assert.equal(undefined, response.gender);
                        assert.equal(undefined, response.age);
                        imageId = response.image_url.split('/');
                        imageId = imageId[imageId.length - 1];
                        callback();
                    });
                },
                function(callback){
                    api.getFace(someFace.face_id, true, function(error, response){
                        assert.equal(false, error);
                        assert.equal(someFace.x, response.x);
                        assert.equal(someFace.y, response.y);
                        assert.equal(someFace.w, response.w);
                        assert.equal(someFace.h, response.h);
                        assert.equal(response.gender, 'female');
                        assert.equal(true, response.age > 0);
                        callback();
                    });
                },
                function(callback){
                    api.getImage(imageId, function(error, res){
                        assert.equal(false, error);
//                        var fs = require('fs');
//                        fs.writeFile("image.jpg", res)
                        callback();
                    });
                }
            ], function(){
                done();
            })
        })
    })

    describe('getFace invalid', function(){
        it('should respond with a not found error', function(done){
            api.getFace("invalid_id", false, function(error, response){
                assert.notEqual(false, error);
                done();
            });
        });
    })

})

