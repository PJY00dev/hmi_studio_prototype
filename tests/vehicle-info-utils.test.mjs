import assert from "node:assert/strict";
import test from "node:test";

import { closeVehicleInfoModal, createVehicleInfoState, toggleVehicleInfoFlag } from "../vehicle-info-utils.js";

test("creates vehicle info state with release note closed by default", () => {
  assert.deepEqual(createVehicleInfoState(), {
    autoDownload: false,
    releaseNoteOpen: false
  });
});

test("toggles vehicle info boolean flags without mutating previous state", () => {
  const state = createVehicleInfoState();
  const next = toggleVehicleInfoFlag(state, "autoDownload");

  assert.equal(next.autoDownload, true);
  assert.equal(state.autoDownload, false);
});

test("closes vehicle info modal state", () => {
  assert.deepEqual(closeVehicleInfoModal({ autoDownload: true, releaseNoteOpen: true }), {
    autoDownload: true,
    releaseNoteOpen: false
  });
});
