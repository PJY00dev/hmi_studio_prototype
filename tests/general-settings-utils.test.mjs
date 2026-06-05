import assert from "node:assert/strict";
import test from "node:test";

import {
  closeGeneralDropdowns,
  createGeneralSettingsState,
  selectGeneralOption,
  toggleGeneralBoolean
} from "../general-settings-utils.js";

test("creates general settings state with expected defaults", () => {
  assert.deepEqual(createGeneralSettingsState(), {
    autoTime: false,
    showAuxSpeed: false,
    timeFormat: "12 시간",
    distanceUnit: "km",
    temperatureUnit: "°C",
    efficiencyUnit: "km/kWh",
    tirePressureUnit: "psi",
    font: "기본",
    language: "한국어",
    dropdown: null,
    dateTimeModalOpen: false,
    fontConfirmOpen: false,
    languageModalOpen: false
  });
});

test("toggles boolean controls without mutating the previous state", () => {
  const state = createGeneralSettingsState();
  const next = toggleGeneralBoolean(state, "autoTime");

  assert.equal(next.autoTime, true);
  assert.equal(state.autoTime, false);
});

test("selects an option and closes active dropdowns", () => {
  const state = { ...createGeneralSettingsState(), dropdown: "font" };
  const next = selectGeneralOption(state, "font", "현대");

  assert.equal(next.font, "현대");
  assert.equal(next.dropdown, null);
});

test("closes transient general settings overlays", () => {
  const state = {
    ...createGeneralSettingsState(),
    dropdown: "language",
    dateTimeModalOpen: true,
    fontConfirmOpen: true,
    languageModalOpen: true
  };

  assert.deepEqual(closeGeneralDropdowns(state), {
    ...state,
    dropdown: null,
    dateTimeModalOpen: false,
    fontConfirmOpen: false,
    languageModalOpen: false
  });
});
