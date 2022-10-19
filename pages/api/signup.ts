import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import prisma from '../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
const salt = bcrypt.genSaltSync()
const {email, password} = req.body


//attempts to make a user with prisma
let user 
try {
user = await prisma.user.create({
    data: {
        email,
        password: bcrypt.hashSync(password, salt)
    }
})
} catch(e){
//if user exists returns error
res.status(401)
res.json({error: 'User already exists'})
return
}

//if user creation succeeds creates webtoken that expires in 8 hours
const token = jwt.sign({
    email: user.email,
    id: user.id,
    time: Date.now()
}, 'hello', {expiresIn: '8h'})

//serializes token in cookie, makes it available only in http
res.setHeader('Set-Cookie', cookie.serialize('APP_ACCESS_TOKEN', token, {
    httpOnly: true,
    maxAge: 8 * 60 * 60,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
}))

//sends back user object
res.json(user)
}