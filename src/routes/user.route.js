'use strict'

const express = require('express');
const api = express.Router();

const userController = require('../controllers/user.controller');

api.get('/testUser', userController.testUser);
api.post('/register', userController.register);
api.post('/login', userController.login);

module.exports = api;