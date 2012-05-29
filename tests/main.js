var assert = require('assert');
var fs =  require('fs');
var vows = require('vows');
var _ = require('underscore');

var parse_one_page = function(content, cb){
    var parseDetail = require("../lib/parser").parseDetail;
    parseDetail(content, {}, cb);
};

var parser = vows.describe('Parser');


var newClient = require('../lib/db_mysql').newClient;

newClient(function(client){
    client.query("select * FROM test_case order by id asc").execute(function(error, rows, cols) {
        if (error) {
            console.log('ERROR: ' + error);
            return;
        }
        console.log(rows.length + ' ROWS found');

        _.each(rows,function(row, key){
            //console.log(row.html_content.toString());
            //return;
            var obj = {};
            obj[row.id] = {
    	        topic:function(){
    	            parse_one_page(row.html_content.toString(), this.callback);
    	            //console.log(row.url);
    	        },
    	        'content':function(error, match){
    	            assert.equal(match.content, row.content.toString());
    	        },
    	        'title':function(error, match){
    	            assert.equal(match.title, row.title);
    	        }
    	    };
            parser.addBatch(obj);
        });

        parser.export(module);
    });
});




