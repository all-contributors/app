// Every webhook payload field the app reads, keyed by the name the app uses
// for it. The app reads payloads only through the helpers below (enforced by
// ESLint), and test/unit/webhook-fixtures.test.js checks these paths against
// GitHub's webhook schema and our fixtures.

export const installationFields = {
  accountId: 'installation.account.id',
  accountLogin: 'installation.account.login',
  accountType: 'installation.account.type',
  action: 'action',
  installationId: 'installation.id',
  repositorySelection: 'installation.repository_selection',
};

// Only present on some installation events (see the fixtures test)
export const installationRepositoriesFields = {
  repositories: 'repositories',
  repositoriesAdded: 'repositories_added',
  repositoriesRemoved: 'repositories_removed',
};

export const issueCommentFields = {
  authorId: 'comment.user.id',
  authorLogin: 'comment.user.login',
  authorType: 'comment.user.type',
  commentBody: 'comment.body',
  commentUrl: 'comment.html_url',
  defaultBranch: 'repository.default_branch',
  ownerId: 'repository.owner.id',
  ownerLogin: 'repository.owner.login',
  ownerType: 'repository.owner.type',
  repoId: 'repository.id',
  repoPrivate: 'repository.private',
  senderLogin: 'sender.login',
};

export function readInstallation(payload) {
  return readFields(payload, { ...installationFields, ...installationRepositoriesFields });
}

export function readIssueComment(payload) {
  return readFields(payload, issueCommentFields);
}

function readFields(payload, fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([name, path]) => [
      name,
      path.split('.').reduce((value, key) => value?.[key], payload),
    ]),
  );
}
