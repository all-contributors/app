const ALL_CONTRIBUTORS_RC = '.all-contributorsrc'

const { addContributorWithDetails } = require('all-contributors-cli')

const { AllContributorBotError } = require('../utils/errors')

class OptionsConfig {
    constructor({ repository }) {
        this.repository = repository
        this.options
        this.originalOptionsSha
    }

    ensureValid() {
        const { repo, owner } = this.repository

        this.options.projectName = repo
        this.options.projectOwner = owner
        this.options.repoType = 'github'
        this.options.repoHost = 'https://github.com'

        if (typeof this.options.skipCi !== 'boolean') {
            this.options.skipCi = true
        }

        if (!this.options.contributors) {
            this.options.contributors = []
        }

        if (!Array.isArray(this.options.contributors)) {
            this.options.contributors = []
        }
    }

    async fetch() {
        const {
            content: rawOptionsFileContent,
            sha,
        } = await this.repository.getFile(ALL_CONTRIBUTORS_RC)
        this.originalOptionsSha = sha
        try {
            this.options = JSON.parse(rawOptionsFileContent)

            this.ensureValid()

            return this.options
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new AllContributorBotError(
                    `This project's configuration file has malformed JSON: ${ALL_CONTRIBUTORS_RC}. Error:: ${
                        error.message
                    }`,
                )
            }
            throw error
        }
    }

    init() {
        this.options = {
            files: ['README.md'],
            imageSize: 100,
            commit: false,
            contributors: [],
            contributorsPerLine: 7,
        }

        this.ensureValid()
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
        const options = this.options

        function findOldContributions(username) {
            const contributors = options.contributors
            for (let i = 0; i < contributors.length; i++) {
                if (contributors[i].login === username) {
                    return contributors[i].contributions
                }
            }

            return []
        }

        const profileWithProtocol = profile.startsWith('http')
            ? profile
            : `http://${profile}`

        const oldContributions = findOldContributions(login)
        const newContributions = [
            ...new Set([...oldContributions, ...contributions]),
        ]

        const newContributorsList = await addContributorWithDetails({
            options,
            login,
            contributions: newContributions,
            name,
            avatar_url,
            profile: profileWithProtocol,
        })
        const newOptions = {
            ...options,
            contributors: newContributorsList,
        }
        this.options = newOptions
        return newOptions
    }
}

module.exports = OptionsConfig
