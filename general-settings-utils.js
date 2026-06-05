export function createGeneralSettingsState() {
  return {
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
  };
}

export function toggleGeneralBoolean(state, key) {
  return {
    ...state,
    [key]: !Boolean(state[key])
  };
}

export function selectGeneralOption(state, key, value) {
  return {
    ...state,
    [key]: value,
    dropdown: null
  };
}

export function closeGeneralDropdowns(state) {
  return {
    ...state,
    dropdown: null,
    dateTimeModalOpen: false,
    fontConfirmOpen: false,
    languageModalOpen: false
  };
}
