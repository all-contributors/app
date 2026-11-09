import { defineConfig, type OxfmtConfig } from 'oxfmt';

const config: OxfmtConfig = defineConfig({
  ignorePatterns: [
    '/.all-contributorsrc',
    '/CHANGELOG.md',
    '/coverage',
    '/dist',
    '/package-lock.json',
  ],
  overrides: [{ files: ['.nvmrc'], options: { parser: 'yaml' } }],
  singleQuote: true,
  sortImports: true,
  sortPackageJson: false,
});

export default config;
