import { describe, expect, it } from "vitest";

import { parsePageRanges } from "@/lib/printer/page-ranges";

describe("parsePageRanges", () => {
  it("parses single pages and spans", () => {
    expect(parsePageRanges("1-3, 5, 8-10")).toEqual([
      [1, 3],
      [5, 5],
      [8, 10],
    ]);
  });

  it("trims whitespace and tolerates spaces around dashes", () => {
    expect(parsePageRanges(" 2 - 4 ")).toEqual([[2, 4]]);
  });

  it("rejects empty input", () => {
    expect(parsePageRanges("")).toBeNull();
    expect(parsePageRanges("   ")).toBeNull();
  });

  it("rejects reversed and zero/negative ranges", () => {
    expect(parsePageRanges("5-2")).toBeNull();
    expect(parsePageRanges("0")).toBeNull();
  });

  it("rejects non-numeric junk", () => {
    expect(parsePageRanges("1,a")).toBeNull();
    expect(parsePageRanges("1--3")).toBeNull();
  });
});
