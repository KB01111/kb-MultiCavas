// jest.config.js
const nextJest = require("next/jest")();

/** @type {import("jest").Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest",
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured by next/jest)
    // Example: if you have aliases in tsconfig.json
    // "^@/components/(.*)$": "<rootDir>/src/components/$1",
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
    "/public/",
    "jest.config.js",
    "jest.setup.js",
    "next.config.js", // Assuming you have this file
    "postcss.config.js",
    "tailwind.config.js",
    "src/app/types.ts" // Ignore type definitions
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
};

// createJestConfig is configured in next.config.js and exported in this way to ensure that next/jest can load the Next.js config which is async
// It automatically sets up transformations, module aliases based on tsconfig.json paths, etc.
module.exports = nextJest(config);

