module.exports = addContributor;

const getUserDetails = require("./get-user-details");
const ContentFiles = require("./content-files");

async function addContributor({
  context,
  commentReply,
  repository,
  optionsConfig,
  who,
  contributions,
  branchName,
}) {
  if (contributions.length === 0) {
    context.log.debug("No contributions");
    return commentReply.reply(
      `I couldn't determine any contributions to add, did you specify any contributions?
          Please make sure to use [valid contribution names](https://allcontributors.org/docs/en/emoji-key).`
    );
  }
  const { name, avatar_url, profile } = await getUserDetails({
    octokit: context.octokit,
    username: who,
  });

  await optionsConfig.addContributor({
    login: who,
    contributions,
    name,
    avatar_url,
    profile,
  });

  const contentFiles = new ContentFiles({
    repository,
  });
  await contentFiles.fetch(optionsConfig);
  if (optionsConfig.getOriginalSha() === undefined) {
    contentFiles.init();
  }
  contentFiles.generate(optionsConfig);
  const filesByPathToUpdate = contentFiles.get();
  filesByPathToUpdate[optionsConfig.getPath()] = {
    content: optionsConfig.getRaw(),
    originalSha: optionsConfig.getOriginalSha(),
  };

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

  if (pullCreated) {
    commentReply.reply(
      `I've put up [a pull request](${pullRequestURL}) to add @${who}! :tada:`
    );
    return;
  }
  // Updated
  commentReply.reply(
    `I've updated [the pull request](${pullRequestURL}) to add @${who}! :tada:`
  );
}
