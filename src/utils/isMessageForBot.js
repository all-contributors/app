const { GIHUB_BOT_NAME } = require('./settings')

function isMessageForBot(message) {
    const isMessageForBot =
        message.includes(`@${GIHUB_BOT_NAME}`) ||
        message.includes(`@allcontributors[bot]`) ||
        message.includes(`@AllContributorsBot`) // TODO: phase this one out
    return isMessageForBot
}

module.exports = isMessageForBot
