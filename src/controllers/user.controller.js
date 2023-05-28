'use strict'

const User = require('../models/user.model');
const DiaryBook = require('../models/diaryBook.model');
const jwt = require('../services/jwt');
const { validateData, findUser, encryptPassword, checkPassword } = require('../utlis/validate');
const moment = require('moment-timezone');

exports.testUser = (req, res) => {
    return res.send({ message: 'El este esta funcionando en -User-' });
};

exports.register = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            fullName: params.fullName,
            email: params.email,
            password: params.password
        };

        let dataRequired = await validateData(data);
        if (dataRequired) return res.status(400).send(dataRequired);

        let userExist = await findUser(data.email);
        if (userExist) return res.status(400).send({ message: 'El correo electronico ya esta registrado' });

        data.password = await encryptPassword(data.password);
        let user = new User(data);
        await user.save()

        if (!user) return res.status(500).send({ message: 'No se pudo registrar el usuario' });
        return res.send({ message: 'Usuario Creado Exitosamente', user });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error guardando al usuario' });
    }
}

exports.login = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            email: params.email,
            password: params.password
        };

        let dataRequired = await validateData(data);
        if (dataRequired) return res.status(400).send(dataRequired);

        let userExist = await findUser(data.email);
        if (!userExist || !(await checkPassword(data.password, userExist.password))) return res.status(400).send({ message: 'Credenciales Invalidas' });

        let token = await jwt.createToken(userExist);
        userExist.password = undefined;

        const dataDiaryBook = {
            month: moment.tz('America/Guatemala').format('M'),
            user: userExist._id
        }

        let diaryBookExist = await DiaryBook.findOne({
            $and: [
                { user: userExist._id },
                { month: dataDiaryBook.month },
            ]
        });

        if (!diaryBookExist) {
            let diaryBook = new DiaryBook(dataDiaryBook);
            await diaryBook.save();
            diaryBookExist = diaryBook
        }

        return res.send({ diaryBookExist, token, message: `Bienvenido ${userExist.fullName}`, user: userExist });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error logueando al usuario' });
    };
};