const GIHUB_BOT_NAME = '@AllContributorsBot'
const ALL_CONTRIBUTORS_RC = '.all-contributorsrc'

const getFileContents = async (context, filePath) => {
    const { repo, owner } = context.repo()
    const file = await context.github.repos.getContents({
        owner,
        repo,
        path: filePath,
    })
    app.log(file)

    // contents can be an array if its a directory, should be an edge case
    const contentBinary = file.data.content
    const content = Buffer.from(contentBinary, 'base64').toString()
    app.log(content)
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

        let readmeFileContentsList
        if (rcFileContent.files) {
            if (rcFileContent.files.length > 2) {
                throw new Error(`Cannot update more than 2 files`)
            }
            const rcFileContentPromises = rcFileContent.files.map(filePath => {
                getFileContents(context, filePath).then(content => {
                    return {
                        filePath,
                        content,
                    }
                })
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

        // const results = addContributor({
        //   rcFileContent: content
        //   readmeFileContentsList
        //   username: 'blah',
        //   contributors: 'blah'
        // })
        //
        // results.rcFileContent
        // results.readMeFileContent
    })

    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
}
