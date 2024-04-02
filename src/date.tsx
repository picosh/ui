export function prettyDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}
