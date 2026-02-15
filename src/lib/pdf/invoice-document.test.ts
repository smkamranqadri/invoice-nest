import { describe, expect, it } from "vitest";

import { __testables } from "@/lib/pdf/invoice-document";

function buildLineItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    description: `Line ${index + 1}`,
    quantityHundredths: 100,
    unitPriceCents: 1000,
    lineTotalCents: 1000,
  }));
}

describe("PDF pagination chunking", () => {
  it("keeps all items on first page at boundary and creates continuation after boundary", () => {
    const { chunkLineItems, FIRST_PAGE_LINE_ITEM_LIMIT } = __testables;

    const atBoundary = chunkLineItems(buildLineItems(FIRST_PAGE_LINE_ITEM_LIMIT));
    expect(atBoundary.firstPageChunk.items).toHaveLength(FIRST_PAGE_LINE_ITEM_LIMIT);
    expect(atBoundary.continuationChunks).toHaveLength(0);

    const afterBoundary = chunkLineItems(buildLineItems(FIRST_PAGE_LINE_ITEM_LIMIT + 1));
    expect(afterBoundary.firstPageChunk.items).toHaveLength(FIRST_PAGE_LINE_ITEM_LIMIT);
    expect(afterBoundary.continuationChunks).toHaveLength(1);
    expect(afterBoundary.continuationChunks[0].startIndex).toBe(
      FIRST_PAGE_LINE_ITEM_LIMIT + 1,
    );
    expect(afterBoundary.continuationChunks[0].endIndex).toBe(
      FIRST_PAGE_LINE_ITEM_LIMIT + 1,
    );
  });

  it("uses deterministic continuation-page chunk boundaries and covers 50+ stress input", () => {
    const {
      chunkLineItems,
      FIRST_PAGE_LINE_ITEM_LIMIT,
      CONTINUATION_PAGE_LINE_ITEM_LIMIT,
    } = __testables;

    const lineItems = buildLineItems(50);
    const chunked = chunkLineItems(lineItems);

    expect(chunked.firstPageChunk.items).toHaveLength(FIRST_PAGE_LINE_ITEM_LIMIT);

    const continuationCounts = chunked.continuationChunks.map(
      (chunk) => chunk.items.length,
    );
    expect(continuationCounts).toEqual([CONTINUATION_PAGE_LINE_ITEM_LIMIT, 10]);
    expect(chunked.continuationChunks[0].startIndex).toBe(17);
    expect(chunked.continuationChunks[0].endIndex).toBe(40);
    expect(chunked.continuationChunks[1].startIndex).toBe(41);
    expect(chunked.continuationChunks[1].endIndex).toBe(50);
  });
});

describe("PDF page marker rendering", () => {
  it("renders visible Page X of Y markers", () => {
    const marker = __testables.renderPageMarker({
      pageNumber: 2,
      totalPages: 5,
    });

    expect(marker).toBe("Page 2 of 5");
  });
});
