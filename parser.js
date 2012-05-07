var request = require('request');
var argv = require('optimist').argv;
var mysql = require('mysql');

var config = require('./config/config').config;
var client = mysql.createClient( config.mysql );
var url = argv.url;
var data = {};

if(argv.id) {
    //删除错误用例样本数据
    client.query('DELETE FROM test_case WHERE id = ?', [ argv.id ], function(err, results) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('删除成功');
        }
        process.exit();
    });
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
                        client.query(
                            "select * FROM test_case WHERE url = ?", [url],
                            function(error, results, fields) {
                                if (error) {
                                    console.log(error);
                                    client.end();
                                    return;
                                }

                                if(results.length==0) {
                                    client.query('INSERT INTO test_case SET url = ?, html_content = ?, content = ?, title = ?', [ url, body, match.content, match.title ], function(err, results) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            console.log('添加成功');
                                            console.log(results.insertId);
                                        }
                                        client.end();
                                    });
                                }
                                else {
                                    console.log("测试用例已经存在");
                                    client.end();
                                }
                            }
                        );

                    }
                }
                else {
                    console.log(error);
                }
            });
        }
    });
}