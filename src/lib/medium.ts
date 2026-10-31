import type { Loader } from 'astro/loaders';

// Articles as of October 2026, used only when the Medium feed cannot be reached during a build.
const snapshot = [
  { title: 'Understanding Your Customers with RFM Analysis in Power BI', url: 'https://medium.com/@malikola223/understanding-your-customers-with-rfm-analysis-in-power-bi-7ec2063acec9', date: '2025-11-21', excerpt: 'Many companies proudly showcase their “Top 10 Customers by Revenue,” but anyone who has actually worked with customer data knows this list rarely tells the full story.' },
  { title: 'Novacore’s Financial Journey: Expansion, Setback, and Recovery', url: 'https://medium.com/@malikola223/novacores-financial-journey-expansion-setback-and-recovery-0e8f566f025b', date: '2025-05-18', excerpt: 'In a world where data drives nearly every business decision, it’s not just about the numbers but about the story they tell.' },
  { title: 'Stop Calculating Attrition Rate the Wrong Way! — Here’s the Right Way to Do It.', url: 'https://medium.com/@malikola223/stop-calculating-attrition-rate-the-wrong-way-heres-the-right-way-to-do-it-e23526e7ea4a', date: '2025-04-13', excerpt: 'Let’s be honest — attrition rate is one of those metrics many data analysts and dashboard builders think they’re getting right… but often, they’re not.' },
  { title: 'An end-to-end data analytics project on my favorite YouTube channels.', url: 'https://medium.com/@malikola223/an-end-to-end-data-analytics-project-on-my-favorite-youtube-channels-15c400d3a081', date: '2025-04-02', excerpt: 'How I built an automated pipeline on the YouTube API and a Power BI report that compares six of my favourite channels.' },
  { title: 'Portfolio Risk Assessment for Conceptual Mortgage Bank (2017–2020)', url: 'https://medium.com/@malikola223/portfolio-risk-assessment-for-conceptual-mortgage-bank-2017-2020-6d249b99ecec', date: '2025-04-02', excerpt: 'For financial institutions, risk assessment is a crucial process in mitigating loan defaults and ensuring data-driven lending decisions.' },
  { title: 'Forggith Pharmaceuticals: My Power BI Developer Internship', url: 'https://medium.com/@malikola223/forggith-pharmaceuticals-my-power-bi-developer-internship-f38a6858a515', date: '2024-11-27', excerpt: 'In September 2023, I started a Power BI developer internship by Foresight BI. I was onboarded quickly and given a task to carry out.' },
  { title: 'Google Data Analytics Capstone Project: How Does a Bike-Share Navigate Speedy Success?', url: 'https://medium.com/@malikola223/google-data-analytics-capstone-project-how-does-a-bike-share-navigate-speedy-success-b42fae0223f1', date: '2024-11-20', excerpt: 'Today, I will take you on a journey of data analysis as we embark on a comprehensive exploration of the Google Data analytics capstone project.' },
];

// Titles as the site shows them, where Medium's differ: words from the address, then the title.
const TITLES: [string, string][] = [['forggith-pharmaceuticals', 'Forggith Pharmaceuticals: My Power BI Developer Internship']];

// Lines for the blog list where the article's opening paragraph does not introduce it well.
const EXCERPTS: [string, string][] = [['end-to-end-data-analytics-project', 'How I built an automated pipeline on the YouTube API and a Power BI report that compares six of my favourite channels.']];

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '’', nbsp: ' ' };
const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => NAMED[n])
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/ :/g, ':')
    .trim();

/** The article's first real paragraph, cut at a sentence or word to about 180 characters. */
function excerptOf(html: string): string | undefined {
  for (const [, inner] of html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = decode(inner.replace(/<[^>]+>/g, ' ')).replace(/^Introduction\s+/, '');
    if (text.length < 80) continue;
    if (text.length <= 190) return text;
    const cut = text.slice(0, 190);
    const end = cut.lastIndexOf('. ');
    return end > 100 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`;
  }
  return undefined;
}

// Reads the latest articles from https://medium.com/feed/@<user>. A new article appears on the site at
// the next build. If Medium is unreachable the snapshot above is used and the build carries on.
export function mediumFeed(user: string): Loader {
  return {
    name: 'medium-feed',
    load: async ({ store, parseData, logger }) => {
      let items: { title: string; url: string; date: string; excerpt?: string }[] = snapshot;
      try {
        const res = await fetch(`https://medium.com/feed/@${user}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (portfolio build)' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        const live = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
          const url = decode(it.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '').split('?')[0];
          const body = it.match(/<content:encoded>\s*<!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? '';
          const title = TITLES.find(([key]) => url.includes(key))?.[1] ?? decode(it.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
          return {
            title,
            url,
            date: new Date(it.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? '').toISOString().slice(0, 10),
            excerpt: EXCERPTS.find(([key]) => url.includes(key))?.[1] ?? excerptOf(body),
          };
        });
        if (live.length) items = live;
      } catch (err) {
        logger.warn(`Medium feed unavailable (${(err as Error).message}); using the saved list of articles.`);
      }
      store.clear();
      for (const item of items) {
        const id = item.url.split('/').pop() ?? item.title;
        store.set({ id, data: await parseData({ id, data: item }) });
      }
    },
  };
}
