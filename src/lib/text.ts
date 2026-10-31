// Keeps product names on one line: "Power BI" never breaks between its two words.
const KEEP = ['Power BI', 'Microsoft Fabric', 'Data Factory', 'University of Lagos'];

export function nb(text: string): string {
  return KEEP.reduce((t, name) => t.replaceAll(name, name.replaceAll(' ', '\u00A0')), text);
}
