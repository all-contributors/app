import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { schemas } from '@octokit/openapi-webhooks';
import { describe, expect, test } from 'vitest';

const openapi = schemas['api.github.com'];
const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

// Structure only — we don't check types or values.
const installationFields = [
  'action',
  'installation.id',
  'installation.account.id',
  'installation.account.login',
  'installation.account.type',
  'installation.repository_selection',
];

const issueCommentFields = [
  'action',
  'comment.body',
  'comment.html_url',
  'comment.user.id',
  'comment.user.login',
  'comment.user.type',
  'repository.default_branch',
  'repository.id',
  'repository.private',
  'repository.owner.id',
  'repository.owner.login',
  'repository.owner.type',
  'sender.login',
];

// [fixtureFile, schemaName, fields the bot reads]
const fixtures = [
  [
    'installation.created.json',
    'webhook-installation-created',
    [...installationFields, 'repositories'],
  ],
  [
    'installation.deleted.json',
    'webhook-installation-deleted',
    [...installationFields, 'repositories'],
  ],
  ['installation.suspend.json', 'webhook-installation-suspend', installationFields],
  [
    'installation_repositories.added.json',
    'webhook-installation-repositories-added',
    [...installationFields, 'repositories_added', 'repositories_removed'],
  ],
  ['issue_comment.created.json', 'webhook-issue-comment-created', issueCommentFields],
  [
    'issue_comment.created-multiple-contributors.json',
    'webhook-issue-comment-created',
    issueCommentFields,
  ],
  [
    'issue_comment.created-unknown-contribution.json',
    'webhook-issue-comment-created',
    issueCommentFields,
  ],
  [
    'issue_comment.created.exist-contributor.json',
    'webhook-issue-comment-created',
    issueCommentFields,
  ],
  [
    'issue_commented.created.unknown-intention.json',
    'webhook-issue-comment-created',
    issueCommentFields,
  ],
  // Early-return fixtures: only fields that path reads
  [
    'issue_comment.created-by-app.json',
    'webhook-issue-comment-created',
    ['action', 'sender.login'],
  ],
  [
    'issue_comment.created-not-for-app.json',
    'webhook-issue-comment-created',
    ['action', 'comment.body', 'sender.login'],
  ],
];

function getByPath(obj, path) {
  return path.split('.').reduce((value, key) => value?.[key], obj);
}

function resolveSchema(schema) {
  if (schema?.$ref) {
    const name = schema.$ref.replace('#/components/schemas/', '');
    return openapi.components.schemas[name];
  }
  return schema;
}

function schemaDefinesPath(schema, path) {
  let current = resolveSchema(schema);
  for (const key of path.split('.')) {
    current = resolveSchema(current);
    if (current?.anyOf) {
      current = current.anyOf.map(resolveSchema).find((option) => option?.properties?.[key]);
    } else {
      current = current?.properties?.[key];
    }
    if (!current) {
      return false;
    }
  }
  return true;
}

describe('webhook fixtures', () => {
  test.each(fixtures)(
    '%s has contract fields from GitHub schema',
    (fixtureFile, schemaName, fields) => {
      const fixture = JSON.parse(readFileSync(join(fixturesDir, fixtureFile), 'utf8'));
      const ghSchema = openapi.components.schemas[schemaName];

      expect(ghSchema).toBeDefined();

      for (const field of fields) {
        expect(schemaDefinesPath(ghSchema, field), field).toBe(true);
        expect(getByPath(fixture, field), field).toBeDefined();
      }
    },
  );
});
