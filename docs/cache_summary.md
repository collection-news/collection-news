Here is the summary of the cache behavior and cache control headers for each page and API route in `src/pages`.

### **Pages Caching Strategy**

Most content pages use **Static Site Generation (SSG)** or **Incremental Static Regeneration (ISR)**.

| Route Pattern | File Path | Strategy | Revalidation / TTL | Cache Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `index.tsx` | **SSG** | N/A | Generated at build time. Cached indefinitely until new deployment. |
| `/search` | `search.tsx` | **SSG** | N/A | Static shell. Content is client-side rendered (CSR). |
| `/google` | `google.tsx` | **ISR** | **7200s** (2 hours) | Generated at build time. Updates at most every 2 hours. `s-maxage=7200, stale-while-revalidate`. |
| `/404` | `404.tsx` | **SSG** | N/A | Generated at build time. Cached indefinitely. |
| `/[media]/...` | `[media]/[[...path]].tsx` | **SSG** | **None** (`false`) | List view. Generated on first request (`fallback: 'blocking'`) or build. Cached indefinitely. |
| `/[media]/articles/[id]` | `[media]/articles/[articleId].tsx` | **SSG** | **None** (`false`) | Article view. Generated on first request (`fallback: 'blocking'`). Cached indefinitely. |
| `/[media]/history/[year]/...` | `[media]/history/[year]/[[...path]].tsx` | **ISR** | **3600s** (1 hour) | History view. Updates every hour to reflect day changes. `s-maxage=3600, stale-while-revalidate`. |

### **API Routes Cache Control**

The API routes have explicit `Cache-Control` headers set in the code.

| API Route | File Path | `Cache-Control` Header | Behavior |
| :--- | :--- | :--- | :--- |
| `/api/article` | `api/article.ts` | `public, max-age=604800, s-maxage=604800, immutable` | **7 Days**. Aggressive caching for article data which rarely changes. |
| `/api/multi-search` | `api/multi-search.ts` | `public, max-age=3600, s-maxage=604800` | **1 Hour (Browser), 7 Days (CDN)**. Browser caches for 1 hour, CDNs for 7 days. |
| `/api/robots` | `api/robots.ts` | `public, max-age=31536000, s-maxage=31536000, immutable` | **1 Year**. Static configuration. |
| `/api/sitemap/...` | `api/sitemap/[media]/[date].ts` | `public, max-age=31536000, s-maxage=31536000, immutable` | **1 Year**. Sitemaps for past dates are immutable. |

### **Additional Configuration**

-   **`next.config.js`**: Adds a `Link: <canonical-url>; rel="canonical"` header to all pages.
-   **`cache-handler.mjs`**: In production (if enabled via env), the app uses a custom ISR cache handler that stores ISR pages in **AWS S3** instead of the local filesystem. This ensures shared cache persistence across serverless container instances.