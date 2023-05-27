'use strict'

const express = require('express');
const api = express.Router();

const account = require('../controllers/Account.controller');
const mdAuth = require('../middlewares/authenticated');

api.post('/addAccount', mdAuth.ensureAuth, account.saveAccount);
api.get('/getAccount', mdAuth.ensureAuth, account.getAccounts);

module.exports = api;