'use strict'

const express = require('express');
const api = express.Router();

const accountItem = require('../controllers/accountItem.controller');
const mdAuth = require('../middlewares/authenticated');

api.post('/addItemAccount', mdAuth.ensureAuth, accountItem.saveAccountItem);
api.post('/getDiary', mdAuth.ensureAuth, accountItem.getDiary);

module.exports = api;