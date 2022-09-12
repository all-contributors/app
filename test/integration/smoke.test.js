const nock = require("nock");
const { Probot } = require("probot");

const app = require("../../app");

nock.disableNetConnect();

test("smoke test", async () => {
  const probot = new Probot({
    appId: 1,
    privateKey: "secret",
  });
  await probot.load(app);
});
