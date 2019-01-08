const GIHUB_BOT_NAME = '@AllContributorsBot'
const ALL_CONTRIBUTORS_RC = '.all-contributorsrc'

const getFileContents = async (context, filePath) => {
    const { repo, owner } = context.repo()
    const file = await context.github.repos.getContents({
        owner,
        repo,
        path: filePath,
    })
    context.log(file)

    // contents can be an array if its a directory, should be an edge case
    const contentBinary = file.data.content
    const content = Buffer.from(contentBinary, 'base64').toString()
    context.log(content)
    return content
}

const createComment = async (context, body) => {
    const issueComment = context.issue({ body })
    return context.github.issues.createComment(issueComment)
}

module.exports = app => {
    // Your code here
    app.log('Yay, the app was loaded!')

    // issueComment.edited
    app.on('issue_comment.created', async context => {
        if (context.isBot) {
            app.log('From a bot, exiting')
            return
        }

        const payload = context.payload
        app.log(context)
        const username = payload.comment.user.login
        // .user.avatar_url
        // .user.html_url
        const repository = payload.repository.full_name
        const commentBody = payload.comment.body
        const mentionedBotName = commentBody.includes(GIHUB_BOT_NAME)
        app.log(
            `Mentioned Bot Name: ${mentionedBotName}. Repo: ${repository} User: ${username}. Comment: ${commentBody}`,
        )

        // body contains `@AllContributorsBot`

        // Could have command to add self: context.sender.avatar_url

        const rcFileContent = getFileContents(context, ALL_CONTRIBUTORS_RC)
        if (!rcFileContent) {
            createComment(
                context,
                'Please setup your project for all-contributors using the all-contributors-cli tool',
            )
        }

        let readmeFileContentsList
        if (rcFileContent.files) {
            if (rcFileContent.files.length > 2) {
                throw new Error(`Cannot update more than 2 files`)
            }
            const rcFileContentPromises = rcFileContent.files.map(filePath => {
                getFileContents(context, filePath).then(content => ({
                    filePath,
                    content,
                }))
            })

            readmeFileContentsList = await Promise.all(rcFileContentPromises)
        } else {
            // default 'files', ['README.md']
            readmeFileContentsList = [
                {
                    filePath: 'README.md',
                    content: await getFileContents(context, 'README.md'),
                },
            ]
        }

        app.log(readmeFileContentsList)

        // const results = addContributor({
        //   rcFileContent: content
        //   readmeFileContentsList
        //   username: 'blah',
        //   contributors: 'blah'
        // })
        //
        // results.rcFileContent
        // results.readMeFileContent

        throw new Error(`Test Sentry`)
    })
}
