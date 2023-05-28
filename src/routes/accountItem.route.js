'use strict'

const express = require('express');
const api = express.Router();

const accountItem = require('../controllers/accountItem.controller');
const mdAuth = require('../middlewares/authenticated');

api.post('/addItemAccount', mdAuth.ensureAuth, accountItem.saveAccountItem);
api.post('/getDiary', mdAuth.ensureAuth, accountItem.getDiary);
api.post('/getBalance', mdAuth.ensureAuth, accountItem.getBalance);
api.post('/getGeneralLedger', mdAuth.ensureAuth, accountItem.getGeneralLedger);

module.exports = api;