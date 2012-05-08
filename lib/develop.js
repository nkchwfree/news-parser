var request = require('request');

exports.parseDetail = function(url, callback) {
    request({ 'url' : url, 'encoding' : 'binary', 'timeout' : 50000 }, function(error, response, body) {
        if (error) {
            console.log(error);
        }
        else {
            //console.log(body.length);
            var parser = require("./parser").parser;
            parser(body, {}, function(error, match){
                if(!error) {
                    callback({
                        url:url,
                        html:body,
                        title:match.title,
                        content:match.content
                    });
                }
                else {
                    console.log(error);
                }
            });
        }
    });
}