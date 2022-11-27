// @ts-check
/** @type {import("jest").Config} */
export default {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  snapshotFormat: {
    escapeString: false,
  },
  // https://github.com/swc-project/jest/issues/64#issuecomment-1029753225
  // To support TypeScript .js extension maps to .ts file.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
