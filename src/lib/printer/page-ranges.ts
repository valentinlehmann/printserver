// Parse a human page-range string like "1-3, 5, 8-10" into inclusive 1-based
// tuples [[1,3],[5,5],[8,10]]. Returns null on any malformed input so callers
// can show a validation error. Shared by the print form and the print route.

export function parsePageRanges(input: string): [number, number][] | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const ranges: [number, number][] = [];
  for (const partRaw of trimmed.split(",")) {
    const part = partRaw.trim();
    if (!part) continue;

    const single = part.match(/^(\d+)$/);
    if (single) {
      const n = Number(single[1]);
      if (n < 1) return null;
      ranges.push([n, n]);
      continue;
    }

    const span = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (span) {
      const start = Number(span[1]);
      const end = Number(span[2]);
      if (start < 1 || end < start) return null;
      ranges.push([start, end]);
      continue;
    }

    return null;
  }

  return ranges.length ? ranges : null;
}
