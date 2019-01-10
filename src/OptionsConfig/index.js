const ALL_CONTRIBUTORS_RC = '.all-contributorsrc'

const { addContributorWithDetails } = require('all-contributors-cli')

const { ResourceNotFoundError } = require('../utils/errors')

class OptionsConfig {
    constructor({ context, repository, commentReply }) {
        this.context = context
        this.repository = repository
        this.commentReply = commentReply
        this.options = null
    }

    async fetch() {
        try {
            const rawOptionsFileContent = await this.repository.getFileContents(
                ALL_CONTRIBUTORS_RC,
            )
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
                    throw error
                }
            }
        } catch (error) {
            if (error instanceof ResourceNotFoundError) {
                this.commentReply
                    .reply(`This project is not yet setup for [all-contributors](https://github.com/all-contributors/all-contributors).\n
    You will need to first setup [${
        this.repository.repo
    }](https://github.com/${this.repository.getFullname()}) using the [all-contributors-cli](https://github.com/all-contributors/all-contributors-cli) tool.`)
                error.handled = true
                throw error
            }
        }
    }

    get() {
        return this.options
    }

    getRaw() {
        return JSON.stringify(this.options)
    }

    getPath() {
        return ALL_CONTRIBUTORS_RC
    }

    async addContributor({ login, contributions, name, avatar_url, profile }) {
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
