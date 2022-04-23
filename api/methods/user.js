const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const uuid4 = require('uuid').v4
const argon2 = require('argon2')
const utils = require('utils')
const emailer = require('../email')

const createUser = async function(email){

}

const loginUser = async function(email, code){
    const now = new Date().getTime()

    const lastEmailCode = await getLastEmailCode(email, false)
    if(lastEmailCode){
        if(now - lastEmailCode.createdAt.getTime() > utils.CODE_EXPIRY){
            throw Error(`Log in took too long. Please log in again.`)
        }
    } else{
        throw Error(`No valid login request exists. Please log in again.`)
    }

    const valid = await argon2.verify(lastEmailCode.code, code)
    
    if(!valid){
        throw Error(`Code is incorrect`)
    }

    let user
    
    const getUser = () => prisma.user.findFirst({
        where: {
            email,
        },
    })

    user = await getUser()

    if(!user){
        await prisma.user.create({
            data: {
                id: uuid4(),
                email,
            },
        })

        user = await getUser()
    }

    console.log(user)

    await prisma.userLogin.create({
        data: {
            userId: user.id,
        },
    })

    await prisma.emailCode.update({
        where: {
            id: lastEmailCode.id,
        },
        data: {
            success: true,
            updatedAt: new Date(),
        },
    })

    return valid
}

const getLastEmailCode = async function(email, success){
    return (await prisma.emailCode.findMany({
        where: {
            success,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 1,
    }))[0]
}

// TODO: Allow multiple email code at one time
const generateEmailCode = async function(email){
    const now = new Date().getTime()

    const lastEmailCode = await getLastEmailCode(email, false)
    if(lastEmailCode){
        if(now - lastEmailCode.createdAt.getTime() <= utils.CODE_EXPIRY){
            throw Error(`A login code has recently been sent. Try again later.`)
        }
    } 
    
    const rawCode = utils.generateCode()
    const hashedCode = await argon2.hash(rawCode)

    const subject = `${rawCode} is your code 💸`
    const message = `Your login code is ${rawCode}. Ignore this email if you did not attempt to log in. Have a great day!`

    const info = await emailer.sendEmail(
        email, 
        subject, 
        message, 
        message + `<br>If your code was a color it would look like <span style="color:#${rawCode}">this</span>.`,
    )

    if(info.rejected.length > 0){
        throw Error(`Could not send code to email.`)
    }

    await prisma.emailCode.create({
        data: {
            id: uuid4(),
            email,
            code: hashedCode,
        },
    })

    return { rawCode }
}

module.exports = {
    createUser,
    loginUser,
    getLastEmailCode,
    generateEmailCode,
}