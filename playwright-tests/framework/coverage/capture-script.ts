// Browser-side capture logic injected into every page during a test.
//
// This is the Playwright equivalent of the extension's `content.js`. It listens
// for the same DOM interactions (click, submit, change, route changes) and reports
// the same event payload. Instead of chrome.runtime messaging, it calls a binding
// named `__coverageCapture` that Playwright exposes to Node, where the events are
// forwarded to the Coverage Intelligence API.
//
// The function is stringified and passed to page.addInitScript, so it must be fully
// self-contained and must not reference anything from the Node scope.
export function coverageCaptureInitScript(): void {
  // Guard against double-injection on the same page.
  const globalWindow = window as unknown as { __coverageInstalled?: boolean; __coverageCapture?: (event: unknown) => void };
  if (globalWindow.__coverageInstalled) {
    return;
  }
  globalWindow.__coverageInstalled = true;

  const newEventId = (): string =>
    (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  // Build a stable route id from the current path, matching the extension.
  const routeId = (): string => `route-${location.pathname.replace(/^\//, '').replaceAll('/', '-') || 'dashboard'}`;

  // Emit a single coverage event to the Node-side binding.
  const emit = (kind: string, target: EventTarget | null): void => {
    // Ignore non-application pages (e.g. about:blank) so they never pollute coverage.
    if (location.protocol !== 'http:' && location.protocol !== 'https:') {
      return;
    }
    const element = target as (HTMLElement & { dataset?: DOMStringMap }) | null;
    const component =
      element?.closest?.('[data-coverage-id]') as HTMLElement | null;
    const event = {
      eventId: newEventId(),
      kind,
      routeId: routeId(),
      componentId: component?.dataset?.coverageId ?? null,
      actionId: element?.dataset?.coverageAction ?? null,
      workflowIds: element?.dataset?.coverageWorkflow ? [element.dataset.coverageWorkflow] : [],
      source: 'automation',
      timestamp: new Date().toISOString(),
      metadata: { tag: (element?.tagName as string) ?? 'document' },
    };
    globalWindow.__coverageCapture?.(event);
  };

  // Capture the same interactions the extension records.
  document.addEventListener('click', (event) => emit('action', event.target), true);
  document.addEventListener('submit', (event) => emit('action', event.target), true);
  document.addEventListener('change', (event) => emit('action', event.target), true);

  // Detect single-page-app route changes and record them.
  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      emit('route', document.body);
    }
  }, 500);

  // Record the initial route on load.
  emit('route', document.body);
}
