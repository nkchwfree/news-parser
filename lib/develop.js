var request = require('request');

exports.parseDetail = function(url, callback) {
    request({ 'url' : url, 'encoding' : 'binary', 'timeout' : 50000 }, function(error, response, body) {
        if (error) {
            console.log(error);
            return;
        }

        //console.log(body);
        var parseDetail = require("./parser").parseDetail;
        parseDetail(body, {}, function(error, match){
            if (error) {
                console.log(error);
                return;
            }

            callback({
                url:url,
                html:body,
                title:match.title,
                content:match.content
            });
        });
    });
}


exports.parseList = function(url, callback) {
    request({ 'url' : url, 'encoding' : 'binary', 'timeout' : 50000 }, function(error, response, body) {
        if (error) {
            console.log(error);
        }
        else {
            var getWindow = require("./parser").getWindow;
            getWindow(body, {}, function(error, window){
                if (error) {
                    console.log(error);
                    return;
                }

                try{
                    var $ = window.window.$;
                    var out = {list:[]};

                    $("script,style,iframe,NOSCRIPT,input,textarea").remove();
                    $("a.r").each(function(){
                        //console.log($(this).attr('href'));
                        out.list.push($(this).attr('href'));
                    });

                    callback( out );
                }catch(e){
                    console.log(e);
                    //callback( e.toString() );
                }
            });
        }
    });
}