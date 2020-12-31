const Stream = require("stream");

const { Probot, ProbotOctokit } = require("probot");
const pino = require("pino");

const app = require("../../app");

// fixtures
const installationCreated = require("../fixtures/installation.created.json");

let output = [];
const streamLogsToOutput = new Stream.Writable({ objectMode: true });
streamLogsToOutput._write = (object, encoding, done) => {
  const { pid, time, hostname, ...data } = JSON.parse(object);
  output.push(data);
  done();
};

describe("installation event", () => {
  let probot;

  beforeEach(async () => {
    output = [];
    probot = new Probot({
      githubToken: "test",
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

  test("installation.created", async () => {
    await probot.receive({
      name: "installation",
      payload: installationCreated,
    });

    expect(output).toMatchSnapshot();
  });
});
