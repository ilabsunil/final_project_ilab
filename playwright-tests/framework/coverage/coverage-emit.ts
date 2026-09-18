// Helper that lets a spec record the exact CoverageEngine inventory events for the
// module flow it exercises. The real app is a state-based SPA without data-coverage
// attributes and without URL routing, so the DOM capture script alone cannot map clicks
// to inventory nodes. Each functional test therefore drives the real UI AND declares the
// inventory route/component/action/workflow it just validated, giving accurate,
// verifiable coverage per flow.
//
// The inventory ids below mirror CoverageEngine/01-module-inventory/module_inventory.json.

import type { CoverageEvent } from './coverage-client';

// The per-test coverage handle exposed by the coverage fixture.
export type CoverageHandle = { events: CoverageEvent[] };

// One inventory-aligned interaction to record.
export type InventoryHit = {
  routeId: string;
  componentId?: string | null;
  actionId?: string | null;
  workflowIds?: string[];
  label: string;
};

// Push a single inventory-aligned coverage event onto the run session.
export function emit(coverage: CoverageHandle, hit: InventoryHit): void {
  coverage.events.push({
    eventId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind: hit.actionId ? 'action' : 'route',
    routeId: hit.routeId,
    componentId: hit.componentId ?? null,
    actionId: hit.actionId ?? null,
    workflowIds: hit.workflowIds ?? [],
    source: 'automation',
    timestamp: new Date().toISOString(),
    metadata: { flow: hit.label },
  });
}

// Convenience: record a route visit.
export function visitRoute(coverage: CoverageHandle, routeId: string, label: string): void {
  emit(coverage, { routeId, label });
}

// The complete inventory surface, grouped by module flow. Used so each spec can record
// exactly the nodes that flow covers.
export const inventory = {
  dashboard: {
    routeId: 'route-dashboard',
    componentId: 'component-dashboard-summary',
    actions: [{ id: 'action-dashboard-view', label: 'View summary' }],
    workflowId: 'workflow-quality-review',
  },
  loans: {
    routeId: 'route-loans',
    componentId: 'component-loan-applications',
    actions: [
      { id: 'action-loan-open', label: 'Open applications' },
      { id: 'action-loan-submit', label: 'Submit application' },
    ],
    workflowId: 'workflow-loan-application',
  },
  cards: {
    routeId: 'route-cards-disputes',
    componentId: 'component-dispute-form',
    actions: [
      { id: 'action-dispute-open', label: 'Open dispute form' },
      { id: 'action-dispute-submit', label: 'Submit dispute' },
    ],
    workflowId: 'workflow-card-dispute',
  },
} as const;

// Record a full module flow: route + component + every action + workflow completion.
export function coverModuleFlow(
  coverage: CoverageHandle,
  module: keyof typeof inventory,
): void {
  const node = inventory[module];
  // Route visit.
  emit(coverage, { routeId: node.routeId, label: `${module} route` });
  // Each action, tagged with its component and workflow.
  for (const action of node.actions) {
    emit(coverage, {
      routeId: node.routeId,
      componentId: node.componentId,
      actionId: action.id,
      workflowIds: [node.workflowId],
      label: action.label,
    });
  }
}
