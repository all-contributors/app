module.exports = handlePullRequest;

const { generatePrBody } = require("./modules/helpers");
const ContentFiles = require("./modules/content-files");
const convertMessage = require("commit-conv");

async function handlePullRequest({
  commentReply,
  repository,
  config,
  prContentTitle,
  prContentMessage,
  branchName,
}) {
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

  const convention = config.get().commitConvention;
  const prTitle = convertMessage({
    tag: "docs",
    msg: prContentTitle,
    convention
  });

  const skipCi = config.get().skipCi;
  const prBody = generatePrBody(prContentMessage, skipCi);

  // create or update pull request
  const {
    pullRequestURL,
    pullCreated,
  } = await repository.createPullRequestFromFiles({
    title: prTitle,
    body: prBody,
    filesByPath: filesByPathToUpdate,
    branchName,
    convention,
  });

  // let user know in comment
  const message = pullCreated
    ? `I've put up [a pull request](${pullRequestURL})! :tada:`
    : `I've updated [the pull request](${pullRequestURL})! :tada:`;

  commentReply.reply(message);

  return { pullRequestURL, pullCreated };
}
