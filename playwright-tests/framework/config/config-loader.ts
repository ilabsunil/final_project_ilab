import fs from 'node:fs';
import path from 'node:path';

// JSON configuration files are kept beside this loader for easy maintenance.
const configDirectory = __dirname;

export type LocatorConfig = {
  usernameInput: string;
  passwordInput: string;
  signInButton: string;
  signOutButton: string;
  welcomeHeading: string;
};

export type CoverageConfig = {
  // Turn the coverage plugin integration on or off without touching any test code.
  enabled: boolean;
  // Base URL of the Coverage Intelligence API (the .NET service on port 5070).
  apiBaseUrl: string;
  // Friendly session name recorded against every automation run.
  sessionName: string;
};

export type TestDataConfig = {
  baseUrl: string;
  credentials: { username: string; password: string };
  coverage: CoverageConfig;
};

function loadJson<T>(fileName: string): T {
  // Read and strongly type a JSON configuration file.
  return JSON.parse(fs.readFileSync(path.join(configDirectory, fileName), 'utf8')) as T;
}

// Export selectors and test data for page objects and test cases.
export const locators = loadJson<LocatorConfig>('locators.json');
export const testData = loadJson<TestDataConfig>('test-data.json');