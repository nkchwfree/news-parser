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
            var mysql = require('mysql');
            var config = require('./config/config').config;
            var client = mysql.createConnection( config.mysql );
            client.query(
                "INSERT INTO test_case SET url = ?, content = ?, html_content = ?, title = ?", [url,data.content, data.html, data.title],
                function(error, results, fields) {
                    console.log(error);
                    client.end();
                }
            );
        }
    });
}