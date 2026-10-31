import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import attrition from '../assets/blog/attrition.webp';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A date as "Nov 2025". */
export const monthYear = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

// Pictures for articles that have no project of their own: words from the article's address, then the image.
const OWN_PICTURES: [string, ImageMetadata][] = [['stop-calculating-attrition-rate', attrition]];

/** An article's picture: its project's dashboard, or its own picture. New articles may have none. */
export function articlePicture(article: CollectionEntry<'writing'>, projects: CollectionEntry<'projects'>[]) {
  const project = projects.find((p) => p.data.article === article.data.url);
  if (project) return { src: project.data.cover, position: project.data.coverPosition, project: project.id };
  const own = OWN_PICTURES.find(([key]) => article.data.url.includes(key));
  return own ? { src: own[1], position: '50% 50%', project: undefined } : undefined;
}

/** The articles to highlight: those named in the profile, topped up with the newest, three at most. */
export function highlighted(writing: CollectionEntry<'writing'>[], keys: string[], count = 3) {
  const picked = keys
    .map((key) => writing.find((w) => w.data.url.includes(key)))
    .filter((w): w is CollectionEntry<'writing'> => Boolean(w));
  for (const w of writing) {
    if (picked.length >= count) break;
    if (!picked.includes(w)) picked.push(w);
  }
  return picked.slice(0, count);
}
