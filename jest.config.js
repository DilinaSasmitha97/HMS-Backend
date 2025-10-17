module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};
