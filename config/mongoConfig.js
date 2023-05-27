"use strict";

//Mongoose import
const mongoose = require("mongoose");

//Function - Connection with MongoDB
exports.init = () => {
  const uriMongo =
    "mongodb+srv://samuel:Sami2004@cluster0.jhoa7tz.mongodb.net/?retryWrites=true&w=majority";

  //Mongo Promise
  mongoose.Promise = global.Promise;

  //Connection Lifecycle - MongoDB

  mongoose.connection.on("error", () => {
    console.log("MongoDB | could not be connect to mongodb");
    mongoose.disconnect();
  });
  mongoose.connection.on("connecting", () => {
    console.log("MongoDB | try connecting");
  });
  mongoose.connection.on("connected", () => {
    console.log("MongoDB | connected to mongodb");
  });
  mongoose.connection.once("open", () => {
    console.log("MongoDB | connected to database");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB | reconnected to mongodb");
  });
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB | disconnected");
  });

  mongoose
    .connect(uriMongo, {
      connectTimeoutMS: 2500,
      maxPoolSize: 50,
      useNewUrlParser: true,
    })
    .catch((err) => console.log(err));
};
