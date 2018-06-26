"use strict";

const express = require("express");
const data = express.Router();

const mongoose = require('mongoose');



const modelcreator = require('./modelcreator');

const readyModel = new modelcreator.returnModel()

var mysql = require('mysql');
// AWS MYSQL MARIADB on api.hakkisabah.com
var testdatainipnoara = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "testdata"
});
testdatainipnoara.connect(function(err) {
    if (err) throw err;
    console.log("testdatainipnoara Mysql has been Connected!");
});

function findOne(readyModel, query) {
    return new Promise(function (resolve, reject) {
        readyModel.findOne(query, {_id: 0}, (err, doc) => {
            if (err) {
                reject(err)
            } else {
                resolve(doc);
            }
        })
    });
}
function find (readyModel, query) {
    return new Promise(function (resolve, reject) {
        readyModel.find(query, {_id: 0}, (err, doc) => {
            if (err) {
                reject(err)
            } else {
                resolve(doc);
            }
        })
    });
}
function save (readyModel) {
    return new Promise(function (resolve, reject) {
        readyModel.save((err, doc) => {
            if (err) {
                reject(err);
            } else {
                resolve(doc);
            }
        })
    });
}

function localFindRouter(req,method,readyforsave){
    return new Promise(async function (resolve,reject) {
        if (method == 'all') {
            let findeddata = await find(readyModel,{})
           resolve(findeddata)
        }
        if (method == 'find') {
            let findeddata = await findOne(readyModel,{data:req})
            resolve(findeddata)
        }
        if (method == 'save') {
            let saveresult = await save(readyforsave)
            if (saveresult) resolve(saveresult)
        }
    })
}

function mlabRouter(req){
    return new Promise (async function(resolve,reject) {
        if (req.body.finddata == '') {
            let routeforFind = await localFindRouter(req.body.finddata,'all')
            if (routeforFind != null) resolve({"Status":"Success",data:routeforFind})
            resolve({"Status":"Error","data":"Not find anything"})
        }
        if (req.body.finddata) {
            let routeforFind = await localFindRouter(req.body.finddata,'find')
            if (routeforFind != null) resolve({"Status":"Success",data:routeforFind.data})
            resolve({"Status":"Error","data":"Not find anything"})
        }
        if (req.body.data) {

            let obj = {data:req.body.data}
            let findeddata = findOne(readyModel,obj)
            findeddata.then(async function (value) {
                if (value) {
                    resolve({"Status":"Error","message":"Data already saved"})
                }else {

                    let readyforsave = new readyModel(obj)
                    let routeforSave = await
                    localFindRouter(req.body.data, 'save', readyforsave)
                    if (routeforSave) resolve({"Status": "Success", "message": req.body.data + " saved"})
                    resolve({"Status": "Error", "message": "Save error"})
                }
            }).catch(function (reason) {
                resolve({"Status":"Error","message":"Server Error"})
            })

        }
    })

}
function queryfordb(req,opt) {
   return new Promise(function(resolve,reject){
       let whichOne = opt ? req.body.data:req.body.finddata
       let selectsql = req.body.finddata == ''?"SELECT data from  testdata":"SELECT data from  testdata WHERE data = '"+whichOne+"'";
       testdatainipnoara.query(selectsql, function (err, rows, fields) {
           if (!err) {
               if (rows.length < 1) resolve({"Status":"Error",data:"Not find anything"})
               if (rows) resolve({"Status":"Success",data:rows})
           }
           else {
               console.log('Error while performing Query.', err);
               resolve({"Status":"Error",message:"Database error"})

           }
       });
   })

}
function sqlproccess(req){
    return new Promise(function(resolve,reject){
        let val = {data:req.body.data}
        let insertsql = 'INSERT INTO testdata SET ? ';
        testdatainipnoara.query(insertsql, val, function (err, rows, fields) {
            if (!err) {
                 resolve({"Status":"Success",message:"InsertOK"})
            }
            else{
                console.log('Error while performing Query.');
                resolve({"Status":"Success",message:err})
            }
        });
    })

}


function mainRouter(req){
    return new Promise(async function(resolve,reject){
        // mongodb
        // mLab OK
        let allResult = []
        let mlabResult = await mlabRouter(req)
        if (mlabResult) {
            allResult['mlabResult'] = 'OK';
            allResult.push({mlab:mlabResult})
        }
        // mysql
        if (req.body.finddata || req.body.finddata == '') {
            let queryselectResult = await
            queryfordb(req)
            if (queryselectResult) {
                allResult['mysqlResult'] = 'OK';
                allResult.push({mysql:queryselectResult})
            }
        }
        if (req.body.data) {
            let queryselectResult = await
            queryfordb(req,'record')
            console.log(queryselectResult.Status)
            if (queryselectResult.Status == 'Success') {
                allResult['mysqlResult'] = 'OK';
                allResult.push({mysql:{"Status":"Error","message":"Data already saved"}})
            }
                if (queryselectResult.Status == 'Error')  {
                    let sqlinsertResult = await
                    sqlproccess(req);
                    if (sqlinsertResult) {
                        allResult['mysqlResult'] = 'OK';
                        allResult.push({mysql: sqlinsertResult})
                    }
            }
        }
        if (allResult.mlabResult == 'OK' && allResult.mysqlResult == 'OK') {

            resolve(allResult)
        }
    })

}
data.post("/testdata",async function (req,res) {
    if (req.body.data == '') return res.status(200).json({"Status":"Error","data":"Please enter any data"})
    if (req.body.data || req.body.finddata || req.body.finddata == '') {
        let mainresult = await
        mainRouter(req)
        if (mainresult) return res.status(200).json({"Status": mainresult})
    }
    return res.status(400).json({"Status":"Error","message":"What about ?"})
})

module.exports = data;