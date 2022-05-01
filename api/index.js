const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const emailer = require('./email')

const utils = require('utils')
utils.initEnv()

async function run(){
    emailer.initialize()
    const email = "johnmichaeldc@gmail.com"
    const userMethod = require('./methods/user')
    const { emailCodeId, rawCode } = await userMethod.generateEmailCode(email, "test")
    await utils.wait()
    await userMethod.loginUser(emailCodeId, rawCode)
}

run()