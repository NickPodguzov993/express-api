const {json} = require("express");
const bcrypt = require('bcryptjs')
const Jdention = require('jdenticon')
const path = require('path')
const { prisma } = require("../prisma/prisma-client");

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

    login: async  (req,res)=> {
        res.send('Login')
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