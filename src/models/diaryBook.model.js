'use strict'

const mongoose = require("mongoose");

const diaryBookSchema = mongoose.Schema({
    month: Number,
    accountItems: [{ type: mongoose.Schema.ObjectId, ref: 'AccountItem' }]
});

module.exports = mongoose.model("DiaryBook", diaryBookSchema);
