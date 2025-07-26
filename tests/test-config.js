// Test configuration for README link validation
module.exports = {
  testTimeout: 30000,
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: false,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};