import { UserNotFoundError } from './modules/errors.js';
import { generateValidProfileLink } from './modules/helpers.js';

/**
 * Fetches a GitHub user's details and normalizes them for the contributors config.
 *
 * @param {object} params
 * @param {object} params.octokit
 * @param {string} params.username
 * @returns {Promise<{id: number, login: string, name: string, avatar_url: string, profile: string}>}
 */
export default async function getUserDetails({ octokit, username }) {
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
