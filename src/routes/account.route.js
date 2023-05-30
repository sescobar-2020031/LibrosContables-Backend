"use strict";

const express = require("express");
const api = express.Router();

const account = require("../controllers/account.controller");
const mdAuth = require("../middlewares/authenticated");

api.post("/addAccount", mdAuth.ensureAuth, account.saveAccount);
api.get("/getAccount", mdAuth.ensureAuth, account.getAccounts);
api.post("/editAccount", mdAuth.ensureAuth, account.editAccount);
api.post("/deleteAccount", mdAuth.ensureAuth, account.deleteAccount);

module.exports = api;
