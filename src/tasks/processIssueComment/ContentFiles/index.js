const { generate: generateContentFile } = require('all-contributors-cli')
const { initBadge, initContributorsList } = require('all-contributors-cli')

const { AllContributorBotError } = require('../utils/errors')

function modifyFiles({ contentFilesByPath, fileContentModifierFunction }) {
    const newFilesByPath = {}
    Object.entries(contentFilesByPath).forEach(
        ([filePath, { content, sha, originalSha }]) => {
            const newFileContents = fileContentModifierFunction(content)
            newFilesByPath[filePath] = {
                content: newFileContents,
                originalSha: sha || originalSha,
            }
        },
    )
    return newFilesByPath
}

/*
 *  Fetches, stores, generates, and updates the readme content files for the contributors list
 */
class ContentFiles {
    constructor({ repository }) {
        this.repository = repository
        this.contentFilesByPath = null
    }

    async fetch(optionsConfig) {
        const options = optionsConfig.get()
        if (options.files.length > 15) {
            throw new AllContributorBotError(
                `Your .all-contributorsrc cannot contain more than 5 files.`,
            )
        }
        this.contentFilesByPath = await this.repository.getMultipleFiles(
            options.files,
        )
    }

    init() {
        const newFilesByPath = modifyFiles({
            contentFilesByPath: this.contentFilesByPath,
            fileContentModifierFunction: function(content) {
                const contentWithBadge = initBadge(content)
                const contentWithList = initContributorsList(contentWithBadge)
                return contentWithList
            },
        })
        this.contentFilesByPath = newFilesByPath
    }

    generate(optionsConfig) {
        const options = optionsConfig.get()
        const newFilesByPath = modifyFiles({
            contentFilesByPath: this.contentFilesByPath,
            fileContentModifierFunction: function(content) {
                return generateContentFile(
                    options,
                    options.contributors,
                    content,
                )
            },
        })
        this.contentFilesByPath = newFilesByPath
    }

    get() {
        return this.contentFilesByPath
    }
}

module.exports = ContentFiles
