'use strict'

const mongoose = require("mongoose");

const accountItemSchema = mongoose.Schema({
    date: Date,
    numberItem: Number,
    accounts: [{
        account: { type: mongoose.Schema.ObjectId, ref: 'User' },
        position: String,
        amount: Number
    }],
    fullDebit: Number,
    fullCredit: Number,
    description: String
});

module.exports = mongoose.model("AccountItem", accountItemSchema);
