var argv = require('optimist').argv;
var _ = require('underscore');
var develop = require('./lib/develop');
var QueueMax = require('./lib/queue_max').QueueMax;

var url = argv.url;
var baidu = argv.baidu;

function createCallback(url, queue) {
    if(queue_max.isFull()) {
        setTimeout(function(){
            createCallback(url, queue);
        }, 1000);
    }
    else {
        queue_max.add();
        develop.parseDetail(url, function(data){
            console.log(url)
            console.log(data.title);
            console.log('---------------------');
            console.log(data.content);
            console.log("======================================================================================================\n\n\n");

            queue_max.delete();
        });
    }
}

if(baidu) {
    develop.parseBaiduList(url, function(list_data){
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
}
else {
    var queue_max = new QueueMax(5, 10);

    develop.parseList(url, {path:".newslist a"}, function(list_data){
        console.log(list_data.list.length);
        _.each(list_data.list, function(url){
            console.log(url);

            createCallback(url, queue_max);
        });
    });
}