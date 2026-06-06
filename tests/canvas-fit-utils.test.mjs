import assert from "node:assert/strict";
import test from "node:test";

import { calculateCanvasFitScale } from "../canvas-fit-utils.js";

test("fits the Connect-L-12.9 canvas inside a 16:9 viewport without distortion", () => {
  assert.equal(calculateCanvasFitScale({ viewportWidth: 1920, viewportHeight: 1080 }), 1);
  assert.equal(calculateCanvasFitScale({ viewportWidth: 1280, viewportHeight: 720 }), 0.666667);
});

test("uses the limiting viewport axis while preserving the 1920 x 1080 canvas", () => {
  assert.equal(calculateCanvasFitScale({ viewportWidth: 1366, viewportHeight: 1024 }), 0.711458);
  assert.equal(calculateCanvasFitScale({ viewportWidth: 1024, viewportHeight: 768 }), 0.533333);
  assert.equal(calculateCanvasFitScale({ viewportWidth: 1600, viewportHeight: 900 }), 0.833333);
});

test("allows larger displays to scale up while preserving the full canvas", () => {
  assert.equal(calculateCanvasFitScale({ viewportWidth: 2560, viewportHeight: 1600 }), 1.333333);
  assert.equal(calculateCanvasFitScale({ viewportWidth: 390, viewportHeight: 844 }), 0.203125);
});
