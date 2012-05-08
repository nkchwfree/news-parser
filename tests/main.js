var assert = require('assert');
var fs =  require('fs');
var vows = require('vows');
var mysql = require('mysql');
var config = require('../config/config').config;
var client = mysql.createClient( config.mysql );
var _ = require('underscore');
var redis = require('../lib/redis').redis;

var parse_one_page = function(content, cb){
    //console.log(content);
    var parser = require("../lib/parser").parser;
    parser(content, {}, cb);
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
/*
client.query(
    "select * FROM test_case order by id asc",
    function(error, results, fields) {
        if (error) {
            console.log(error);
            return;
        }

        _.each(results,function(row, key){
            //console.log(row);
            var obj = {};
            obj[row.id] = {
    	        topic:function(){
    	            parse_one_page(row.html_content, this.callback);
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
        client.end();
    }
);
*/



