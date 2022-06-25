import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  modulePathIgnorePatterns: ["pathfinder/src"]
};
export default config;

