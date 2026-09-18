// Loads JSON config files (xpaths.json, testdata.json) into strict, typed lookups.
// ALL XPaths live in xpaths.json and ALL data in testdata.json, so tests and page objects
// never hard-code a selector or a value — change the JSON, every script follows.
// Values may be strings, numbers or booleans; a leading "_comment" key is ignored.
import fs from 'node:fs';
import path from 'node:path';

const configDirectory = __dirname;

// Read a JSON config file into a flat key/value map. All keys live at the top level (one
// place); `_comment*` keys are treated as documentation and ignored. This keeps every
// locator/data key UNIQUE and directly addressable via `xpaths.get('LOGIN_EMAIL_INPUT')`.
export function loadJsonConfig(fileName: string): Record<string, string> {
  const filePath = path.join(configDirectory, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    // Skip documentation keys (e.g. "_comment", "_comment_login") and empty values.
    if (key.startsWith('_comment') || value === null || value === undefined) continue;
    values[key] = String(value);
  }
  return values;
}

// Strict accessor: a typo in a key fails immediately with a clear message.
export class Properties {
  public constructor(
    private readonly values: Record<string, string>,
    private readonly source: string,
  ) {}

  public get(key: string): string {
    const value = this.values[key];
    if (value === undefined) {
      throw new Error(`Missing property "${key}" in ${this.source}`);
    }
    return value;
  }

  public getOr(key: string, fallback: string): string {
    return this.values[key] ?? fallback;
  }

  public getNumber(key: string): number {
    const value = Number(this.get(key));
    if (Number.isNaN(value)) {
      throw new Error(`Property "${key}" in ${this.source} is not a number`);
    }
    return value;
  }

  public getBoolean(key: string): boolean {
    return /^(true|yes|1)$/i.test(this.get(key));
  }

  public has(key: string): boolean {
    return this.values[key] !== undefined;
  }
}

// XPath / locator repository (unique UPPER_SNAKE keys) — from xpaths.json.
export const xpaths = new Properties(loadJsonConfig('xpaths.json'), 'xpaths.json');

// Test data & environment (unique UPPER_SNAKE keys) — from testdata.json.
export const testdata = new Properties(loadJsonConfig('testdata.json'), 'testdata.json');
