'use strict'

const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user.model');

exports.validateData = async (data) => {
    let keys = Object.keys(data), msg = '';

    for (let key of keys) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `El campo ${key} es requerido\n`;
    };
    return msg.trim();
};

exports.findUser = async (email) => {
    try {
        let userExist = await User.findOne({ email: email });
        return userExist;
    } catch (err) {
        return err;
    };
};

exports.encryptPassword = async (password) => {
    try {
        return bcrypt.hashSync(password);
    } catch (err) {
        return err;
    };
};

exports.checkPassword = async (password, hash) => {
    try {
        return bcrypt.compareSync(password, hash);
    } catch (err) {
        console.log(err);
        return err;
    };
};

