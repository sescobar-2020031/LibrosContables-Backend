"use strict";

const jwt = require("jwt-simple");
const moment = require("moment");
const secretKey = "ScretKeyOfGroupConta";

exports.createToken = async (user) => {
  try {
    const payload = {
      fullName: user.fullName,
      email: user.email,
      iat: moment().unix(),
      exp: moment().add(2, "hours").unix(),
    };
    return jwt.encode(payload, secretKey);
  } catch (err) {
    console.log(err);
    return err;
  }
};
