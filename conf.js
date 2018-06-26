"use strict";
module.exports = {
    //not using http protocol ! an example like ; www.domain.com or IP address
    systemUrl:'api.hakkisabah.com',
    endpoint:{
        datarequest:'/test',
    },
    mongo: {
        development: {
            host: '127.0.0.1',
            db: 'testdata',
            port: 27017
        },
        production: {
            user:'testdata1:',
            pass:'testdata1@',
            db: 'testdatahakkisabah',
            port:63660,
            host:'ds263660.mlab.com'
        }
    },
}