import assert from "node:assert/strict";
import test from "node:test";

import { clampMapWidth, mapWidthFromPointer, rawMapWidthFromPointer, snapMapWidth } from "../resize-utils.js";

const FIXED_DRIVING_VIEW_WIDTH = 32.708333;

test("clamps map width to the fixed Connect-L driving view width", () => {
  assert.equal(clampMapWidth(20), FIXED_DRIVING_VIEW_WIDTH);
  assert.equal(clampMapWidth(54), FIXED_DRIVING_VIEW_WIDTH);
  assert.equal(clampMapWidth(80), FIXED_DRIVING_VIEW_WIDTH);
});

test("snaps map width to the fixed Connect-L layout stop", () => {
  assert.equal(snapMapWidth(33.333), FIXED_DRIVING_VIEW_WIDTH);
  assert.equal(snapMapWidth(45), FIXED_DRIVING_VIEW_WIDTH);
  assert.equal(snapMapWidth(55), FIXED_DRIVING_VIEW_WIDTH);
  assert.equal(snapMapWidth(66.667), FIXED_DRIVING_VIEW_WIDTH);
});

test("keeps pointer resize output fixed to the driving view width", () => {
  const rect = { left: 100, width: 1000 };

  assert.equal(mapWidthFromPointer(400, rect), FIXED_DRIVING_VIEW_WIDTH);
  assert.equal(mapWidthFromPointer(700, rect), FIXED_DRIVING_VIEW_WIDTH);
  assert.equal(mapWidthFromPointer(900, rect), FIXED_DRIVING_VIEW_WIDTH);
});

test("keeps continuous preview map width fixed", () => {
  const rect = { left: 100, width: 1000 };

  assert.equal(rawMapWidthFromPointer(400, rect), 32.7);
  assert.equal(rawMapWidthFromPointer(550, rect), 32.7);
  assert.equal(rawMapWidthFromPointer(900, rect), 32.7);
});

test("falls back to minimum width when workspace geometry is unavailable", () => {
  assert.equal(mapWidthFromPointer(640, { left: 100, width: 0 }), FIXED_DRIVING_VIEW_WIDTH);
  assert.equal(rawMapWidthFromPointer(640, { left: 100, width: 0 }), FIXED_DRIVING_VIEW_WIDTH);
});
