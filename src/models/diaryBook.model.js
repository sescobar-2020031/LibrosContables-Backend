'use strict'

const mongoose = require("mongoose");

const diaryBookSchema = mongoose.Schema({
    month: Number,
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    accountItems: [{ type: mongoose.Schema.ObjectId, ref: 'AccountItem' }]
});

module.exports = mongoose.model("DiaryBook", diaryBookSchema);
