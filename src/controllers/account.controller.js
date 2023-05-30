"use strict";

const Account = require("../models/account.model");
const User = require("../models/user.model");
const { validateData } = require('../utlis/validate');
const AccountItem = require('../models/accountItem.model');
const DiaryBook = require('../models/diaryBook.model');
const GeneralLedger = require('../models/generalLedger.model');
const Balance = require('../models/balance.model');
const moment = require('moment-timezone');

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
    const params = req.body;

    let account = await Account.findOne({ _id: params.id });
    if (!account) return res.status(500).send({ message: "No se pudo modificar la cuenta la cuenta" });

    const accountEdit = await Account.findOneAndUpdate({ _id: params.id }, { name: params.name });
    if (!accountEdit) return res.status(500).send({ message: "No se pudo modificar la cuenta la cuenta" });

    const accounts = await DiaryBook.findOne({ _id: params.idDiary })
      .populate({
        path: 'accountItems',
        populate: {
          path: 'accounts',
          populate: {
            path: 'account',
          }
        }
      })

    let allAccounts = [];

    //  Libro Diario //Partidas
    accounts.accountItems.map((partida) => {
      partida.accounts.map((accounts) => {
        let cuenta = {
          name: accounts.account.name,
          id: accounts.account._id,
          position: accounts.position,
          amount: accounts.amount,
          numberDiaryBook: partida.numberItem
        }
        allAccounts.push(cuenta)
      })
    });

    const result = allAccounts.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          id: item.id,
          name: item.name,
          data: []
        };
      }
      acc[item.id].data.push({
        position: item.position,
        amount: item.amount,
        numberDiaryBook: item.numberDiaryBook
      });
      return acc;
    }, {});

    const groupedArray = Object.values(result);

    const generalLedger = {
      diaryBook: params.idDiary,
      itemLedger: []
    }

    const balance = {
      diaryBook: params.idDiary,
      accountItem: []
    }

    groupedArray.map((cuentaUnificada) => {
      const cuentaObject = {
        name: cuentaUnificada.name,
        debits: [],
        credits: []
      };
      cuentaUnificada.data.map((cuenta) => {
        if (cuenta.position == 'Debit') {
          cuentaObject.debits.push({
            numberDiaryBook: cuenta.numberDiaryBook,
            amount: cuenta.amount
          });
        } else if (cuenta.position == 'Credit') {
          cuentaObject.credits.push({
            numberDiaryBook: cuenta.numberDiaryBook,
            amount: cuenta.amount
          });
        }
      });
      cuentaObject.fullDebits = cuentaObject.debits.reduce((acc, item) => acc + item.amount, 0);
      cuentaObject.fullCredits = cuentaObject.credits.reduce((acc, item) => acc + item.amount, 0);
      if (cuentaObject.fullDebits > cuentaObject.fullCredits) {
        cuentaObject.balance = {
          account: cuentaObject.fullDebits - cuentaObject.fullCredits,
          position: 'Credit'
        }
        balance.accountItem.push({
          name: cuentaUnificada.name,
          account: {
            position: 'Debit',
            amount: cuentaObject.balance.account
          }
        })
      } else if (cuentaObject.fullCredits > cuentaObject.fullDebits) {
        cuentaObject.balance = {
          account: cuentaObject.fullCredits - cuentaObject.fullDebits,
          position: 'Debit'
        };
        balance.accountItem.push({
          name: cuentaUnificada.name,
          account: {
            position: 'Credit',
            amount: cuentaObject.balance.account
          }
        })
      }
      generalLedger.itemLedger.push(cuentaObject)
    });

    const generalLedgerExist = await GeneralLedger.findOne({ diaryBook: params.idDiary });
    if (generalLedgerExist) {
      await GeneralLedger.findOneAndDelete({ diaryBook: params.idDiary })
    }

    const generalLedgerNew = new GeneralLedger(generalLedger);
    await generalLedgerNew.save();

    balance.fullDebit = balance.accountItem.reduce((acc, item) => {
      if (item.account.position === 'Debit') {
        return acc + item.account.amount;
      }
      return acc;
    }, 0);

    balance.fullCredit = balance.accountItem.reduce((acc, item) => {
      if (item.account.position === 'Credit') {
        return acc + item.account.amount;
      }
      return acc;
    }, 0);

    const balanceExist = await Balance.findOne({ diaryBook: params.idDiary });
    if (balanceExist) {
      await Balance.findOneAndDelete({ diaryBook: params.idDiary })
    }
    const balanceNew = new Balance(balance);
    balanceNew.save();

    return res.status(200).send({ message: "Cuenta modificada Exitosamente", });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "No se pudo actualizar la cuenta." });
  }
};


