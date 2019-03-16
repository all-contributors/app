class AllContributorBotError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name
    }
}

class ResourceNotFoundError extends AllContributorBotError {
    constructor(filepath, fullRepoName) {
        super(
            `File ${filepath} was not found in the repository (${fullRepoName}).`,
        )
        this.name = this.constructor.name
    }
}

class BranchNotFoundError extends AllContributorBotError {
    constructor(branchName) {
        super(`${branchName} does not exist`)
        this.name = this.constructor.name
    }
}

class UserNotFoundError extends AllContributorBotError {
    constructor(username) {
        super(`Could not find the user \`${username}\` on github.`)
        this.name = this.constructor.name
    }
}

module.exports = {
    AllContributorBotError,
    BranchNotFoundError,
    ResourceNotFoundError,
    UserNotFoundError,
}
