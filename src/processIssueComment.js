const CommentReply = require('./CommentReply')
const Repository = require('./Repository')
const OptionsConfig = require('./OptionsConfig')
const ContentFiles = require('./ContentFiles')

const getUserDetails = require('./utils/getUserDetails')
const parseComment = require('./utils/parse-comment')

const isMessageForBot = require('./utils/isMessageForBot')
const { GIHUB_BOT_NAME } = require('./utils/settings')
const {
    AllContributorBotError,
    ResourceNotFoundError,
} = require('./utils/errors')

async function processAddContributor({
    context,
    commentReply,
    repository,
    optionsConfig,
    who,
    contributions,
}) {
    const { name, avatar_url, profile } = await getUserDetails({
        github: context.github,
        username: who,
    })

    await optionsConfig.addContributor({
        login: who,
        contributions,
        name,
        avatar_url,
        profile,
    })

    const contentFiles = new ContentFiles({
        repository,
    })
    await contentFiles.fetch(optionsConfig)
    if (optionsConfig.getOriginalSha() === undefined) {
        contentFiles.init()
    }
    contentFiles.generate(optionsConfig)
    const filesByPathToUpdate = contentFiles.get()
    filesByPathToUpdate[optionsConfig.getPath()] = {
        content: optionsConfig.getRaw(),
        originalSha: optionsConfig.getOriginalSha(),
    }

    const pullRequestURL = await repository.createPullRequestFromFiles({
        title: `docs: add ${who} as a contributor`,
        body: `Adds @${who} as a contributor for ${contributions.join(
            ', ',
        )}.\n\nThis was requested by ${commentReply.replyingToWho()} [in this comment](${commentReply.replyingToWhere()})`,
        filesByPath: filesByPathToUpdate,
        branchName: `all-contributors/add-${who}`,
    })

    commentReply.reply(
        `I've put up [a pull request](${pullRequestURL}) to add @${who}! :tada:`,
    )
}

async function processIssueComment({ context, commentReply }) {
    const repository = new Repository({
        ...context.repo(),
        github: context.github,
    })
    const optionsConfig = new OptionsConfig({
        repository,
        commentReply,
    })
    try {
        await optionsConfig.fetch()
    } catch (error) {
        if (error instanceof ResourceNotFoundError) {
            optionsConfig.init()
        } else {
            throw error
        }
    }

    const commentBody = context.payload.comment.body
    const parsedComment = parseComment(commentBody)

    if (parsedComment.action === 'add') {
        await processAddContributor({
            context,
            commentReply,
            repository,
            optionsConfig,
            who: parsedComment.who,
            contributions: parsedComment.contributions,
        })
        return
    }

    commentReply.reply(`I could not determine your intention.`)
    commentReply.reply(
        `Basic usage: @${GIHUB_BOT_NAME} please add jakebolam for code, doc and infra`,
    )
    commentReply(
        `For other usage see the [documentation](https://github.com/all-contributors/all-contributors-bot#usage)`,
    )
    return
}

async function processIssueCommentSafe({ context }) {
    if (context.isBot) {
        context.log.debug('From a bot, exiting')
        return
    }

    const commentBody = context.payload.comment.body
    if (!isMessageForBot(commentBody)) {
        context.log.debug('Message not for us, exiting')
        return
    }

    const commentReply = new CommentReply({ context })
    try {
        await processIssueComment({ context, commentReply })
    } catch (error) {
        if (error.handled) {
            context.log.debug(error)
        } else if (error instanceof AllContributorBotError) {
            context.log.info(error)
            commentReply.reply(error.message)
        } else {
            context.log.error(error)
            commentReply.reply(
                `We had trouble processing your request. Please try again later.`,
            )
            throw error
        }
    } finally {
        await commentReply.send()
    }
}

module.exports = processIssueCommentSafe
