class ResourceNotFoundError extends Error {
    constructor(filepath, fullRepoName) {
        super(`File ${filepath} was not found in repository (${fullRepoName}).`)
        this.name = this.constructor.name
    }
}

module.exports = {
    ResourceNotFoundError,
}
