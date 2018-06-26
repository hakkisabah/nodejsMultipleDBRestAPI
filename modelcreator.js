"use strict";

const mongoose = require('mongoose');

const modelcreator = require('./model');

const readyModeller = new modelcreator.create();

var creator = function () {

};

creator.prototype.returnModel = function () {
 return mongoose.model('testrequest',readyModeller);
}

module.exports = new creator();