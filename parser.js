var request = require('request');
var argv = require('optimist').argv;

var url = argv.url;
var data = {};

request({ 'url' : url, 'encoding' : 'binary', 'timeout' : 50000 }, function(error, response, body) {
    if (error) {
        console.log(error);
    }
    else {
        var parser = require("./lib/parser").parser;
        parser(body, data, function(error, match){
            console.log(match.content);
            console.log(match);
        });
    }
});
