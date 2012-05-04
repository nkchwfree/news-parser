var assert = require('assert');
var fs =  require('fs');
var vows = require('vows');
var mysql = require('mysql');
var config = require('../config/config').config;
var client = mysql.createClient( config.mysql );
var _ = require('underscore');

var parse_one_page = function(content, cb){
    //console.log(content);
    var parser = require("../lib/parser").parser;
    parser(content, {}, cb);
};

var parser = vows.describe('Parser');

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




