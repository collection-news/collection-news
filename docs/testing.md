# Testing

The default suites are offline. Production Meilisearch remains private, and no
test requires it to be exposed. Live DynamoDB checks are separate and read-only.

## Commands

```sh
pnpm test                  # Vitest: units, components, server contracts, harness guards
pnpm test:coverage         # Same tests with enforced coverage thresholds
pnpm test:types            # Typecheck application and test TypeScript
pnpm test:browser          # Fresh isolated production build, then Chromium
pnpm test:browser:all      # Fresh build, then Chromium, Firefox, WebKit, mobile WebKit
pnpm test:live             # Explicit real DynamoDB reads using the existing environment
```

Install browser binaries once with `pnpm exec playwright install`. CI uses
`--with-deps` to install the corresponding Linux system libraries too.

For iteration, build once with `pnpm test:browser:build`, then run a focused test:

```sh
pnpm exec playwright test tests/browser/search.spec.ts --project=chromium
pnpm exec playwright test --project=chromium --ui
pnpm exec playwright test --repeat-each=3
```

Rebuild after changing application code or server fixtures. `playwright.config.ts`
starts and stops its own server on port 3100; it rejects an already-running server
instead of accidentally testing a development or live instance. The harness uses
one `.test-app` directory, so run independent Playwright commands sequentially in
one checkout; projects within a command run in parallel.

## Layers and boundaries

| Layer               | Location                            | What remains real                                                    | What is replaced                                                         |
| ------------------- | ----------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Unit                | `src/utils/__tests__`, `tests/unit` | Transformations, dates, encoding, schemas                            | Clock/environment where needed                                           |
| Components/hooks    | `tests/components`                  | React, Chakra, React Query, DOM interactions                         | Next image loader in jsdom; selected router/search hooks; fetch          |
| Server integration  | `tests/server`                      | Handlers, data adapter, static loaders, gzip/XML/cache serialization | DynamoDB SDK reads, search HTTP, cache storage client                    |
| Browser integration | `tests/browser`                     | Production Next build, pages, routing, hydration, APIs, UI libraries | Copied server data service; browser search responses; third-party assets |
| Live contracts      | `tests/live`                        | Existing DynamoDB adapter, SDK, credentials and tables               | A middleware guard permits only `GetItem` and `Query`                    |

`tests/support/build-app.mjs` copies a whitelist of app/config files into the
ignored `.test-app` directory. It replaces **only the copied**
`src/services/dynamo.ts` with the test provider, generates sitemaps in that copy,
and invokes the normal `next build` with the existing Next configuration.
Deployable application source has no fixture flag, mock import, or runtime test
branch. The copied build must never be deployed.

