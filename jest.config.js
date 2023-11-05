module.exports = {
  roots: ["<rootDir>/tests"],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/tests/**/*.ts", "!src/main/**"],
  coverageDirectory: "coverage",
  testMatch: ["<rootDir>/tests/**/*.(test).{js,jsx,ts,tsx}"],
  transform: {
    ".+\\.ts$": "ts-jest",
  },
};
