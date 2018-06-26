"use strict"

const configuration = require('./conf')

const datarequest = require('./data');

const mongoose = require('mongoose');

var express = require("express");
var path = require('path')
var bodyParser = require("body-parser");



var options = {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    poolSize: 10,
    bufferMaxEntries: 0
};
const url = 'mongodb://'+configuration.mongo.production.user+configuration.mongo.production.pass+configuration.mongo.production.host+':'+configuration.mongo.production.port+'/'+configuration.mongo.production.db+'';
mongoose.connect(url, options, err => console.log(err ? err : 'Mongo connected.'));

var mysql = require('mysql');


var app = express();

app.use(bodyParser.json());
app.use(function (err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        errormeessages.HTTPBody(res, 'Bad Request', 400);
    }
});

app.use(function(req,res,next){
    var _send = res.send;
    var sent = false;
    res.send = function(data){
        if(sent) return;
        _send.bind(res)(data);
        sent = true;
    };
    next();
});

app.use(configuration.endpoint.datarequest, datarequest);


app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://api.ipnoara.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();

});

var server = app.listen(process.env.PORT || 8181, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});