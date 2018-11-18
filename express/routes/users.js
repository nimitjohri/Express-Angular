const { Router } = require('express')
const { Articles } = require('../db/index') 
const { Comments } = require('../db/index') 
const { Users } = require('../db/index') 
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const route = Router()

route.get('/user', async(req, res) => {
    const jwtToken = req.header("Authorization")
    const user = await Users.findOne({
        where: {
            token: jwtToken
        }
    })

    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ user: user })
})

route.post('/', async (req, res) => {
    try {
        const payload = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }

        var privateKEY = fs.readFileSync(__dirname +  '\\keys\\private.key', 'utf8');
        // var publicKEY = fs.readFileSync(__dirname + '\\keys\\public.key', 'utf8');
        var i = 'Nimit Johri'; // Issuer 
        var s = 'nim@j.com'; // Subject 
        var a = 'http://nimitjohri.in'; //audience
        var signOptions = {
            issuer: i,
            subject: s,
            audience: a,
            expiresIn: "12h",
            algorithm: "RS256"
        };

        var jwtToken = jwt.sign(payload, privateKEY, signOptions);
        console.log(jwtToken)
        const newUser = await Users.create({
            username:req.body.username,
            email: req.body.email,
            password :req.body.password,
            token: jwtToken
    })
    
    res.status(201).json({
        message : 'User added',
        id: newUser.id
    })
    
    } catch(e){
        res.status(400).json({ message: e })
    }
})

route.post('/login', async(req, res) => {
    try {
        const payload = {
            user: req.body.user,
            password: req.body.password
        }

        const userInDb = await User.findOne({
            where: { user: req.body.user }
        })
        if (!userInDb) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (userInDb.password !== payload.password) {
            return res.status(400).json({ message: "Invalid Password" })
        }
        res.status(200).json({ user: userInDb })
    } catch (e) {
        res.status(400).json({ message: e })
    }
})


module.exports = route 