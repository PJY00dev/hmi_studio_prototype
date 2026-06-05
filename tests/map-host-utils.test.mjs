import assert from "node:assert/strict";
import test from "node:test";

import { toNaverCompatibleLocalUrl } from "../map-utils.js";

test("normalizes 127.0.0.1 local map host to localhost while preserving path and query", () => {
  assert.equal(
    toNaverCompatibleLocalUrl("http://127.0.0.1:8765/?q=%EC%84%B1%EC%88%98"),
    "http://localhost:8765/?q=%EC%84%B1%EC%88%98"
  );
});

test("leaves non-loopback hosts unchanged", () => {
  assert.equal(
    toNaverCompatibleLocalUrl("http://localhost:8765/settings"),
    "http://localhost:8765/settings"
  );
  assert.equal(
    toNaverCompatibleLocalUrl("https://example.com/app"),
    "https://example.com/app"
  );
});
