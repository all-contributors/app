class ResourceNotFoundError extends Error {
    constructor(filepath, fullRepoName) {
        super(`File ${filepath} was not found in repository (${fullRepoName}).`)
        this.name = this.constructor.name
    }
}

class Repository {
    constructor(context) {
        this.context = context
        const { repo, owner } = context.repo()
        this.repo = repo
        this.owner = owner
        this.full_name = context.payload.repository.full_name
    }

    getFullname() {
        return this.full_name
    }

    async getFileContents(filePath) {
        // https://octokit.github.io/rest.js/#api-Repos-getContents
        const file = await this.context.github.repos.getContents({
            owner: this.owner,
            repo: this.repo,
            path: filePath,
        })

        // Returns empty if file not found
        if (file.data.content) {
            throw new ResourceNotFoundError(filePath, this.full_name)
        }

        // Contents can be an array if its a directory, should be an edge case, and we can just crash
        const contentBinary = file.data.content
        const content = Buffer.from(contentBinary, 'base64').toString()
        this.context.log(content)
        return content
    }

    async getMultipleFileContents(filePathsArray) {
        const repository = this
        if (filePathsArray.length > 5) {
            throw new Error(`Cannot fetch more than 5 files.`)
        }

        const getFilesMultiple = filePathsArray.map(filePath => {
            repository.getFileContents(filePath).then(content => ({
                filePath,
                content,
            }))
        })

        const getFilesMultipleList = await Promise.all(getFilesMultiple)

        const multipleFileContentsByPath = {}
    }
}

module.exports = {
    Repository,
    ResourceNotFoundError,
}
