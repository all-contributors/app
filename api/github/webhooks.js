const { createNodeMiddleware, createProbot } = require("probot");

const app = require("../../app");
const probot = createProbot({
  overrides: {
    // override default "/" path
    webhookPath: "/api/github/webhooks",
  },
});

module.exports = createNodeMiddleware(app, { probot });
