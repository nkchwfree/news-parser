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

var parsePage = [
	['qq1', '去年汽车销量增幅创13年新低 政策退潮致销量下滑', '']
];


client.query(
    "select * FROM test_case order by id asc",
    function(error, results, fields) {
        if (error) {
            console.log(error);
            return;
        }

        _.each(results,function(row){
            //console.log(row);
            parser.addBatch({
        	    "文章页面":{
        	        topic:function(){
        	            parse_one_page(row.html_content, this.callback);
        	        },
        	        '解析内容':function(error, match){
        	            assert.equal(match.title, row.title);
        	            assert.equal(match.content, row.content);
        	        }
        	    }
            })
        });

        parser.export(module);
    }
);




