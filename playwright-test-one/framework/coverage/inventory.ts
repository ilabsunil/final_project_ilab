import fs from 'node:fs';
import path from 'node:path';
import { testdata } from '../config/config-loader';

export type Functionality = { id: string; name: string; event: string };
export type SubModule = { id: string; name: string; functionality: Functionality[]; workflows: string[] };
export type Module = { id: string; name: string; path: string; risk: string; subModules: SubModule[] };
type RawInventory = { application: { name: string; routes: Array<{ id: string; path: string; name: string; risk: string; components: Array<{ id: string; name: string; actions: Functionality[]; workflows?: string[] }> }> } };
const inventoryPath = path.resolve(__dirname, '..', '..', testdata.get('COVERAGE_INVENTORY_PATH'));
export function loadInventory(): { appName: string; modules: Module[] } {
  if (!fs.existsSync(inventoryPath)) throw new Error(`CoverageEngine inventory not found at ${inventoryPath}`);
  const raw = JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) as RawInventory;
  return { appName: raw.application.name, modules: raw.application.routes.map((route) => ({ id: route.id, name: route.name, path: route.path, risk: route.risk, subModules: route.components.map((component) => ({ id: component.id, name: component.name, workflows: component.workflows ?? [], functionality: component.actions.map((action) => ({ id: action.id, name: action.name, event: action.event })) })) })) };
}
export function inventoryTotals(modules: Module[]): { modules: number; subModules: number; functionality: number; nodes: number } { const subModules = modules.reduce((n, m) => n + m.subModules.length, 0); const functionality = modules.reduce((n, m) => n + m.subModules.reduce((k, s) => k + s.functionality.length, 0), 0); return { modules: modules.length, subModules, functionality, nodes: modules.length + subModules + functionality }; }
