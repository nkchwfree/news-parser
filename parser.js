var argv = require('optimist').argv;
var develop = require('./lib/develop');

var url = argv.url;

if(argv.del==1) {
    //删除错误用例样本数据

}
else {
    develop.parseDetail(url, function(data){
        console.log(data.title);
        console.log('---------------------');
        console.log(data.content);

        //添加到测试用例中
        if(argv.add=="1") {
            var redis = require('./lib/redis').redis;
            redis.HMSET("test_case", url, JSON.stringify(data));
            redis.quit();
        }
    });
}