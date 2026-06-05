import assert from "node:assert/strict";
import test from "node:test";

import { createAppPermissionState, getAppSettingDetail, toggleAppPermission } from "../app-settings-utils.js";

test("creates app permission state from app setting definitions", () => {
  const state = createAppPermissionState([
    { id: "chromium", permissions: [{ id: "location", enabled: false }, { id: "microphone", enabled: true }] }
  ]);

  assert.deepEqual(state, {
    chromium: {
      location: false,
      microphone: true
    }
  });
});

test("toggles a known app permission without mutating existing state", () => {
  const state = {
    chromium: {
      location: false,
      microphone: true
    }
  };

  const next = toggleAppPermission(state, "chromium", "location");

  assert.equal(next.chromium.location, true);
  assert.equal(state.chromium.location, false);
});

test("returns app detail metadata for known apps", () => {
  const detail = getAppSettingDetail([{ id: "radio", title: "라디오", permissions: [] }], "radio");

  assert.deepEqual(detail, { id: "radio", title: "라디오", permissions: [] });
});
