module.exports.initEnv = () => {
    const fs = require('fs')
    const path = require('path')

    const NODE_ENV = process.env.NODE_ENV

    const envDir = path.join(__dirname, "..")
    const baseFileName = ".env"

    let envFile = null

    let envFilePriority = [
        `${baseFileName}.${NODE_ENV}`,
        baseFileName,
    ]
    
    envPriority: for(let fileNames of envFilePriority){
        const envPath = path.join(envDir, fileNames)
        if(fs.existsSync(envPath)){
            envFile = envPath
            break envPriority
        }
    }

    if(envFile){
        require('dotenv').config({
            path: envFile,
        })

        console.log(`Environment loaded: ${envFile}`)
    }
}