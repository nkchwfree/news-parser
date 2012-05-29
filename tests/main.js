var assert = require('assert');
var vows = require('vows');
var config = require('../config/config').config;
var redis = require('../lib/redis').redis;

var parse_one_page = function(content, cb){
    //console.log(content);
    var parseDetail = require("../lib/parser").parseDetail;
    parseDetail(content, {}, cb);
};

var parser = vows.describe('Parser');

redis.hvals("test_case", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        //console.log("    " + i + ": " + reply);
        var row = JSON.parse(reply);

        var obj = {};
        obj[row.url] = {
	        topic:function(){
	            parse_one_page(row.html, this.callback);
	            //console.log(row.url);
	        },
	        'content':function(error, match){
	            assert.equal(match.content, row.content);
	        },
	        'title':function(error, match){
	            assert.equal(match.title, row.title);
	        }
	    };
        parser.addBatch(obj);
    });
    parser.export(module);
    redis.quit();
});



