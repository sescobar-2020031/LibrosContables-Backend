"use strict";
//Import Dependencies
const express = require("express");
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require("cors");

//Import the Routes
const userRoutes = require("../src/routes/user.route");
const accountItemsRoutes = require("../src/routes/accountItem.route");
const accountRoutes = require("../src/routes/account.route");

//APP -> HTTP Server (Express)
const app = express(); //Create Express Server

/*----- SERVER CONFIGURATION ---------*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet({}));
app.use(cors());

//Applying the routes
app.use("/user", userRoutes);
app.use("/account", accountRoutes);
app.use("/accountItem", accountItemsRoutes);

//Export//
module.exports = app;
