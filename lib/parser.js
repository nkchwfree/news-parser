var exec = require('child_process').exec;
var config = require('../config/config').config;
var jschardet = require("jschardet")



exports.parser = function(content, data, cb) {
    var strategy = 'default';

    content = content.replace(/<\/(strong|em|i|font)>/g,'').replace(/<(strong|em|i|font)( +[^<>]*)?>/g,'');

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
            //return;
            var jsdom = require('jsdom');
            jsdom.env(body, [__dirname+'/../script/jquery-1.7.2.min.js'], function(errors, window) {
                if( errors ){
                    //console.log('jsdom-error:'+errors);
                    cb('jsdom-error:'+errors);
                }
                else {
                    window.__stopAllTimers();
                    var matcher = require('./matcher');
                    matcher.match( window, data, cb);
                }
            });
        }
        else {
          cb('tidy-error:'+error);
        }
    }).stdin.end( buffer );
}