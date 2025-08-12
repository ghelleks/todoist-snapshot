module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFiles: ['<rootDir>/tests/setup/test-env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/mocks/google-apps-script.js'],
  collectCoverageFrom: [
    'todoist-snapshot.gs',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000
};