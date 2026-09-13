# Application release assets

Pushes to `master` run **Build application release**. Required tests, a
credential-free production build, extracted-runtime checks, and archive audits
must pass before a public `app-<full SHA>` release is published. Manually running
this workflow validates a candidate without publishing it.

Each release contains a Linux amd64 runtime archive, `manifest.json`, and
`SHA256SUMS`. Assets are never overwritten. Builds use Ubuntu 24.04 and Node
24.19.0; Node >=24.15.0 and <25 is required at runtime.

The archive contains the standalone server, required dependencies, public files,
and static assets. It excludes environment files, credentials, build caches,
logs, test fixtures, and repository metadata. Internal pnpm links are validated
and retained. Runtime environment files are supplied separately.

## Local validation

```sh
pnpm test:release
node scripts/release/package.mjs build --sha "$(git rev-parse HEAD)" --local-validation
node scripts/release/smoke.mjs release-out/collection-news-darwin-arm64.tar.gz "$(git rev-parse HEAD)"
```

Use the archive filename printed by the build on other platforms. Local builds
use current working files and are validation-only; published releases are built
from a clean Actions checkout. Non-Linux archives cannot be promoted.

The build process receives only explicitly allowed environment variables, a new
home directory, and no environment files. Outbound Node TCP/UDP access is blocked
during compilation. Publication credentials exist only in a separate publishing
job after artifact validation. Packaging tests plant fake secrets and reject
unsafe files and encoded secret values. Scanners are a backstop, not a substitute
for keeping credentials out of the build.

Archive data is fetched through blocking fallback at runtime. The deprecated
`/google` route and index-count reader have been removed. The release selects the
optional R2 cache from runtime configuration; `NEXT_PUBLIC_*` flags and the public
sitemap domain are build-time settings. Release builds enable the search UI.
