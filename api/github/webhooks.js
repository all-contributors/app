import { createNodeMiddleware, createProbot } from "probot";

import app from "../../app.js";

export default createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/github/webhooks",
});
