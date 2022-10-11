const Stream = require("stream");

const { Probot, ProbotOctokit } = require("probot");
const nock = require("nock");
const pino = require("pino");

const app = require("../../app");

// fixtures
const issueCommentCreatedPayload = require("../fixtures/issue_comment.created.json");
const issueCommentCreatedExistContributorPayload = require("../fixtures/issue_comment.created.exist-contributor.json");
const issueCommentCreatedByAppPayload = require("../fixtures/issue_comment.created-by-app.json");
const issueCommentCreatedNotForAppPayload = require("../fixtures/issue_comment.created-not-for-app.json");
const issueCommentCreatedPayloadUnknownIntention = require("../fixtures/issue_commented.created.unknown-intention.json");
const issueCommentCreatedPayloadUnknownContribution = require("../fixtures/issue_comment.created-unknown-contribution.json");
const issueCommentCreatedMultipleContributorsPayload = require("../fixtures/issue_comment.created-multiple-contributors.json");
const reposGetContentsAllContributorsRCdata = require("../fixtures/repos.getContents.all-contributorsrc.json");
const reposGetContentsAllContributorsRCdata26files = require("../fixtures/repos.getContents.all-contributorsrc-26-files.json");
const reposGetContentsAllContributorsRCdataSkipCiFalse = require("../fixtures/repos.getContents.all-contributorsrc-skip-ci-false.json");
const reposGetContentsAllContributorsRCdataInvalidSyntax = require("../fixtures/repos.getContents.all-contributorsrc-invalid-syntax.json");
const usersGetByUsernameGr2mData = require("../fixtures/users.getByUsername.gr2m.json");
const usersGetByUsernameJakeBolamdata = require("../fixtures/users.getByUsername.jakebolam.json");
const usersGetByUsernameTenshiamdData = require("../fixtures/users.getByUsername.tenshiamd.json");
const usersGetByUsernameNoBlogAndNameData = require("../fixtures/users.getByUsername.without-name-and-blog.json");
const reposGetContentsREADMEMDdata = require("../fixtures/repos.getContents.README.md.json");
const gitGetRefdata = require("../fixtures/git.getRef.json");
const gitCreateRefdata = require("../fixtures/git.createRef.json");
const reposUpdateFiledata = require("../fixtures/repos.updateFile.json");
const pullsCreatedata = require("../fixtures/pulls.create.json");

let output = [];
const streamLogsToOutput = new Stream.Writable({ objectMode: true });
streamLogsToOutput._write = (object, encoding, done) => {
  const { pid, time, hostname, ...data } = JSON.parse(object);
  output.push(data);
  done();
};

const Octokit = ProbotOctokit.defaults({
  log: pino(streamLogsToOutput),
  // Disable throttling & retrying requests for easier testing
  retry: { enabled: false },
  throttle: { enabled: false },
});

nock.disableNetConnect();

