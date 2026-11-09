import Stream from 'stream';

import pino from 'pino';
import { Probot, ProbotOctokit } from 'probot';
import { beforeEach, describe, expect, test } from 'vitest';

import app from '../../app.js';
// fixtures
import installationCreated from '../fixtures/installation.created.json';
import installationDeleted from '../fixtures/installation.deleted.json';
import installationSuspend from '../fixtures/installation.suspend.json';
import installationRepositoriesAdded from '../fixtures/installation_repositories.added.json';

let output = [];
const streamLogsToOutput = new Stream.Writable({ objectMode: true });
streamLogsToOutput._write = (object, encoding, done) => {
  const { pid, time, hostname, ...data } = JSON.parse(object);
  output.push(data);
  done();
};

describe('installation event', () => {
  let probot;

  beforeEach(async () => {
    output = [];
    probot = new Probot({
      githubToken: 'test',
      Octokit: ProbotOctokit.defaults({
        log: pino(streamLogsToOutput),
        // Disable throttling & retrying requests for easier testing
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
      log: pino(streamLogsToOutput),
    });

    await probot.load(app);
  });

  test('installation.created', async () => {
    await probot.receive({
      name: 'installation',
      id: '1',
      payload: installationCreated,
    });

    expect(output).toMatchSnapshot('logs');
  });

  test('installation.deleted', async () => {
    await probot.receive({
      name: 'installation',
      id: '1',
      payload: installationDeleted,
    });

    expect(output).toMatchSnapshot('logs');
  });

  test('installation_repositories.added', async () => {
    await probot.receive({
      name: 'installation_repositories',
      id: '1',
      payload: installationRepositoriesAdded,
    });

    expect(output).toMatchSnapshot('logs');
  });

  test('installation.suspend', async () => {
    await probot.receive({
      name: 'installation',
      id: '1',
      payload: installationSuspend,
    });

    expect(output).toMatchSnapshot('logs');
  });
});
