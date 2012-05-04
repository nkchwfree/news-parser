var request = require('request');
var argv = require('optimist').argv;
var mysql = require('mysql');

var config = require('./config/config').config;
var client = mysql.createClient( config.mysql );
var url = argv.url;
var data = {};

if(argv.id) {
    //ɾ������������������
    client.query('DELETE FROM test_case WHERE id = ?', [ argv.id ], function(err, results) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('ɾ���ɹ�');
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
            var parser = require("./lib/parser").parser;
            parser(body, data, function(error, match){
                console.log(match.title);
                console.log('---------------------');
                console.log(match.content);
                console.log('---------------------');
                console.log(match);

                //��ӵ�����������
                if(argv.add=="1") {
                    client.query('INSERT INTO test_case SET url = ?, html_content = ?, content = ?, title = ?', [ url, body, match.content, match.title ], function(err, results) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log('��ӳɹ�');
                            console.log(results.insertId);
                        }
                        process.exit();
                    });
                }
            });
        }
    });
}