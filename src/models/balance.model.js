'use strict'

const mongoose = require("mongoose");

const balanceSchema = mongoose.Schema({
    diaryBook: { type: mongoose.Schema.ObjectId, ref: 'DiaryBook' },
    accountItem: [{
        name: String,
        account: {
            position: String,
            amount: Number
        }
    }],
    fullDebit: Number,
    fullCredit: Number
});

module.exports = mongoose.model("Balance", balanceSchema);
