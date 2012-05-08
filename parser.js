var request = require('request');
var argv = require('optimist').argv;

var config = require('./config/config').config;

var url = argv.url;
var data = {};

if(argv.del==1) {
    //删除错误用例样本数据

}
else {
    request({ 'url' : url, 'encoding' : 'binary', 'timeout' : 50000 }, function(error, response, body) {
        if (error) {
            console.log(error);
        }
        else {
            //console.log(body.length);
            var parser = require("./lib/parser").parser;
            parser(body, data, function(error, match){
                if(!error) {
                    console.log(match.title);
                    console.log('---------------------');
                    console.log(match.content);
                    //console.log('---------------------');
                    //console.log(match);

                    //添加到测试用例中
                    if(argv.add=="1") {
                        var redis = require('./lib/redis').redis;
                        redis.HMSET("test_case", url, JSON.stringify({
                            url:url,
                            html:body,
                            title:match.title,
                            content:match.content
                        }));
                        redis.quit();
                    }
                }
                else {
                    console.log(error);
                }
            });
        }
    });
}