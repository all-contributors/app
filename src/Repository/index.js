const { ResourceNotFoundError } = require('../utils/errors')

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
        if (!file.data || !file.data.content) {
            throw new ResourceNotFoundError(filePath, this.full_name)
        }

        // Contents can be an array if its a directory, should be an edge case, and we can just crash
        const contentBinary = file.data.content
        const content = Buffer.from(contentBinary, 'base64').toString()
        return content
    }

    async getMultipleFileContents(filePathsArray) {
        // TODO: can probably optimise this instead of sending a request per file
        const repository = this

        const getFilesMultiple = filePathsArray.map(filePath => {
            return repository.getFileContents(filePath).then(content => ({
                filePath,
                content,
            }))
        })

        const getFilesMultipleList = await Promise.all(getFilesMultiple)
        debugger
        const multipleFileContentsByPath = {}
        getFilesMultipleList.forEach(({ filePath, content }) => {
            multipleFileContentsByPath[filePath] = content
        })

        return multipleFileContentsByPath
    }

    async createPullRequest({title, body, fileContentsByPath}) {
        // TODO: Create branch, update files
        // GET master state when we read files
        // https://octokit.github.io/rest.js/#api-Git-createRef
        // https://octokit.github.io/rest.js/#api-Repos-updateFile

        // TODO: post pull request
        // https://octokit.github.io/rest.js/#api-Pulls-createFromIssue
        const pullRequestNumber = 1

        return pullRequestNumber
    }
}

module.exports = Repository