exports.deleteAccount = async (req, res) => {
  try {
    const params = req.body;

    let account = await Account.findOne({ _id: params.idAccount });
    if (!account) return res.status(500).send({ message: "La cuenta ya no existe" });

    const accountDelete = await Account.findOneAndDelete({ _id: params.idAccount });
    if (!accountDelete) return res.status(500).send({ message: "No se pudo eliminar correctamente la cuenta" });

    const updateAccountItem = await AccountItem.updateMany({ "accounts.account": params.idAccount },
      { $pull: { accounts: { account: params.idAccount } } });

    const accounts = await DiaryBook.findOneAndUpdate({
      _id: params.idDiary,
    }, { $pull: { accountItems: { _id: params.idAccount } } }).populate({
      path: 'accountItems',
      populate: {
        path: 'accounts',
        populate: {
          path: 'account',
        }
      }
    });

    let allAccounts = [];

    //  Libro Diario //Partidas
    accounts.accountItems.map((partida) => {
      partida.accounts.map((accounts) => {
        let cuenta = {
          name: accounts.account.name,
          id: accounts.account._id,
          position: accounts.position,
          amount: accounts.amount,
          numberDiaryBook: partida.numberItem
        }
        allAccounts.push(cuenta)
      })
    });

    const result = allAccounts.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          id: item.id,
          name: item.name,
          data: []
        };
      }
      acc[item.id].data.push({
        position: item.position,
        amount: item.amount,
        numberDiaryBook: item.numberDiaryBook
      });
      return acc;
    }, {});

    const groupedArray = Object.values(result);

    const generalLedger = {
      diaryBook: params.idDiary,
      itemLedger: []
    }

    const balance = {
      diaryBook: params.idDiary,
      accountItem: []
    }

    groupedArray.map((cuentaUnificada) => {
      const cuentaObject = {
        name: cuentaUnificada.name,
        debits: [],
        credits: []
      };
      cuentaUnificada.data.map((cuenta) => {
        if (cuenta.position == 'Debit') {
          cuentaObject.debits.push({
            numberDiaryBook: cuenta.numberDiaryBook,
            amount: cuenta.amount
          });
        } else if (cuenta.position == 'Credit') {
          cuentaObject.credits.push({
            numberDiaryBook: cuenta.numberDiaryBook,
            amount: cuenta.amount
          });
        }
      });
      cuentaObject.fullDebits = cuentaObject.debits.reduce((acc, item) => acc + item.amount, 0);
      cuentaObject.fullCredits = cuentaObject.credits.reduce((acc, item) => acc + item.amount, 0);
      if (cuentaObject.fullDebits > cuentaObject.fullCredits) {
        cuentaObject.balance = {
          account: cuentaObject.fullDebits - cuentaObject.fullCredits,
          position: 'Credit'
        }
        balance.accountItem.push({
          name: cuentaUnificada.name,
          account: {
            position: 'Debit',
            amount: cuentaObject.balance.account
          }
        })
      } else if (cuentaObject.fullCredits > cuentaObject.fullDebits) {
        cuentaObject.balance = {
          account: cuentaObject.fullCredits - cuentaObject.fullDebits,
          position: 'Debit'
        };
        balance.accountItem.push({
          name: cuentaUnificada.name,
          account: {
            position: 'Credit',
            amount: cuentaObject.balance.account
          }
        })
      }
      generalLedger.itemLedger.push(cuentaObject)
    });

    const generalLedgerExist = await GeneralLedger.findOne({ diaryBook: params.idDiary });
    if (generalLedgerExist) {
      await GeneralLedger.findOneAndDelete({ diaryBook: params.idDiary })
    }

    const generalLedgerNew = new GeneralLedger(generalLedger);
    await generalLedgerNew.save();

    balance.fullDebit = balance.accountItem.reduce((acc, item) => {
      if (item.account.position === 'Debit') {
        return acc + item.account.amount;
      }
      return acc;
    }, 0);

    balance.fullCredit = balance.accountItem.reduce((acc, item) => {
      if (item.account.position === 'Credit') {
        return acc + item.account.amount;
      }
      return acc;
    }, 0);

    const balanceExist = await Balance.findOne({ diaryBook: params.idDiary });
    if (balanceExist) {
      await Balance.findOneAndDelete({ diaryBook: params.idDiary })
    }
    const balanceNew = new Balance(balance);
    balanceNew.save();

    return res.status(200).send({ message: "Cuenta eliminada Exitosamente" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Error eliminando cuenta", });
  }
};

