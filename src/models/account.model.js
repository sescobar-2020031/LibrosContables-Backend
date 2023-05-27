'use strict'

const mongoose = require("mongoose");

const accountSchema = mongoose.Schema({
    name: String,
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    typeAccout: String
});

module.exports = mongoose.model("Account", accountSchema);
