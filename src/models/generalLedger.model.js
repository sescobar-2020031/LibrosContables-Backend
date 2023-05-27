'use strict'

const mongoose = require("mongoose");

const generalLedgerSchema = mongoose.Schema({
    diaryBook: { type: mongoose.Schema.ObjectId, ref: 'DiaryBook' },
    itemLedger: [{
        name: String,
        debits: [{
            numberDiaryBook: Number,
            amount: Number
        }],
        credits: [{
            numberDiaryBook: Number,
            amount: Number
        }],
        fullDebits: Number,
        fullCredits: Number,
        balance: {
            account: Number,
            position: String
        },
        totalItemLedger: Number
    }]
});

module.exports = mongoose.model("GeneralLedger", generalLedgerSchema);
