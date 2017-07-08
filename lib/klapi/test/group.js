var assert = require('assert');
var async = require('async');

var klapi = require("../klapi");
var cons = require('./constants');

describe('Group', function(){

    var api;

    beforeEach(function(){
        api = new klapi.KlAPI(cons.creds.username, cons.creds.apikey, cons.creds.host, cons.creds.port, cons.creds.verifySSL);
    })

    describe('createGroup, editGroupName', function(){
        var groupId;
        it('should create a group and rename it', function(done){
            async.series([
                function(callback){
                    api.createGroup(null, 'some name', function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.name, 'some name');
                        groupId = res.group_id;
                        callback();
                    });
                },
                function(callback){
                    api.editGroupName(groupId, 'new name', function(error, res){
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

    describe('createGroup, addModelsToGroup, removeModelFromGroup, deleteGroup', function(){
        var modelId1;
        var modelId2;
        var groupId;
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

        it('should create a group then add and remove model then delete it', function(done){
            async.series([
                function(callback){
                    api.createGroup([modelId1], 'some group', function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 1);
                        assert.equal(res.name, 'some group');
                        groupId = res.group_id;
                        callback();
                    });
                },
                function(callback){
                    api.addModelsToGroup(groupId, [modelId2], function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 2);
                        assert.equal(res.name, 'some group');
                        callback();
                    });
                },
                function(callback){
                    api.removeModelFromGroup(groupId, [modelId2], function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 1);
                        assert.equal(res.name, 'some group');
                        callback();
                    });
                },
                function(callback){
                    api.deleteGroup(groupId, function(error, res){
                        assert.equal(false, error);
                        callback();
                    });
                }
            ], function(err, res){
               done(); 
            })
        })
    })

    describe('addMemberToGroup, removeMemberFromGroup', function(){
        var modelId1;
        var modelId2;
        var groupId1;
        var groupId2;
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
                },
                function(callback){
                    api.createGroup([modelId1], "group 1", function(error, res){
                        assert.equal(false, error);
                        groupId1 = res.group_id;
                        callback();
                    })
                },
                 function(callback){
                    api.createIdentity({ name : 'identity' }, function(error, res){
                        assert.equal(false, error);
                        identityId = res.identity_id;
                        callback();
                    });
                },   
            ], function(err, res){
                done();
            })
        })

        it('should create a group then add and remove member from it', function(done){
            async.series([
                function(callback){
                    api.createGroup([modelId1], 'group 2', function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 1);
                        groupId2 = res.group_id;
                        callback();
                    });
                },
                function(callback){
                    api.addMemberToGroup(groupId2, [modelId2], null, null, function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 2);
                        assert.equal(res.nb_groups, 0);
                        assert.equal(res.nb_identities, 0);
                        assert.equal(res.name, 'group 2');
                        callback();
                    });
                },
                function(callback){
                    api.addMemberToGroup(groupId2, null, [groupId1], null, function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 2);
                        assert.equal(res.nb_groups, 1);
                        assert.equal(res.nb_identities, 0);
                        assert.equal(res.name, 'group 2');
                        callback();
                    });
                },
                function(callback){
                    api.addMemberToGroup(groupId2, null, null, [identityId], function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 2);
                        assert.equal(res.nb_groups, 1);
                        assert.equal(res.nb_identities, 1);
                        assert.equal(res.name, 'group 2');
                        callback();
                    });
                },
                function(callback){
                    api.removeMemberFromGroup(groupId2, modelId1, function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 1);
                        assert.equal(res.nb_groups, 1);
                        assert.equal(res.nb_identities, 1);
                        assert.equal(res.name, 'group 2');
                        callback();
                    });
                },
                function(callback){
                    api.removeMemberFromGroup(groupId2, groupId1, function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 1);
                        assert.equal(res.nb_groups, 0);
                        assert.equal(res.nb_identities, 1);
                        assert.equal(res.name, 'group 2');
                        callback();
                    });
                },
                function(callback){
                    api.removeMemberFromGroup(groupId2, identityId, function(error, res){
                        assert.equal(false, error);
                        assert.equal(res.nb_models, 1);
                        assert.equal(res.nb_groups, 0);
                        assert.equal(res.nb_identities, 0);
                        assert.equal(res.name, 'group 2');
                        callback();
                    });
                },
            ], function(err, res){
               done(); 
            })
        })
    })

    describe('listGroups', function(){
       it('should list groups', function(done){
            api.listGroups(null, null, function(error, res){
                assert.equal(false, error);
                assert.notEqual(typeof res.nb_groups, 'undefined');
                assert.notEqual(typeof res.groups, 'undefined');
                done();
            })
       })
    })
})