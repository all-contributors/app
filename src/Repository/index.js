const { ResourceNotFoundError } = require('../utils/errors')

class Repository {
    constructor({ repo, owner, github }) {
        this.github = github
        this.repo = repo
        this.owner = owner
    }

    getFullname() {
        return `${this.owner}/${this.repo}`
    }

    async getFile(filePath) {
        // https://octokit.github.io/rest.js/#api-Repos-getContents
        let file
        try {
            file = await this.github.repos.getContents({
                owner: this.owner,
                repo: this.repo,
                path: filePath,
            })
        } catch (error) {
            if (error.code === 404) {
                throw new ResourceNotFoundError(filePath, this.full_name)
            } else {
                throw error
            }
        }

        // Contents can be an array if its a directory, should be an edge case, and we can just crash
        const contentBinary = file.data.content
        const content = Buffer.from(contentBinary, 'base64').toString()
        return {
            content,
            sha: file.data.sha,
        }
    }

    async getMultipleFiles(filePathsArray) {
        // TODO: can probably optimise this instead of sending a request per file
        const repository = this

        const getFilesMultiple = filePathsArray.map(filePath => {
            return repository.getFile(filePath).then(({ content, sha }) => ({
                filePath,
                content,
                sha,
            }))
        })

        const getFilesMultipleList = await Promise.all(getFilesMultiple)
        const multipleFilesByPath = {}
        getFilesMultipleList.forEach(({ filePath, content, sha }) => {
            multipleFilesByPath[filePath] = {
                content,
                sha,
            }
        })

        return multipleFilesByPath
    }

    async getHeadRef() {
        const result = await this.github.git.getRef({
            owner: this.owner,
            repo: this.repo,
            ref: `heads/master`,
        })
        return result.data.object.sha
    }

    async createBranch(branchName) {
        const fromSha = await this.getHeadRef()

        // https://octokit.github.io/rest.js/#api-Git-createRef
        await this.github.git.createRef({
            owner: this.owner,
            repo: this.repo,
            ref: `refs/heads/${branchName}`,
            sha: fromSha,
        })
    }

    async updateFile({ filePath, content, branchName, originalSha }) {
        const contentBinary = Buffer.from(content).toString('base64')

        //octokit.github.io/rest.js/#api-Repos-updateFile
        await this.github.repos.updateFile({
            owner: this.owner,
            repo: this.repo,
            path: filePath,
            message: `docs: update ${filePath}`,
            content: contentBinary,
            sha: originalSha,
            branch: branchName,
        })
    }

    async updateFiles({ filesByPath, branchName }) {
        // TODO: can probably optimise this instead of sending a request per file
        const repository = this
        const updateFilesMultiple = Object.entries(filesByPath).map(
            ([filePath, { content, originalSha }]) => {
                return repository.updateFile({
                    filePath,
                    content,
                    branchName,
                    originalSha,
                })
            },
        )

        await Promise.all(updateFilesMultiple)
    }

    async createPullRequest({ title, body, branchName }) {
        const result = await this.github.pulls.create({
            owner: this.owner,
            repo: this.repo,
            title,
            body,
            head: branchName,
            base: 'master',
            maintainer_can_modify: true,
        })
        return result.data.html_url
    }

    async createPullRequestFromFiles({ title, body, filesByPath, branchName }) {
        await this.createBranch(branchName)

        await this.updateFiles({
            filesByPath,
            branchName,
        })

        const pullRequestURL = await this.createPullRequest({
            title,
            body,
            branchName,
        })

        return pullRequestURL
    }
}

module.exports = Repository
