import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The site's public address, used for links, the sitemap and the résumé.
const SITE = 'https://malikakintola.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
});
