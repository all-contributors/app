const processIssueComment = require('./processIssueComment')

module.exports = app => {
    // issueComment.edited
    // Issue comments and PR comments both create issue_comment events
    app.on('issue_comment.created', async context => {
        app.log(context)
        await processIssueComment(context)
    })
}
