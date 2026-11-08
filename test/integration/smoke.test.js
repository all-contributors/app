import nock from "nock";
import { Probot } from "probot";
import { test } from "vitest";

import app from "../../app.js";

nock.disableNetConnect();

test("smoke test", async () => {
  const probot = new Probot({
    appId: 1,
    privateKey: "secret",
  });
  await probot.load(app);
});
