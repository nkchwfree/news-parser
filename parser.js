var exec = require('child_process').exec;
var request = require('request');
var config = require('./config/config').config;
var argv = require('optimist').argv;

var url = argv.url;
var data = {};

process.on('uncaughtException', function(e){
    console.log(['uncaughtException:', e]);
});

request({ 'url' : url, 'encoding' : 'binary', 'timeout' : 50000 }, function(error, response, body) {
  if (error) {
    console.log(error);

  } else {
    var strategy = 'default';

    body = body.replace(/<\/(strong|em|i|font)>/g,'').replace(/<(strong|em|i|font)( +[^<>]*)?>/g,'');

    //console.log(body);
    exec(config.php+' '+__dirname+'/script/tidy.php '+strategy, {maxBuffer:1024*1024},function(error, body, stderr){
    if ( !error ) {
      //console.log(body);
      var jsdom = require('jsdom');
      jsdom.env(body, [__dirname+'/script/jquery-1.7.1.min.js'], function(errors, window) {
        if( errors ){
          console.log('jsdom-error:'+errors);
        } else {
          window.__stopAllTimers();
          var matcher = require('./lib/matcher');
          matcher.match( window, data, function( error, match ){
            console.log(match);
            //console.log(match.url_list.length);
            //console.log(match.content);
          });
        }
      });
    }
    else {
      console.log('tidy-error:'+error);
    }
  }).stdin.end( body, 'binary' );
  }
});













