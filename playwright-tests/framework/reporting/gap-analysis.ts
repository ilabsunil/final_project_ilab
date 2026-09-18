// Test-gap analysis: compares the CoverageEngine inventory (every module → sub-module →
// functionality) against the hits recorded by the tests, and reports what was covered vs.
// what is UNTOUCHED (no test case exercised it).
import { readCoverageHits, type CoverageHit } from '../coverage/coverage-tracker';
import { inventoryTotals, loadInventory, type Module } from '../coverage/inventory';

export type FunctionalityGap = { id: string; name: string; covered: boolean; coveredBy: string[] };
export type SubModuleGap = {
  id: string;
  name: string;
  covered: boolean; // at least one functionality or the sub-module itself was touched
  coveredBy: string[];
  functionality: FunctionalityGap[];
  functionalityCovered: number;
};
export type ModuleGap = {
  id: string;
  name: string;
  path: string;
  risk: string;
  covered: boolean; // module reached by at least one test
  coveredBy: string[];
  subModules: SubModuleGap[];
  subModulesCovered: number;
  functionalityTotal: number;
  functionalityCovered: number;
  percent: number; // % of this module's nodes (module + subs + functionality) touched
};

export type GapReport = {
  appName: string;
  totals: { modules: number; subModules: number; functionality: number; nodes: number };
  covered: { modules: number; subModules: number; functionality: number; nodes: number };
  coveragePercent: number; // overall: covered nodes / all nodes
  gapPercent: number; // 100 - coveragePercent
  modules: ModuleGap[];
  // Flat "untouched" lists for the report's gap section.
  untouchedModules: Array<{ module: string; risk: string }>;
  untouchedSubModules: Array<{ module: string; subModule: string }>;
  untouchedFunctionality: Array<{ module: string; subModule: string; functionality: string }>;
};

export function buildGapReport(): GapReport {
  const { appName, modules } = loadInventory();
  const hits = readCoverageHits();
  const totals = inventoryTotals(modules);

  const moduleGaps = modules.map((m) => analyseModule(m, hits));

  const covered = {
    modules: moduleGaps.filter((m) => m.covered).length,
    subModules: moduleGaps.reduce((n, m) => n + m.subModulesCovered, 0),
    functionality: moduleGaps.reduce((n, m) => n + m.functionalityCovered, 0),
    nodes: 0,
  };
  covered.nodes = covered.modules + covered.subModules + covered.functionality;

  const coveragePercent = totals.nodes ? Math.round((covered.nodes / totals.nodes) * 100) : 0;

  const untouchedModules = moduleGaps.filter((m) => !m.covered).map((m) => ({ module: m.name, risk: m.risk }));
  const untouchedSubModules = moduleGaps.flatMap((m) =>
    m.subModules.filter((s) => !s.covered).map((s) => ({ module: m.name, subModule: s.name })),
  );
  const untouchedFunctionality = moduleGaps.flatMap((m) =>
    m.subModules.flatMap((s) =>
      s.functionality.filter((f) => !f.covered).map((f) => ({ module: m.name, subModule: s.name, functionality: f.name })),
    ),
  );

  return {
    appName,
    totals,
    covered,
    coveragePercent,
    gapPercent: 100 - coveragePercent,
    modules: moduleGaps,
    untouchedModules,
    untouchedSubModules,
    untouchedFunctionality,
  };
}

function analyseModule(m: Module, hits: CoverageHit[]): ModuleGap {
  const moduleHits = hits.filter((h) => h.moduleId === m.id);
  const moduleTests = unique(moduleHits.map((h) => h.testCaseId));

  const subModules: SubModuleGap[] = m.subModules.map((s) => {
    const functionality: FunctionalityGap[] = s.functionality.map((f) => {
      const by = unique(moduleHits.filter((h) => h.functionalityId === f.id).map((h) => h.testCaseId));
      return { id: f.id, name: f.name, covered: by.length > 0, coveredBy: by };
    });
    const subBy = unique(moduleHits.filter((h) => h.subModuleId === s.id).map((h) => h.testCaseId));
    const functionalityCovered = functionality.filter((f) => f.covered).length;
    return {
      id: s.id,
      name: s.name,
      covered: subBy.length > 0 || functionalityCovered > 0,
      coveredBy: subBy,
      functionality,
      functionalityCovered,
    };
  });

  const subModulesCovered = subModules.filter((s) => s.covered).length;
  const functionalityTotal = subModules.reduce((n, s) => n + s.functionality.length, 0);
  const functionalityCovered = subModules.reduce((n, s) => n + s.functionalityCovered, 0);
  const nodeTotal = 1 + subModules.length + functionalityTotal;
  const nodeCovered = (moduleTests.length > 0 ? 1 : 0) + subModulesCovered + functionalityCovered;

  return {
    id: m.id,
    name: m.name,
    path: m.path,
    risk: m.risk,
    covered: moduleTests.length > 0,
    coveredBy: moduleTests,
    subModules,
    subModulesCovered,
    functionalityTotal,
    functionalityCovered,
    percent: Math.round((nodeCovered / nodeTotal) * 100),
  };
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
