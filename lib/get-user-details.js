module.exports = getUserDetails;

const { UserNotFoundError } = require("./modules/errors");
const { generateValidProfileLink } = require("./modules/helpers");

async function getUserDetails({ octokit, username }) {
  // TODO: optimization, if commenting user is the user we're adding we can avoid an api call
  // const commentUser = context.payload.comment.user.login
  // if (user === commentUser) {
  //     return {
  //         name: context.payload.comment.user.name
  //         avatarUrl: context.payload.comment.avatar_url
  //         profile:
  //     }
  // }

  let result;
  try {
    result = await octokit.users.getByUsername({ username });
  } catch (error) {
    /* istanbul ignore if */
    if (error.status !== 404) {
      throw error;
    }

    throw new UserNotFoundError(username);
  }

  const { id, login, avatar_url, blog, html_url, name } = result.data;

  return {
    id,
    login,
    name: name || username,
    avatar_url,
    profile: generateValidProfileLink(blog, html_url),
  };
}
