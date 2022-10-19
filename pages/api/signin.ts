import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import prisma from '../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { userAgent } from 'next/server'

export default async (req: NextApiRequest, res: NextApiResponse) => {
const {email, password} = req.body

const user = await prisma.user.findUnique({
    where: {email}})

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({
            id: user.id,
            email: user.email,
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

res.json(user)
    } else {
        res.status(401)
        res.json({error: 'email or password is incorrect'})
    }
}