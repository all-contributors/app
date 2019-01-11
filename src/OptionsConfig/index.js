const ALL_CONTRIBUTORS_RC = '.all-contributorsrc'

const { addContributorWithDetails } = require('all-contributors-cli')

const { ResourceNotFoundError } = require('../utils/errors')

class OptionsConfig {
    constructor({ repository, commentReply }) {
        this.repository = repository
        this.commentReply = commentReply
        this.options
        this.originalOptionsSha
    }

    async fetch() {
        try {
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
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                this.commentReply
                    .reply(`This project is not yet setup for [all-contributors](https://github.com/all-contributors/all-contributors).\n
    You will need to first setup [${
        this.repository.repo
    }](https://github.com/${this.repository.getFullname()}) using the [all-contributors-cli](https://github.com/all-contributors/all-contributors-cli) tool.`)
                error.handled = true
            }
            throw error
        }
    }

    get() {
        return this.options
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
        // TODO: this method should also handle updating a contributor to avoid there previous contributions being blown away
        const newContributorsList = await addContributorWithDetails({
            options: this.options,
            login,
            contributions,
            name,
            avatar_url,
            profile,
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
