import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
    },
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.js'],
  },
})
