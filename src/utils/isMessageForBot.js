const { GIHUB_BOT_NAME } = require('./settings')

function isMessageForBot(message) {
    const isMessageForBot =
        message.includes(`@${GIHUB_BOT_NAME}`) ||
        message.includes(`@allcontributors[bot]`)
    return isMessageForBot
}

module.exports = isMessageForBot
