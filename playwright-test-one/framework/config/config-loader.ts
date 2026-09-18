import fs from 'node:fs';
import path from 'node:path';

export function loadJsonConfig(fileName: string): Record<string, string> {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) throw new Error(`Config file not found: ${filePath}`);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(parsed).filter(([key, value]) => !key.startsWith('_comment') && value !== null && value !== undefined).map(([key, value]) => [key, String(value)]));
}

export class Properties {
  public constructor(private readonly values: Record<string, string>, private readonly source: string) {}
  public get(key: string): string { const value = this.values[key]; if (value === undefined) throw new Error(`Missing property "${key}" in ${this.source}`); return value; }
  public getOr(key: string, fallback: string): string { return this.values[key] ?? fallback; }
  public getNumber(key: string): number { const value = Number(this.get(key)); if (Number.isNaN(value)) throw new Error(`Property "${key}" in ${this.source} is not a number`); return value; }
  public getBoolean(key: string): boolean { return /^(true|yes|1)$/i.test(this.get(key)); }
  public has(key: string): boolean { return this.values[key] !== undefined; }
}

export const xpaths = new Properties(loadJsonConfig('xpaths.json'), 'xpaths.json');
export const testdata = new Properties(loadJsonConfig('testdata.json'), 'testdata.json');
