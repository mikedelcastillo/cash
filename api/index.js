const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const emailer = require('./email')

const utils = require('utils')
utils.initEnv()

async function run(){
    emailer.initialize()
    const email = "johnmichaeldc@gmail.com"
    const userMethod = require('./methods/user')
    const { rawCode } = await userMethod.generateEmailCode(email)
    await utils.wait()
    await userMethod.loginUser(email, rawCode)
}

run()