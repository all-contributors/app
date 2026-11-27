import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { schemas } from '@octokit/openapi-webhooks';
import { describe, expect, test } from 'vitest';

import {
  installationFields as installation,
  installationRepositoriesFields as installationRepositories,
  issueCommentFields as issueComment,
} from '../../lib/webhook-payload-fields.js';

const openapi = schemas['api.github.com'];
const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

// Structure only — we don't check types or values.
const installationFields = Object.values(installation);
const { repositories, repositoriesAdded, repositoriesRemoved } = installationRepositories;

// Probot routes events on `action`; everything else is what the app reads.
const issueCommentFields = ['action', ...Object.values(issueComment)];

// [fixtureFile, schemaName, fields the bot reads]
const fixtures = [
  [
    'installation.created.json',
    'webhook-installation-created',
    [...installationFields, repositories],
  ],
  [
    'installation.deleted.json',
    'webhook-installation-deleted',
    [...installationFields, repositories],
  ],
  ['installation.suspend.json', 'webhook-installation-suspend', installationFields],
  [
    'installation_repositories.added.json',
    'webhook-installation-repositories-added',
    [...installationFields, repositoriesAdded, repositoriesRemoved],
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
    ['action', issueComment.senderLogin],
  ],
  [
    'issue_comment.created-not-for-app.json',
    'webhook-issue-comment-created',
    ['action', issueComment.commentBody, issueComment.senderLogin],
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
    const options = current?.anyOf ?? current?.oneOf ?? current?.allOf;
    if (options) {
      current = options.map(resolveSchema).find((option) => option?.properties?.[key]);
    }
    current = current?.properties?.[key];
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
