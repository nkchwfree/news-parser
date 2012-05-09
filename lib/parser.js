var exec = require('child_process').exec;
var config = require('../config/config').config;



function getWindow(content, data, cb) {
    var strategy = 'default';

    content = content.replace(/<\/(strong|em|i|font)>/g,'').replace(/<(strong|em|i|font)( +[^<>]*)?>/g,'');
    content = content.replace(/document.write(ln)?\('<script /g,'');

    var match;
    var encoding = "binary";
    if(match = content.match(/charset=(utf-8)/i)) {
        //encoding = 'utf8';//match[1];
    }
    //console.log(encoding);
    var buffer = new Buffer(content, encoding);
    exec(config.php+' '+__dirname+'/../script/tidy.php '+strategy, {maxBuffer:1024*1024},function(error, body, stderr){
        if ( !error ) {
            //console.log(body);
            //body = body.replace(/document.writeln\('<script /g,'');
            //return;
            var jsdom = require('jsdom');
            jsdom.env(body, [__dirname+'/../script/jquery-1.7.2.min.js'], function(errors, window) {
                if( errors ){
                    //console.log('jsdom-error:'+errors);
                    cb('jsdom-error:'+errors);
                }
                else {
                    window.__stopAllTimers();
                    cb(null, window);
                }
            });
        }
        else {
          cb('tidy-error:'+error);
        }
    }).stdin.end( buffer );
}

function parseDetail(content, data, cb) {
    getWindow(content, data, function(error, window){
        if (error) {
            console.log(error);
            return;
        }

        var matcher = require('./matcher');
        matcher.match( window, {}, function(err, match){
            if(err) {
                console.log(err);
                return;
            }

            cb(null, match);
        });
    });
}

exports.getWindow = getWindow;
exports.parseDetail = parseDetail;