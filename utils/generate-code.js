const CODE_LENGTH = 6
const CODE_EXPIRY = 1000 * 60 * 5 // 5 minutes

module.exports = {
    CODE_LENGTH,
    CODE_EXPIRY,
    generateCode(){
        const pool = "01234567890ABCDEF"

        let output = ""
        
        for(let i = 0; i < CODE_LENGTH; i++){
            output += pool[Math.floor(Math.random() * pool.length)]
        }

        return output
    }
}