/**
 * Parses a messy string of QIDs into a clean, deduplicated array.
 *
 * Handles formats like:
 *   "2127, 8425, 12007"
 *   "2127 8425 12007"
 *   "QID 2127\nQID 8425"
 *   "2127\n8425\n12007"
 *   "#2127, #8425"
 *   "QID: 2127, QID: 8425"
 */
export function parseQIDs(input: string): string[] {
  if (!input.trim()) return [];

  // Extract all number sequences (QIDs are numeric)
  const matches = input.match(/\d+/g);
  if (!matches) return [];

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const result: string[] = [];

  for (const match of matches) {
    // QIDs are typically 1-6 digits. Filter out obviously wrong numbers.
    if (match.length > 6) continue;

    const normalized = match.replace(/^0+/, "") || "0";
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result;
}
