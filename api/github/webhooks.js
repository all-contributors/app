const { createNodeMiddleware, createProbot } = require("probot");
const pino = require("pino");

const app = require("../../app");

module.exports = createNodeMiddleware(app, {
  probot: createProbot({
    overrides: {
      log: pino(),
    },
  }),
  webhooksPath: "/api/github/webhooks",
});
