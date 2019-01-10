async function getUserDetials({ context, username }) {
    // TODO: optimzation, if commenting user is the user we're adding we can avoid an api call
    // const commentUser = context.payload.comment.user.login
    // if (user === commentUser) {
    //     return {
    //         name: context.payload.comment.user.name
    //         avatarUrl: context.payload.comment.avatar_url
    //         profile:
    //     }
    // }

    const result = await context.github.users.getByUsername({ username })
    const { avatar_url, blog, html_url, name } = result.data

    return {
        name: name || username,
        avatar_url,
        profile: blog || html_url,
    }
}

module.exports = getUserDetials
