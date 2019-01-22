function isMessageForBot(message) {
    const isMessageForBot =
        message.includes(`@all-contributors`) ||
        message.includes(`@allcontributors[bot]`)
    return isMessageForBot
}

module.exports = isMessageForBot
