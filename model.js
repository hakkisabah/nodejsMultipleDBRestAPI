"use strict";

const mongoose = require('mongoose');


var modeller = function () {
}

modeller.prototype.create = function () {
    const Schema = new mongoose.Schema({
        data: {type: String, unique: true},
    });
 return Schema;

}

module.exports = new modeller();