const {
    AllContributorBotError,
    BranchNotFoundError,
    ResourceNotFoundError,
} = require('../utils/errors')

class Repository {
    constructor({ repo, owner, github, defaultBranch, log }) {
        this.github = github
        this.repo = repo
        this.owner = owner
        this.defaultBranch = defaultBranch
        this.baseBranch = defaultBranch
        this.log = log
        this.skipCiString = '[skip ci]'
    }

    getFullname() {
        return `${this.owner}/${this.repo}`
    }

    setBaseBranch(branchName) {
        this.baseBranch = branchName
    }

    async getFile(filePath) {
        try {
            // https://octokit.github.io/rest.js/#api-Repos-getContents
            const file = await this.github.repos.getContents({
                owner: this.owner,
                repo: this.repo,
                path: filePath,
                ref: this.baseBranch,
            })
            // Contents can be an array if its a directory, should be an edge case, and we can just crash
            const contentBinary = file.data.content
            const content = Buffer.from(contentBinary, 'base64').toString()
            return {
                content,
                sha: file.data.sha,
            }
        } catch (error) {
            if (error.status === 404) {
                throw new ResourceNotFoundError(filePath, this.getFullname())
            } else {
                throw error
            }
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

    async getRef(branchName) {
        try {
            const result = await this.github.git.getRef({
                owner: this.owner,
                repo: this.repo,
                ref: `heads/${branchName}`,
            })
            return result.data.object.sha
        } catch (error) {
            if (error.status === 404) {
                throw new BranchNotFoundError(branchName)
            }
        }
    }

    async createBranch(branchName) {
        const fromSha = await this.getRef(this.defaultBranch)

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
            message: `docs: update ${filePath} ${this.skipCiString}`,
            content: contentBinary,
            sha: originalSha,
            branch: branchName,
        })
    }

    async createFile({ filePath, content, branchName }) {
        const contentBinary = Buffer.from(content).toString('base64')

        //octokit.github.io/rest.js/#api-Repos-createFile
        await this.github.repos.createFile({
            owner: this.owner,
            repo: this.repo,
            path: filePath,
            message: `docs: create ${filePath} ${this.skipCiString}`,
            content: contentBinary,
            branch: branchName,
        })
    }

    async createOrUpdateFile({ filePath, content, branchName, originalSha }) {
        if (originalSha === undefined) {
            await this.createFile({ filePath, content, branchName })
        } else {
            await this.updateFile({
                filePath,
                content,
                branchName,
                originalSha,
            })
        }
    }

    async createOrUpdateFiles({ filesByPath, branchName }) {
        const repository = this
        const createOrUpdateFilesMultiple = Object.entries(filesByPath).map(
            ([filePath, { content, originalSha }]) => {
                return repository.createOrUpdateFile({
                    filePath,
                    content,
                    branchName,
                    originalSha,
                })
            },
        )

        await Promise.all(createOrUpdateFilesMultiple)
    }

    async getPullRequestURL({ branchName }) {
        try {
            const results = await this.github.pulls.list({
                owner: this.owner,
                repo: this.repo,
                state: 'open',
                head: `${this.owner}:${branchName}`,
            })
            return results.data[0].html_url
        } catch (error) {
            // Hard fail, but recoverable (not ideal for UX)
            this.log.error(error)
            throw new AllContributorBotError(
                `A pull request is already open for the branch \`${branchName}\`.`,
            )
        }
    }

    async createPullRequest({ title, body, branchName }) {
        try {
            const result = await this.github.pulls.create({
                owner: this.owner,
                repo: this.repo,
                title,
                body,
                head: branchName,
                base: this.defaultBranch,
                maintainer_can_modify: true,
            })
            return {
                pullRequestURL: result.data.html_url,
                pullCreated: true,
            }
        } catch (error) {
            if (error.status === 422) {
                this.log.debug(error)
                this.log.info(
                    'Pull request is already open, finding pull request...',
                )
                const pullRequestURL = await this.getPullRequestURL({
                    branchName,
                })
                return {
                    pullRequestURL,
                    pullCreated: false,
                }
            } else {
                throw error
            }
        }
    }

    async createPullRequestFromFiles({ title, body, filesByPath, branchName }) {
        const branchNameExists = branchName === this.baseBranch
        if (!branchNameExists) {
            await this.createBranch(branchName)
        }

        await this.createOrUpdateFiles({
            filesByPath,
            branchName,
        })

        return await this.createPullRequest({
            title,
            body,
            branchName,
        })
    }
}

module.exports = Repository
