module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.d.ts",
    "!src/app/**",
    "!src/proxy.js",
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 50,
      lines: 50,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testTimeout: 10000,
  bail: false,
};
