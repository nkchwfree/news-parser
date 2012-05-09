var argv = require('optimist').argv;
var _ = require('underscore');
var develop = require('./lib/develop');

var url = argv.url;

develop.parseList(url, function(list_data){
    //console.log(list_data);
    _.each(list_data.list, function(url){
        //console.log(url)
        develop.parseDetail(url, function(data){
            console.log(url)
            console.log(data.title);
            console.log('---------------------');
            console.log(data.content);
            console.log("======================================================================================================\n\n\n");
        });
    });
});