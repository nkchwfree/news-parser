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
            var newClient = require('./lib/db_mysql').newClient;
            newClient(function(client){
                client.query().insert('test_case',
                    ['url', 'content', 'html_content', 'title'],
                    [{value:url,escape:true}, {value:data.content, escape:true}, {value:data.html, escape:true}, {value:data.title, escape:true}]
                ).execute(function(error, result) {
                    if (error) {
                        console.log('ERROR: ' + error);
                        return;
                    }
                    console.log('GENERATED id: ' + result.id);
                    client.disconnect();
                });
            });
        }
    });
}