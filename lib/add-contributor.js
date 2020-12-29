module.exports = addContributor;

const getUserDetails = require("./get-user-details");
const ContentFiles = require("./modules/content-files");

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
  const { name, avatar_url, profile } = await getUserDetails({
    octokit: context.octokit,
    username: who,
  });

  // add user to configuration
  await config.addContributor({
    login: who,
    contributions,
    name,
    avatar_url,
    profile,
  });

  // fetch all files that are configured in .all-contributors.rc ("files" key)
  const contentFiles = new ContentFiles({
    repository,
  });
  await contentFiles.fetch(config);
  if (config.getOriginalSha() === undefined) {
    contentFiles.init();
  }
  contentFiles.generate(config);
  const filesByPathToUpdate = contentFiles.get();

  // add the `.all-contributorsrc` config file to list of files to update in PR
  filesByPathToUpdate[config.getPath()] = {
    content: config.getRaw(),
    originalSha: config.getOriginalSha(),
  };

  // create or update pull request
  const {
    pullRequestURL,
    pullCreated,
  } = await repository.createPullRequestFromFiles({
    title: `docs: add ${who} as a contributor`,
    body: `Adds @${who} as a contributor for ${contributions.join(
      ", "
    )}.\n\nThis was requested by ${commentReply.replyingToWho()} [in this comment](${commentReply.replyingToWhere()})`,
    filesByPath: filesByPathToUpdate,
    branchName,
  });

  // let user know in comment
  const message = pullCreated
    ? `I've put up [a pull request](${pullRequestURL}) to add @${who}! :tada:`
    : `I've updated [the pull request](${pullRequestURL}) to add @${who}! :tada:`;

  commentReply.reply(message);
}
