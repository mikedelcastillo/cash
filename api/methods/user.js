const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const uuid4 = require('uuid').v4
const argon2 = require('argon2')
const utils = require('utils')
const emailer = require('../email')

const createUser = async function(email){

}

const loginUser = async function(emailCodeId, code){
    const now = new Date().getTime()

    const emailCode = await prisma.emailCode.findFirst({
        where: {
            id: emailCodeId,
        },
    })
    
    const valid = await argon2.verify(emailCode.code, code)
    
    if(!valid){
        throw Error(`Code is incorrect`)
    }

    let user
    
    const getUser = () => prisma.user.findFirst({
        where: {
            email: emailCodeId.email,
        },
    })

    user = await getUser()

    if(user.deactivated){
        throw Error("User account deactivated")
    }

    if(!user){
        await prisma.user.create({
            data: {
                id: uuid4(),
                email,
            },
        })

        user = await getUser()
    }

    await prisma.userLogin.create({
        data: {
            userId: user.id,
        },
    })

    await prisma.emailCode.update({
        where: {
            id: emailCode.id,
        },
        data: {
            success: true,
            updatedAt: new Date(),
        },
    })

    return valid
}

// TODO: Allow multiple email code at one time
const generateEmailCode = async function(email, context){
    const now = new Date().getTime()

    const lastEmailCode = (await prisma.emailCode.findMany({
        where: {
            success: false,
            context,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 1,
    }))[0]

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

    const emailCodeId = uuid4()

    await prisma.emailCode.create({
        data: {
            id: emailCodeId,
            email,
            code: hashedCode,
            context,
        },
    })

    return { rawCode, emailCodeId }
}

module.exports = {
    createUser,
    loginUser,
    generateEmailCode,
}