describe("issue_comment event", () => {
  let probot;

  beforeEach(async () => {
    output = [];
    probot = new Probot({
      githubToken: "test",
      Octokit,
      log: pino(streamLogsToOutput),
    });

    await probot.load(app);
  });

  test("Happy path, add correct new contributor", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(200, reposGetContentsAllContributorsRCdata)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameJakeBolamdata)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master"
      )
      .reply(200, reposGetContentsREADMEMDdata)

      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fmaster`
      )
      .reply(200, gitGetRefdata)

      .post(`/repos/all-contributors/all-contributors-bot/git/refs`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, gitCreateRefdata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/README.md`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .post(`/repos/all-contributors/all-contributors-bot/pulls`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, pullsCreatedata)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Happy path, add correct new contributor, no allcontributors file (repo needs init first)", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(404)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameJakeBolamdata)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master"
      )
      .reply(200, reposGetContentsREADMEMDdata)

      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fmaster`
      )
      .reply(200, gitGetRefdata)

      .post(`/repos/all-contributors/all-contributors-bot/git/refs`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, gitCreateRefdata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(201, reposUpdateFiledata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/README.md`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .post(`/repos/all-contributors/all-contributors-bot/pulls`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, pullsCreatedata)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Fail path, no readme file (configuration error)", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(200, reposGetContentsAllContributorsRCdata)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameJakeBolamdata)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master"
      )
      .reply(404)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Fail path, no such user", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(200, reposGetContentsAllContributorsRCdata)
      .get("/users/jakebolam")
      .reply(404)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Fail path, Unknown user intention", async () => {
    const mock = nock("https://api.github.com")
      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayloadUnknownIntention,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Fail path, Unknown error (e.g. Network is dead, service down etc, our code is bad) crashes and sends error message", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(500)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    try {
      await probot.receive({
        name: "issue_comment",
        id: "1",
        payload: issueCommentCreatedPayload,
      });
      throw new Error("should not resolve");
    } catch (error) {
      expect(error instanceof Error).toBeTruthy();
    }

    // TODO: there is some race condition here. The assertion below fails,
    //       but only when all tests are run. It passes when this test is run in isolation
    // expect(mock.activeMocks()).toStrictEqual([]);

    // Normalize output before comparing
    delete output[0].stack;
    delete output[0].request.headers["user-agent"];

    expect(output).toMatchSnapshot("logs");
  });

  test("Happy path, add correct new contributor, but branch exists", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(200, gitGetRefdata)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc"
      )
      .query({ ref: "all-contributors/add-jakebolam" })
      .reply(200, reposGetContentsAllContributorsRCdata)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameJakeBolamdata)

      .get("/repos/all-contributors/all-contributors-bot/contents/README.md")
      .query({ ref: "all-contributors/add-jakebolam" })
      .reply(200, reposGetContentsREADMEMDdata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/README.md`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .post(`/repos/all-contributors/all-contributors-bot/pulls`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, pullsCreatedata)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Happy path, add correct new contributor, but branch exists and PR is open", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(200, gitGetRefdata)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc"
      )
      .query({ ref: "all-contributors/add-jakebolam" })
      .reply(200, reposGetContentsAllContributorsRCdata)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameJakeBolamdata)

      .get("/repos/all-contributors/all-contributors-bot/contents/README.md")
      .query({ ref: "all-contributors/add-jakebolam" })
      .reply(200, reposGetContentsREADMEMDdata)

      .get("/repos/all-contributors/all-contributors-bot/pulls")
      .query({
        state: "open",
        head: "all-contributors:all-contributors/add-jakebolam",
      })
      .reply(200, [
        {
          html_url:
            "https://github.com/all-contributors/all-contributors-bot/pull/1",
        },
      ])

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/README.md`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .post(`/repos/all-contributors/all-contributors-bot/pulls`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(422)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Fail path, add existing contributor with already exist contribution type", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(200, reposGetContentsAllContributorsRCdata)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameJakeBolamdata)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedExistContributorPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test(".all-contributorsrc has 26 files", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameJakeBolamdata)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(200, reposGetContentsAllContributorsRCdata26files)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("invalid .all-contributorsrc", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(200, reposGetContentsAllContributorsRCdataInvalidSyntax)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("User has no name and blog", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(200, reposGetContentsAllContributorsRCdata)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameNoBlogAndNameData)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master"
      )
      .reply(200, reposGetContentsREADMEMDdata)

      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fmaster`
      )
      .reply(200, gitGetRefdata)

      .post(`/repos/all-contributors/all-contributors-bot/git/refs`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, gitCreateRefdata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/README.md`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .post(`/repos/all-contributors/all-contributors-bot/pulls`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, pullsCreatedata)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("skipCi=false", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-jakebolam`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .reply(200, reposGetContentsAllContributorsRCdataSkipCiFalse)

      .get("/users/jakebolam")
      .reply(200, usersGetByUsernameJakeBolamdata)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master"
      )
      .reply(200, reposGetContentsREADMEMDdata)

      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fmaster`
      )
      .reply(200, gitGetRefdata)

      .post(`/repos/all-contributors/all-contributors-bot/git/refs`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, gitCreateRefdata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/README.md`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200, reposUpdateFiledata)

      .post(`/repos/all-contributors/all-contributors-bot/pulls`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .reply(201, pullsCreatedata)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Unknown contribution", async () => {
    const mock = nock("https://api.github.com")
      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedPayloadUnknownContribution,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });

  test("Comment is by app itself", async () => {
    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedByAppPayload,
    });
  });

  test("Comment is not for app", async () => {
    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedNotForAppPayload,
    });
  });

  test("Happy path, add correct new multiple contributors", async () => {
    const mock = nock("https://api.github.com")
      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-gr2m`
      )
      .reply(404)

      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fall-contributors%2Fadd-tenshiamd`
      )
      .reply(404)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc?ref=master"
      )
      .twice()
      .reply(200, reposGetContentsAllContributorsRCdata)

      .get("/users/gr2m")
      .reply(200, usersGetByUsernameGr2mData)
      
      .get("/users/tenshiamd")
      .reply(200, usersGetByUsernameTenshiamdData)

      .get(
        "/repos/all-contributors/all-contributors-bot/contents/README.md?ref=master"
      )
      .twice()
      .reply(200, reposGetContentsREADMEMDdata)

      .get(
        `/repos/all-contributors/all-contributors-bot/git/ref/heads%2Fmaster`
      )
      .twice()
      .reply(200, gitGetRefdata)

      .post(`/repos/all-contributors/all-contributors-bot/git/refs`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .twice()
      .reply(201, gitCreateRefdata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/.all-contributorsrc`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .twice()
      .reply(200, reposUpdateFiledata)

      .put(
        `/repos/all-contributors/all-contributors-bot/contents/README.md`,
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .twice()
      .reply(200, reposUpdateFiledata)

      .post(`/repos/all-contributors/all-contributors-bot/pulls`, (body) => {
        expect(body).toMatchSnapshot("request body");
        return true;
      })
      .twice()
      .reply(201, pullsCreatedata)

      .post(
        "/repos/all-contributors/all-contributors-bot/issues/1/comments",
        (body) => {
          expect(body).toMatchSnapshot("request body");
          return true;
        }
      )
      .reply(200);

    await probot.receive({
      name: "issue_comment",
      id: "1",
      payload: issueCommentCreatedMultipleContributorsPayload,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
    expect(output).toMatchSnapshot("logs");
  });
});
