<div align="center">
  <h1>
    聞庫
  </h1>
  This is the repository for <a href="https://collection.news">collection.news</a>
  <br/>
  <br/>
  <div align="center">
    <a href="https://collection.news/">
      <img width="70%" src="/docs/logo.png">
    </a>
    <br/>
  </div>
  <br/>
</div>

- [:rocket: Development](#rocket-development)
  - [Setup your environment](#setup-your-environment)
  - [Start local development](#start-local-development)
- [:building_construction: Project and page structure](#building_construction-project-and-page-structure)
- [:world_map: System architecture](#world_map-system-architecture)
- [:hammer_and_wrench: Technical choice](#hammer_and_wrench-technical-choice)
- [:zap: A note on cache behavior](#zap-a-note-on-cache-behavior)
- [:zap: A note on sitemap](#zap-a-note-on-sitemap)
- [:page_facing_up: License](#page_facing_up-license)

## :rocket: Development

**Note: We do not plan to add external maintainer yet!**

* Staging deployment: https://dev.collection.news
* Production deployment: https://collection.news

### Setup your environment

```bash
npm install
cp .env.example .env.local
```

* Request AWS access from team members
* Fill up the ENV marked `<required>` in your .env.local

### Start local development

```bash
npm run dev
```

## :building_construction: Project and page structure

* 昔日新聞 - News for that date sort by time desc
  * `/<media_slug>/<date_slug>`
  * `/<media_slug>/<date_slug>/<category_slug>`
  * Pseudo SQL `SELECT * FROM `appledaily_table` WHERE date = '20190721' AND category = 'local;`
* 當年今日 - News on today for past year
  * `/<media_slug>/history/<year_slug>/`
  * `/<media_slug>/history/<year_slug>/<category_slug>`
  * Pseudo SQL `SELECT * FROM `appledaily_table` WHERE date = '20190721' AND category = 'local';`
* 內文 - Article content
  * `/<media_slug>/articles/<article_id>/`
* Home page
  * `/`
* Search page
  * `/search`
  * Not fully functional yet due to Google indexing mechanism

## :world_map: System architecture

<p align="center">
  <img width="90%" src="docs/architecture.png"></a>
</p>

## :hammer_and_wrench: Technical choice

* NextJS & React with ISR
* AWS
* Cloudflare
* Vercel

## :zap: A note on cache behavior

* S3 object have `cache-control: max-age=31536000,public,immutable`
* Cloudfront (asset)
  * `min_ttl=2629743`
  * `default_ttl=31536000`
  * `max_ttl=31536000`
* For more details on Cloudfront cache behavior, please refer to [official documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html)
* NextJS rendered HTML have `cache-control: public, max-age=0, must-revalidate` header but NextJS server side will cache SSR result depends on `revalidate` field. Currently it is indefinitely (until next deployment) for article page and 1 hour other listing page.
* Article API have `cache-control: public, max-age=604800, s-maxage=604800, immutable` header, i.e. 7 days client side cache, too.
* Cloudflare applied "Cache Everything" rule with
  * `cdn.collection.news` Edge Cache TTL: a month and,
  * `collection.news` Edge Cache TTL: 2 hours


## :world_map: A note on sitemap

* Sitemap index is generated at build time in `prebuild` script.
* Site map logic are inside `src/scripts/genSitemap.ts` & `src/pages/api/sitemap/[media]/[date].ts`. `next.config.js` will do the mapping for dynamic sitemap generation.
* Root sitemap index (`/sitemap.xml`) contain links to all sitemap group by date. e.g. `/sitemap/appledaily/20210623.xml`

## :page_facing_up: License

This software is released under [the MIT License](LICENSE) in [GitHub](https://github.com/appledailybackup/collection-news). Logo the on this site is licensed under a Creative Commons [Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/). Next Digital Ltd. maintain the copyright of all the content of Apply Daily. Best Pencil (Hong Kong) Ltd. maintain the copyright of all the content of Stand News. For enquiries, please contact us at <a href="mailto:info@collection.news">info@collection.news</a>.

本軟件在 [MIT 許可證](LICENSE)下發佈在[GitHub](https://github.com/appledailybackup/collection-news)，而本網站上的徽標根據創用CC [姓名標示-非商業性-相同方式分享 4.0 國際 (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh_TW)分享。「壹傳媒有限公司」保留《蘋果日報》所有內容的版權。「立場新聞信託」保留《立場新聞》所有內容的版權。如有查詢，請聯絡我們 <a href="mailto:info@collection.news">info@collection.news</a>。

<a rel="license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a>
