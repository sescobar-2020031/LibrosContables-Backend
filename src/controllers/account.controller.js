"use strict";

const Account = require("../models/account.model");
const User = require("../models/user.model");

exports.saveAccount = async (req, res) => {
  try {
    const params = req.body;

    const user = await User.findOne({ email: req.user.email });
    if (!user)
      return res.status(500).send({ message: "Usuario no encontrada" });

    const data = {
      name: params.name,
      user: user._id,
    };

    let account = new Account(data);
    await account.save();

    if (!account)
      return res.status(500).send({ message: "No se pudo guardar la cuenta" });
    return res.status(200).send({ message: "Cuenta guardada Exitosamente" });
  } catch (err) {
    console.log(err);
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const params = req.user;
    const user = await User.findOne({ email: params.email });
    if (!user) return res.status(500).send({ message: "Cuenta no encontrada" });
    let accounts = await Account.find({ user: user._id });
    return res
      .status(200)
      .send({ message: "Cuentas Encontradas Exitosamente", accounts });
  } catch (err) {
    console.log(err);
  }
};

exports.editAccount = async (req, res) => {
  try {
    let account = await Account.find({ _id: req.body.id });
    if (!account)
      return res
        .status(500)
        .send({ message: "No se pudo modificar la cuenta la cuenta" });
    Account.updateOne({ _id: req.body.id }, { name: req.body.name })
      .then(() => {
        res.status(200).send({ message: "Cuenta actualizada exitosamente." });
      })
      .catch((err) => {
        res.status(500).send({ message: "No se pudo actualizar la cuenta." });
      });
  } catch (err) {
    console.log(err);
  }
};


exports.deleteAccount = async (req, res) => {
    try {
      let account = await Account.find({ _id: req.body.id });
      if (!account)
        return res.status(500).send({ message: "No se pudo eliminar la cuenta" });
      Account.deleteOne({ _id: req.body.id })
        .then(() => {
          res.status(200).send({ message: "Cuenta eliminada exitosamente" });
        })
        .catch((err) => {
          res.status(500).send({ message: "No se pudo eliminar la cuenta" });
        });
    } catch (err) {
      console.log(err);
    }
  };
  
  