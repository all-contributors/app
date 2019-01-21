const ALL_CONTRIBUTORS_RC = '.all-contributorsrc'

const { addContributorWithDetails } = require('all-contributors-cli')

class OptionsConfig {
    constructor({ repository, commentReply }) {
        this.repository = repository
        this.commentReply = commentReply
        this.options
        this.originalOptionsSha
    }

    async fetch() {
        const {
            content: rawOptionsFileContent,
            sha,
        } = await this.repository.getFile(ALL_CONTRIBUTORS_RC)
        this.originalOptionsSha = sha
        try {
            const optionsConfig = JSON.parse(rawOptionsFileContent)
            this.options = optionsConfig
            return optionsConfig
        } catch (error) {
            if (error instanceof SyntaxError) {
                this.commentReply.reply(
                    `This project's configuration file has malformed JSON: ${ALL_CONTRIBUTORS_RC}. Error:: ${
                        error.message
                    }`,
                )
                error.handled = true
            }
            throw error
        }
    }

    init() {
        const { repo, owner } = this.repository
        this.options = {
            projectName: repo,
            projectOwner: owner,
            repoType: 'github',
            repoHost: 'https://github.com',
            files: ['README.md'],
            imageSize: 100,
            commit: false,
            contributors: [],
            contributorsPerLine: 7,
        }
    }

    get() {
        const options = this.options
        if (!Array.isArray(options.files)) {
            options.files = ['README.md']
        }
        if (!Number.isInteger(options.contributorsPerLine)) {
            options.contributorsPerLine = 7
        }
        return options
    }

    getRaw() {
        return `${JSON.stringify(this.options, null, 2)}\n`
    }

    getPath() {
        return ALL_CONTRIBUTORS_RC
    }

    getOriginalSha() {
        return this.originalOptionsSha
    }

    async addContributor({ login, contributions, name, avatar_url, profile }) {
        const profileWithProtocol = profile.startsWith('http')
            ? profile
            : `http://${profile}`

        const newContributorsList = await addContributorWithDetails({
            options: this.options,
            login,
            contributions,
            name,
            avatar_url,
            profile: profileWithProtocol,
        })
        const newOptions = {
            ...this.options,
            contributors: newContributorsList,
        }
        this.options = newOptions
        return newOptions
    }
}

module.exports = OptionsConfig
