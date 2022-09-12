module.exports = setupRepository;

const Repository = require("./modules/repository");
const { BranchNotFoundError } = require("./modules/errors");

async function setupRepository({ context, branchName }) {
  const repository = new Repository(context);

  try {
    await repository.getRef(branchName);
    context.log.debug(
      `Branch "${branchName}" exists, will work from this branch`
    );
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
