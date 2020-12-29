const { createNodeMiddleware, createProbot } = require("probot");

const app = require("../../app");
const probot = createProbot();

module.exports = createNodeMiddleware(app, { probot });
