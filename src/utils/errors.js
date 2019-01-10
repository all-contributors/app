class ResourceNotFoundError extends Error {
    constructor(filepath, fullRepoName) {
        super(`File ${filepath} was not found in repository (${fullRepoName}).`)
        this.name = this.constructor.name
    }
}

class UserNotFoundError extends Error {
    constructor(username) {
        super(`Could not find ${username} on github.`)
        this.name = this.constructor.name
    }
}

module.exports = {
    ResourceNotFoundError,
    UserNotFoundError,
}
