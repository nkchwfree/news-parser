var exec = require('child_process').exec;
var config = require('../config/config').config;

function getWindow(content, cb) {

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

process.on('message', function(data) {
    //子进程的内存限制默认是64M。
    var memory_limit = config[memory_limit]||64;
    if(process.memoryUsage().rss > ( memory_limit * 1024 * 1024)) {
        process.exit();
    }

    getWindow(data.data.content, function(error, window){
        if (error) {
            //console.log(error);
            process.send( { 'key': data.key, 'error': error } );
            return;
        }

        try {
            var matcher = require('../lib/'+ data.data.matcher);
            matcher.match( window, data.data, function(err, match){
                process.send( { 'key': data.key, 'data': match, 'error': err } );
            });
        }
        catch(e) {
            console.log(e);
            process.send( { 'key': data.key, 'error': e.toString() } );
        }
    });
});
