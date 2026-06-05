export function createAppPermissionState(apps = []) {
  return Object.fromEntries(
    apps.map((app) => [
      app.id,
      Object.fromEntries((app.permissions || []).map((permission) => [permission.id, Boolean(permission.enabled)]))
    ])
  );
}

export function toggleAppPermission(state, appId, permissionId) {
  return {
    ...state,
    [appId]: {
      ...(state[appId] || {}),
      [permissionId]: !Boolean(state[appId]?.[permissionId])
    }
  };
}

export function getAppSettingDetail(apps = [], appId) {
  return apps.find((app) => app.id === appId) || null;
}
