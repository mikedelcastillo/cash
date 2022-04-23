module.exports = {
    wait: (length = 1000) => new Promise(resolve => setTimeout(resolve, length)),
    ...require('./generate-code'),
    ...require('./init-env'),
}