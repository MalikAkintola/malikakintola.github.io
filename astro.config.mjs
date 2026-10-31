import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The site's public address. Change it here when the custom domain is connected.
const SITE = 'https://malikakintola.pages.dev';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
});
