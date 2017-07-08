var assert = require('assert');
var async = require('async');

var klapi = require("../klapi");
var cons = require('./constants');

describe('Recognize', function(){

    var api;
    var penModelId;
    var lenaModelId;
    this.timeout(30000);

    before(function(done){
        async.series([
            function(callback){
                api = new klapi.KlAPI(cons.creds.username, cons.creds.apikey, cons.creds.host, cons.creds.port, cons.creds.verifySSL);
                callback();
            },
            function(callback){
                api.createModel([cons.penelope_urls[0], cons.penelope_urls[1], cons.penelope_urls[2]], null, null, null, function(error, res){
                    assert.equal(false, error);
                    penModelId = res.model_id;
                    callback();
                })
            }, 
            function(callback){
                api.createModel([cons.lena_url], null, null, null, function(error, res){
                    assert.equal(false, error);
                    lenaModelId = res.model_id;
                    callback();
                })
            }
        ], function(err, res){
            done();
        })
    })

    describe('recognize, recognize mean', function(){
        it('should give high score to penelope but not lena', function(done){
            async.series([
                function(callback){
                    api.recognize({imagesUrl : [cons.penelope_urls[0]], modelsId : penModelId}, function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.faces, 'undefined');
                        assert.equal(res.faces[0].results[0].score > 0.5, true)
                        callback();
                    });
                },
                function(callback){
                    api.recognize({imagesUrl : [cons.lena_url], modelsId : penModelId}, function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.faces, 'undefined');
                        assert.equal(res.faces[0].results[0].score < 0, true)
                        callback();
                    });
                },
                function(callback){
                    api.recognize({imagesUrl : [cons.penelope_urls[0], cons.penelope_urls[1], cons.penelope_urls[2]], modelsId : lenaModelId}, function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.faces, 'undefined');
                        assert.equal(res.faces[0].results[0].score < 0, true)
                        callback();
                    });
                }
            ], function(err, result){
                done();
            })
        });
    })

    describe('recognize async', function(){
        var statusId;
        var status;
        it('should give reco results asynchronously', function(done){
            async.series([
                function(callback){
                    api.recognize({async : 'true', imagesUrl : [cons.penelope_urls[0]], modelsId : penModelId}, function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.status, 'undefined');
                        statusId = res.status.status_id;
                        callback();
                    });
                },
                function(callback){
                    async.whilst(
                        function () { return status != "FIN" },
                        function (whilstCallback) {
                            api.getStatus(statusId, function(error, res){
                                assert.equal(false, error);
                                status = res.status.status;
                                setTimeout(whilstCallback, 1000);
                            })
                        },
                        function (err) {
                            callback(); // This one is the async.series callback
                        }
                    );
                },
                function(callback){
                    api.getStatusResult(statusId, function(error, res){
                        assert.equal(false, error);
                        assert.notEqual(typeof res.faces, 'undefined');
                        assert.equal(res.faces.length, 1);
                        callback();
                    })
                }
            ], function(err, result){
                done();
            })
        });
    })

})