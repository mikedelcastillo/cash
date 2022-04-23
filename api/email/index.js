const nodemailer = require("nodemailer");

let transporter = null

const initialize = async function(){
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
}

const sendEmail = async function(to, subject, text, html){
    const info = await transporter.sendMail({
        from: `"Cash by Mike" <${process.env.EMAIL_USER}>`,
        to,
        subject, text, html,
    })

    return info
}

module.exports = {
    transporter,
    initialize,
    sendEmail,
}