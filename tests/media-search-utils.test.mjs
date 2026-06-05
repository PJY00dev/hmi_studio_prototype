import assert from "node:assert/strict";
import test from "node:test";

import { searchMediaCatalog } from "../media-search-utils.js";

const catalog = [
  { type: "music", title: "Ditto", creator: "NewJeans", description: "K-pop playlist" },
  { type: "video", title: "Seoul night drive", creator: "Drive Lab", description: "4K city route" },
  { type: "music", title: "Drive Mix", creator: "Elysia Biro", description: "Electronic focus" }
];

test("filters media search results by app type and text query", () => {
  assert.deepEqual(searchMediaCatalog(catalog, "drive", "video"), [
    { type: "video", title: "Seoul night drive", creator: "Drive Lab", description: "4K city route" }
  ]);

  assert.deepEqual(searchMediaCatalog(catalog, "drive", "music"), [
    { type: "music", title: "Drive Mix", creator: "Elysia Biro", description: "Electronic focus" }
  ]);
});

test("returns featured results for an empty query", () => {
  assert.deepEqual(searchMediaCatalog(catalog, "", "music"), [
    { type: "music", title: "Ditto", creator: "NewJeans", description: "K-pop playlist" },
    { type: "music", title: "Drive Mix", creator: "Elysia Biro", description: "Electronic focus" }
  ]);
});
