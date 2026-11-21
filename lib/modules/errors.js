export class AllContributorBotError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ResourceNotFoundError extends AllContributorBotError {
  constructor(filepath, fullRepoName) {
    super(`File ${filepath} was not found in the repository (${fullRepoName}).`);
    this.name = this.constructor.name;
  }
}

export class BranchNotFoundError extends AllContributorBotError {
  constructor(branchName) {
    super(`${branchName} does not exist`);
    this.name = this.constructor.name;
  }
}

export class EmptyRepositoryError extends AllContributorBotError {
  constructor(fullRepoName) {
    super(
      `I can't find any commits in the repository (${fullRepoName}). Please add at least one commit, including a README.md with the all-contributors table, and ask me again.`,
    );
    this.name = this.constructor.name;
  }
}

export class UserNotFoundError extends AllContributorBotError {
  constructor(username) {
    super(`Could not find the user \`${username}\` on github.`);
    this.name = this.constructor.name;
  }
}
