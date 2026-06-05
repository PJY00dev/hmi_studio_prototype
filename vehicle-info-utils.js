export function createVehicleInfoState() {
  return {
    autoDownload: false,
    releaseNoteOpen: false
  };
}

export function toggleVehicleInfoFlag(state, key) {
  return {
    ...state,
    [key]: !Boolean(state[key])
  };
}

export function closeVehicleInfoModal(state) {
  return {
    ...state,
    releaseNoteOpen: false
  };
}
