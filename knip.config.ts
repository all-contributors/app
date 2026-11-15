import { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['app.js', 'api/github/webhooks.js'],
  treatConfigHintsAsErrors: true,
};

export default config;
