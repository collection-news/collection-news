# Testing

Default suites run offline. Live DynamoDB checks are separate and read-only;
production Meilisearch must remain private.

## Commands

```sh
pnpm test                  # Unit, component, server and harness tests
pnpm test:coverage         # Vitest with enforced coverage thresholds
pnpm test:types            # Application and test TypeScript
pnpm test:browser          # Isolated production build, then Chromium
pnpm test:browser:all      # Production build, then Chromium, Firefox and desktop/mobile WebKit
pnpm test:browser:dev      # Isolated development server and hydration/interaction checks
pnpm test:live             # Explicit DynamoDB reads using existing credentials
```

Install browser binaries with `pnpm exec playwright install`; Linux CI also uses
`--with-deps`. Chakra typings are generated automatically during installation,
typechecking and browser builds. Run `pnpm theme:types` if needed; do not commit
generated files from `node_modules`.

TypeScript 7 runs through `tsc`; Next.js 16.3 uses
`experimental.useTypeScriptCli` to retain build-time checks without the old
JavaScript compiler API. Sitemaps use `node --import tsx` in both the package
script and the isolated build harness.

For focused browser work:

```sh
pnpm test:browser:build
pnpm exec playwright test tests/browser/search.spec.ts --project=chromium
```

Rebuild after application or server-fixture changes. Playwright owns port 3100
and refuses to reuse an existing server. Browser commands share `.test-app`, so
run separate commands sequentially in one checkout. The development lane replaces
that directory; rebuild before returning to production browser tests.

After an interrupted run, stop the test-owned server before restarting. Inspect
failures in `test-results` with `pnpm exec playwright show-trace <trace.zip>`.
Rebuilding replaces only `.test-app`, leaving the normal `.next` build intact.

Functional browser tests request reduced motion through the app's existing CSS.
This avoids missed exit-animation events in headless Linux WebKit; these suites
do not validate animation timing. Before testing Escape, wait for the dialog or
menu's `--layer-index` CSS property: visibility and focus can precede Zag's handler
registration. Between pagination scrolls, allow rendering frames so the observer
sees the appended content move its sentinel out of view.

## Test boundaries

| Location | Scope | Replaced dependencies |
| --- | --- | --- |
| `src/**/__tests__`, `tests/unit` | Transformations, dates and schemas | Clock/environment as needed |
| `tests/components` | React, Chakra, React Query and DOM behavior | Next image loader, selected router/search hooks, fetch |
| `tests/server` | APIs, static loaders, data adapter and cache serialization | DynamoDB SDK reads, search HTTP and object storage |
| `tests/harness` | Offline network and live-read guards | Transport probes |
| `tests/browser` | Next routing, hydration, pages and interactions | Copied data service, search responses and third-party assets |
| `tests/live` | Existing DynamoDB adapter and service | SDK guard permits only `GetItem` and `Query` |

The browser harness copies the app into ignored `.test-app`, replaces only the
copied DynamoDB service, and generates sitemaps there. Keep fixture code out of
deployable source; never deploy this copy. Server-side substitution is necessary
because `getStaticProps` runs during builds and blocking fallback: browser request
interception alone cannot isolate those reads.

The offline harness excludes `.env.local` and service credentials, disables the
external cache, and blocks outbound Node sockets except loopback. Browser
interception rejects unexpected external requests; mocked search never falls back
to the real service. Search fixtures reject unsupported filters/sorts. Assert
request parameters and resulting UI changes, not just canned responses.

Cache integration tests use the real cache library with in-memory object storage.
SDK doubles do not validate database indexes, query execution or IAM. Mobile
WebKit does not replace physical-device validation; Google and native-share tests
cover our integration contracts, not the external widget or system share sheet.

## Maintaining coverage

[`vitest.config.ts`](../vitest.config.ts) owns coverage exclusions and thresholds.
Coverage includes unimported application files and the optional cache handler;
Playwright coverage is not included. Do not raise percentages by excluding
untested application code. Upgrade Vitest and its coverage provider together.

Preserve coverage of both publishers, static generation, pagination, failure and
retry paths, article content, search state and storage boundaries. For shared UI
changes, check:

- Development hydration as well as the production build.
- Light appearance under OS dark mode and narrow-screen layout.
- Dialog focus, search reset on reopen, and nested filters using keyboard and touch.
- Image failure recovery and images loaded before hydration.
- Automatic pagination for visible short lists, manual retry and duplicate prevention.

Use roles/accessibility names or existing `data-cy` hooks. Browser fixtures fail on
page exceptions and hydration errors; do not mask failures with sleeps, blanket
error suppression or retries. Tests marked `LEGACY-*` document existing quirks,
not desired behavior. Change those expectations only with an intentional behavior
fix; keep the details beside the executable tests.

## Live checks and CI

Two archive scenarios remain enabled locally but are skipped when `CI` is set:
direct archive/article navigation with browser history, and history year/category
navigation ending in an article-card click. Both publishers are quarantined across
all four browser projects (16 skipped executions). Article-card clicks still
intermittently fail to navigate despite rendered-link checks; see
[run 34725539001](https://github.com/collection-news/collection-news/actions/runs/34725539001).
This remains unresolved. CI retains archive categories, pagination, direct article
content, and modal-result navigation, but loses these end-to-end archive click and
Back/Forward scenarios. Remove the skips after the click failure is understood and
the scenarios pass repeated Linux CI runs. Reproduce locally with:

```sh
pnpm test:browser:build
env -u CI pnpm exec playwright test tests/browser/archive.spec.ts --grep 'direct archive load|history year' --repeat-each=5
```

`pnpm test:live` reads existing `.env.local` and AWS credentials. Its SDK guard
rejects commands other than `GetItem` and `Query` before credentials or transport
are used. It does not seed data, change infrastructure, contact search or start
Next.js; avoiding Next also avoids ISR cache writes during page requests.

[Sanity checks](../.github/workflows/sanity.yml) run lint, types, coverage and all
browser projects on pushes/PRs without secrets. The required **Sanity check** job
waits for every job. Failed runs retain reports, traces, screenshots and server
logs; test builds are never deployed.

[Live read-only DynamoDB checks](../.github/workflows/live-tests.yml) are manually
dispatched using existing Vercel/AWS secrets. Keep this workflow separate from the
offline merge gate and never publish artifacts containing downloaded configuration.
