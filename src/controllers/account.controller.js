'use strict'

const Account = require('../models/account.model');

exports.saveAccount = async (req, res) => {
    try {
        const params = req.body
        const data = {
            name: params.name,
            user: req.user._id
        }

        let account = new Account(data);
        await account.save()

        if (!account) return res.status(500).send({ message: 'No se pudo guardar la cuenta' });
        return res.status(200).send({ message: 'Cuenta guardada Exitosamente' });
    } catch (err) {
        console.log(err);
    }
}

exports.getAccounts = async (req, res) => {
    try {
        let accounts = await Account.find({user: req.user._id});
        return res.status(200).send({ message: 'Cuentas Encontradas Exitosamente', accounts });
    } catch (err) {
        console.log(err);
    }
}