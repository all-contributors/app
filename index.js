module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  // issueComment.edited
  app.on('issueComment.created', async context => {
    app.log(context)
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
