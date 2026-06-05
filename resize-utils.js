export const MAP_WIDTH_MIN = 32.708333;
export const MAP_WIDTH_MAX = 32.708333;
export const MAP_WIDTH_STOPS = [32.708333];

export function clampMapWidth(value, min = MAP_WIDTH_MIN, max = MAP_WIDTH_MAX) {
  return Math.min(max, Math.max(min, Number(value)));
}

export function snapMapWidth(value, stops = MAP_WIDTH_STOPS) {
  const clamped = clampMapWidth(value);
  return stops.reduce((nearest, stop) => {
    return Math.abs(stop - clamped) < Math.abs(nearest - clamped) ? stop : nearest;
  }, stops[0]);
}

export function mapWidthFromPointer(clientX, workspaceRect, min = MAP_WIDTH_MIN, max = MAP_WIDTH_MAX) {
  if (!workspaceRect || !Number.isFinite(workspaceRect.width) || workspaceRect.width <= 0) {
    return snapMapWidth(min);
  }

  const rawWidth = ((Number(clientX) - workspaceRect.left) / workspaceRect.width) * 100;
  return snapMapWidth(clampMapWidth(rawWidth, min, max));
}

export function rawMapWidthFromPointer(clientX, workspaceRect, min = MAP_WIDTH_MIN, max = MAP_WIDTH_MAX) {
  if (!workspaceRect || !Number.isFinite(workspaceRect.width) || workspaceRect.width <= 0) {
    return clampMapWidth(min, min, max);
  }

  const rawWidth = ((Number(clientX) - workspaceRect.left) / workspaceRect.width) * 100;
  return Math.round(clampMapWidth(rawWidth, min, max) * 10) / 10;
}
