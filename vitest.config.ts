import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
    },
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
})
