module.exports = addContributor;

const { generatePrTitle } = require("./modules/helpers");
const getUserDetails = require("./get-user-details");
const handlePullRequest = require("./handle-pull-request");

async function addContributor({
  context,
  commentReply,
  repository,
  config,
  who,
  contributions,
  branchName,
}) {
  // get user information
  const { id, login, name, avatar_url, profile } = await getUserDetails({
    octokit: context.octokit,
    username: who,
  });

  if (config.isContributorWithRequestedContributionTypeAlreadyExists({ login: who, contributions })) {
    // let user know in comment
    const message = `@${who} already contributed before to ${contributions.join(", ")}`;

    commentReply.reply(message);
    return {}
  }

  // add user to configuration
  await config.addContributor({
    login: who,
    contributions,
    name,
    avatar_url,
    profile,
  });

  const prContentTitle = generatePrTitle(`add ${who} as a contributor`, contributions);
  const prContentMessage = `Adds @${who} as a contributor for ${contributions.join(
    ", "
  )}.\n\nThis was requested by ${commentReply.replyingToWho()} [in this comment](${commentReply.replyingToWhere()})`

  const { pullRequestURL, pullCreated } = await handlePullRequest({
    commentReply,
    repository,
    config,
    prContentTitle,
    prContentMessage,
    branchName,
  });

  return { pullRequestURL, pullCreated, user: { id, login } };
}
