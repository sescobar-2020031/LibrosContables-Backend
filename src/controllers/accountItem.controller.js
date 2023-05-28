'use strict'

const { validateData } = require('../utlis/validate');
const AccountItem = require('../models/accountItem.model');
const DiaryBook = require('../models/diaryBook.model');
const GeneralLedger = require('../models/generalLedger.model');
const Balance = require('../models/balance.model');
const moment = require('moment-timezone');

exports.saveAccountItem = async (req, res) => {
    const params = req.body;
    let data = {
        date: moment.tz('America/Guatemala').format(),
        accounts: params.accounts,
        description: params.description
    };

    let requrided = {
        date: moment.tz('America/Guatemala').format(),
        accounts: params.accounts,
        description: params.description,
        idDiary: params.idDiary
    };

    let dataRequired = await validateData(requrided);
    if (dataRequired) return res.status(400).send(dataRequired);

    const accountsItemsBefore = await DiaryBook.findOne({ _id: params.idDiary });
    data.numberItem = accountsItemsBefore.accountItems.length + 1

    let fulldebit = 0;
    let fullcredit = 0;

    params.accounts.map((account) => {
        if (account.position == "Credit") {
            fullcredit += +account.amount
        } else if (account.position == "Debit") {
            fulldebit += +account.amount
        }
    })

    data.fullDebit = fulldebit;
    data.fullCredit = fullcredit;

    let accountItem = new AccountItem(data);
    accountItem.save();
    if (!accountItem) {
        return res.status(400).send({
            message: 'Error al guardar la cuenta'
        });
    }

    await DiaryBook.findOneAndUpdate({ _id: params.idDiary }, { $push: { accountItems: accountItem._id } }, { new: true })

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

    res.status(200).send({
        message: 'Cuenta guardada exitosamente',
        accountItem
    });
};

exports.getDiary = async (req, res) => {
    const params = req.body;
    const diary = await DiaryBook.findOne({ _id: params.idDiary }).populate({
        path: 'accountItems',
        populate: {
            path: 'accounts',
            populate: {
                path: 'account',
            }
        }
    })
    if (!diary) {
        return res.status(400).send({
            message: 'No existe la cuenta'
        });
    }

    const ExistDiary = diary.accountItems

    res.status(200).send({
        message: 'Cuenta encontrada',
        ExistDiary
    });
}

exports.getBalance = async (req, res) => {
    const params = req.body;
    const balance = await Balance.findOne({ diaryBook: params.idDiary })
    if (!balance) {
        return res.status(400).send({
            message: 'No existe el balance'
        });
    }

    res.status(200).send({
        message: 'Balance de saldos',
        balance
    });
}