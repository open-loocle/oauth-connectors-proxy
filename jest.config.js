module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testRegex: ".*\.test\.ts",
  collectCoverage: true,
};
process.env = Object.assign(process.env, {
  OAUTH_SLACK_CLIENT_ID: 'client_id',
  OAUTH_SLACK_CLIENT_SECRET: 'client_secret',
  OAUTH_DEMO_SLACK_ACCESS_TOKEN: 'access_token',
  ACCESS_CONTROL_ALLOW_ORIGIN: 'http://localhost:3000',
  OAUTH_GITHUB_CLIENT_SECRET: 'client_secret',
});
