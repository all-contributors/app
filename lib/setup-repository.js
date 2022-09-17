module.exports = setupRepository;

const Repository = require("./modules/repository");
const { BranchNotFoundError } = require("./modules/errors");

async function setupRepository({ context, branchName }) {
  const repository = new Repository(context);

  const hasOpenPullRequest = async ({branchName}) => {
    const result = await repository.getPullRequestsBy({
      branchName,
      state: "open"
    });

    // TODO: Possibly make sure the existing pull request is created by the bot?
    return result.data.length > 0;
  };

  try {
    await repository.getRef(branchName);
    const openPrExists = await hasOpenPullRequest(branchName)

    context.log.debug(
      `Branch "${branchName}" exists, will work from this branch`
    );
 
    if (!openPrExists) {
      repository.deleteBranch(branchName);
    }

    repository.setBaseBranch(branchName);
  } catch (error) {
    const isBranchNotFoundError = error instanceof BranchNotFoundError;

    /* istanbul ignore if */
    if (!isBranchNotFoundError) {
      throw error;
    }

    context.log.debug(
      `Branch "${branchName}" does not exist, will work from default branch`
    );
  }

  return repository;
}
