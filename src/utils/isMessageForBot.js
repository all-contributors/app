function isMessageForBot(message) {
    const lowerCaseMessage = message.toLowerCase()
    const isMessageForBot =
        lowerCaseMessage.includes(`@all-contributors`) ||
        lowerCaseMessage.includes(`@allcontributors`) ||
        lowerCaseMessage.includes(`@allcontributors[bot]`)
    return isMessageForBot
}

module.exports = isMessageForBot
