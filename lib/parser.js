var exec = require('child_process').exec;
var config = require('../config/config').config;
var Workers = require('./workers').Workers;


var workers = new Workers(config.worker_number);

function parseDetail(content, data, cb) {
    workers.send({matcher:'matcher', content:content}, function(error, match){
        if(error) {
            console.log(error);
            return;
        }

        cb(null, match);
    });
}

function parseList(content, data, cb) {
    workers.send({matcher:'matcher_list', content:content, config:data.config}, function(error, match){
        if(error) {
            console.log(error);
            return;
        }

        cb(null, match);
    });
}

exports.parseDetail = parseDetail;
exports.parseList = parseList;
