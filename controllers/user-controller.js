const {json} = require("express");
const bcrypt = require('bcryptjs')
const Jdention = require('jdenticon')
const path = require('path')
const { prisma } = require("../prisma/prisma-client");
const jwt = require('jsonwebtoken')
require('dotenv').config()

const fs = require('fs')


const UserController = {
    register: async  (req,res)=> {
       const {email, password, name} = req.body
       if (!email || !password || !name) {
           return res.status(400).json({error: 'все поля обязательны'})
       }
       try {
           const existingUser = await prisma.user.findUnique(({where: {email}}))

           if (existingUser) {
               return res.status(400).json({error: 'Пользователь уже существует'})
           }

           const hashedPassword = await bcrypt.hash(password, 10)

           const png = Jdention.toPng(name, 200)
           const avatarName = `${name}_${Date.now()}.png`
           const avatarPath = path.join(__dirname, '../uploads', avatarName)
           fs.writeFileSync(avatarPath,png)

           const user = await prisma.user.create({
               data: {
                   email,
                   password: hashedPassword,
                   name,
                   avatarUrl: `/uploads/${avatarPath}`
               }
           })
           res.json(user)
       }
        catch (error) {
            console.log('Error in register', error)
            res.status(500).json({error: 'Internal server error'})
       }

    },

    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Все поля обязательны" });
        }

        try {
            // Find the user
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return res.status(400).json({ error: "Неверный логин или пароль" });
            }

            // Check the password
            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.status(400).json({ error: "Неверный логин или пароль" });
            }

            // Generate a JWT
            const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

            res.json({ token });
        } catch (error) {
            console.error("Error in login:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    getUserById: async  (req,res)=> {
        res.send('getUserById')
    },
    updateUser: async  (req,res)=> {
        res.send('updateUser')
    },
    current: async  (req,res)=> {
        res.send('current')
    },
}

module.exports = UserController