This server boundary is necessary because `getStaticProps` runs at build time and
during blocking fallback. Mocking the browser's `/api/article` requests alone
would leave initial page generation dependent on AWS. See
[Next.js static props](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props)
and [Playwright networking](https://playwright.dev/docs/network).

The harness does not copy `.env.local` or inherit service credentials/endpoints.
It disables external cache configuration by omission. The build/server and
ordinary test runners block outbound Node sockets except loopback. Browser
interception provides synthetic search responses and known third-party assets,
and rejects unexpected external requests. No mocked request falls back to a real
search service. Fixture-mode builds and generated-page caches are separate from
the normal `.next` directory.

Fixtures are small, authored data: two publishers, multi-page archives, an empty
category, a short list, a missing article, rich content blocks, and a synthetic
search corpus. The search fixture understands only the filters/sorts exercised by
the UI and fails on unsupported expressions. Tests assert outgoing parameters and
changed results, rather than accepting a canned response for every request.
These fixtures do not claim to emulate DynamoDB or Meilisearch semantics; server
contracts and live reads cover different boundaries.

## Coverage and acceptance

The original suite defined 29 cases: 9 Vitest tests and 20 Cypress cases. Four
Cypress cases were skipped, and all four search cases were excluded from CI.
The original live baseline passed 9 unit tests and 12 browser tests; search failed
because its intentionally inaccessible upstream returned connection refusal.

The replacement defines 170 Vitest cases, 35 browser cases run across four
projects (140 executions), and 6 separately invoked live contracts. The initial
Vitest baseline is 66.17% statements, 61% branches, 56.43% functions, and 67.18%
lines. Global thresholds round down to whole percentages; critical modules have
stronger thresholds.

Coverage includes unimported TypeScript/TSX application files and the optional
cache handler. Only declarations, type-only contracts, and test support are
excluded. Reports therefore show UI code exercised only by Playwright as
uncovered in Vitest; **the reported percentage is not combined browser/server
coverage**. Do not inflate it by excluding untested application files.

`vitest.config.ts` enforces global floors and stronger thresholds for utilities,
the DynamoDB adapter, API handlers, and the cache handler. Update Vitest and
`@vitest/coverage-v8` together. Use risk coverage alongside percentages: both
publishers, pagination, failure paths, article content, search state, static
generation and storage boundaries must remain represented.

Browser assertions use roles/accessibility names or existing `data-cy` hooks.
There are no fixed sleep assertions, default retries, skipped search tests, or
blanket browser-exception suppression. The one search-outage characterization
requires its specific known exception; all other cases reject page errors.
Mobile WebKit is emulation, not physical iPhone validation. Google tests verify
our page/container; they do not test Google's widget implementation. Native share
tests cover the browser API contract without opening a real system share sheet.

## Cypress migration map

| Previous group                                               | Replacement                                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Landing elements, tab switch, archive CTA, header navigation | `navigation.spec.ts`, `archive.spec.ts`; selected content, both publishers, keyboard navigation                                      |
| Archive/history/category/article smoke                       | `archive.spec.ts`; direct load, precise article content, year/category changes, Back/Forward/reload                                  |
| Skipped scrolling/load-more cases                            | `archive.spec.ts`; cursor pagination, terminal state, short-list button, empty list, transient failure                               |
| Google and sitemap HTTP 200                                  | `content-and-api.spec.ts`, server sitemap tests; container/count, XML contents, cursor completeness, gzip/cache headers and rewrites |
| Four local-only search cases                                 | `search.spec.ts`; fixture-backed CI coverage plus filters, sorting, date range, empty/error states and URL history                   |
| Skipped legacy search navigation                             | Current header modal opening and result navigation tests                                                                             |

The old scrolling tests expected movement between dates. The replacement tests
assert the current same-date cursor behavior; they do not reinstate that obsolete
interaction.

## Existing behavior intentionally preserved

These are executable characterization tests, **not endorsed contracts for new
features**. Production fixes require a separate behavior-change task. No tests
are silently skipped to hide these cases.

| ID        | Existing behavior                                                                                                                     | Coverage                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| LEGACY-01 | Unsupported media produces an empty DynamoDB listing with a phantom continuation cursor                                               | `tests/server/dynamo.test.ts`                                                                        |
| LEGACY-02 | API media/date/limit validation and route date/year patterns are permissive                                                           | Article API and date/schema tests                                                                    |
| LEGACY-03 | Article API dependency failures are returned as 400                                                                                   | Article API tests                                                                                    |
| LEGACY-04 | Search HTTP error JSON reaches the adapter and triggers an unhandled `map` error; reload succeeds after restoring the fixture service | Search client and browser outage tests; the component's existing error/retry UI is tested separately |
| LEGACY-05 | Archive pre-render paths use numeric array keys as publisher slugs                                                                    | Static page loader tests; production fixture build retains this behavior                             |
| LEGACY-06 | A gzip error callback dereferences a missing buffer                                                                                   | Transformation test captures the callback exception without crashing the test process                |
| LEGACY-07 | Compressed body images are unpacked after CDN rewriting and retain their original URLs                                                | Transformation test                                                                                  |
| LEGACY-08 | Remote tag invalidation is a no-op; memory invalidation expects tags to be present                                                    | Cache handler tests                                                                                  |
| LEGACY-09 | Article pagination accepts HTTP error JSON as page data rather than rejecting it                                                      | React Query hook test; actual network rejection/recovery is covered separately                       |

The removal filter currently has no active IDs. Tests cover public reads without
editing that production list. Native database indexing, query-expression
execution and IAM are not proven by SDK doubles; use the live lane for a bounded
connection/contract check, not fixture mutation or infrastructure setup.

## Live tests and CI

`pnpm test:live` loads the existing `.env.local` and honors the application's AWS
profile/static-credential selection. It does not log in, change configuration,
seed records, create tables, or start Next.js. Avoiding a Next server also avoids
ISR cache writes from otherwise read-only page requests. A tested SDK middleware
guard rejects commands other than `GetItem` and `Query` before credentials or
transport are used. No live test sends mutation HTTP methods or contacts search.

Every push/PR runs lint, test typechecking, coverage and all four Playwright
projects without secrets. The existing required **Sanity check** waits for every
job, so browser failures cannot be hidden by a successful unit job. Each browser
job builds an isolated app; no build is deployed. Coverage reports, browser
reports/traces/screenshots, and `.test-app/server.log` are retained for 14 days.

The manually dispatched **Live read-only DynamoDB checks** workflow reuses the
existing Vercel/AWS secrets to read configuration and run the live contracts. It
does not run on PRs, publish artifacts containing configuration, or require a
public Meilisearch endpoint. Secret availability is separate from the offline
merge gate.

For an interrupted local run, stop the test-owned server before restarting.
`pnpm test:browser:build` recreates only `.test-app`; it does not clean normal app
builds, modify the database, or require a rollback. Failed browser runs retain
their trace and screenshot under `test-results`; use
`pnpm exec playwright show-trace <trace.zip>` to inspect the failure.
