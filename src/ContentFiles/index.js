const { generate: generateContentFile } = require('all-contributors-cli')

/*
 *  Fetches, stores, generates, and updates the readme content files for the contributors list
 */
class ContentFiles {
    constructor({ context, repository }) {
        this.context = context
        this.repository = repository
        this.contentFilesByPath = null
    }

    async fetch(optionsConfig) {
        const options = optionsConfig.get()
        if (Array.isArray(options.files)) {
            this.contentFilesByPath = this.repository.getMultipleFileContents(
                options.files,
            )
        } else {
            this.contentFilesByPath = this.repository.getMultipleFileContents([
                'README.md',
            ])
        }
    }

    async generate(optionsConfig) {
        const options = optionsConfig.get()
        const newReadmeFileContentsByPath = {}
        Object.entires(this.contentFilesByPath).forEach(
            ([filePath, fileContents]) => {
                const newFileContents = generateContentFile(
                    options,
                    options.contributors,
                    fileContents,
                )
                newReadmeFileContentsByPath[filePath] = newFileContents
            },
        )
        this.contentFilesByPath = newReadmeFileContentsByPath
    }
}

module.exports = ContentFiles
