// @ts-check
/** @type {import("jest").Config} */
export default {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  snapshotFormat: {
    escapeString: false
  }
};
