class AllContributorBotError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name
    }
}

class ResourceNotFoundError extends AllContributorBotError {
    constructor(filepath, fullRepoName) {
        super(`File ${filepath} was not found in repository (${fullRepoName}).`)
        this.name = this.constructor.name
    }
}

class UserNotFoundError extends AllContributorBotError {
    constructor(username) {
        super(`Could not find ${username} on github.`)
        this.name = this.constructor.name
    }
}

module.exports = {
    AllContributorBotError,
    ResourceNotFoundError,
    UserNotFoundError,
}
