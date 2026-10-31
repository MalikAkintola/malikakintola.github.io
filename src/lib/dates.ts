const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2025-07" → "Jul 2025" */
export function month(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "2025-07", "present" → "Jul 2025 – now"; a single month prints once */
export function span(start: string, end: string): string {
  if (end === 'present') return `${month(start)} – now`;
  if (start === end) return month(start);
  return `${month(start)} – ${month(end)}`;
}
