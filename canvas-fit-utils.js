const CONNECT_L_CANVAS_WIDTH = 1920;
const CONNECT_L_CANVAS_HEIGHT = 1080;

function toPositiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

export function calculateCanvasFitScale({
  viewportWidth,
  viewportHeight,
  canvasWidth = CONNECT_L_CANVAS_WIDTH,
  canvasHeight = CONNECT_L_CANVAS_HEIGHT
} = {}) {
  const width = toPositiveNumber(viewportWidth, canvasWidth);
  const height = toPositiveNumber(viewportHeight, canvasHeight);
  const targetWidth = toPositiveNumber(canvasWidth, CONNECT_L_CANVAS_WIDTH);
  const targetHeight = toPositiveNumber(canvasHeight, CONNECT_L_CANVAS_HEIGHT);

  return Number(Math.min(width / targetWidth, height / targetHeight).toFixed(6));
}

export function applyCanvasFitScale({
  root = document.documentElement,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
  canvasWidth,
  canvasHeight
} = {}) {
  const scale = calculateCanvasFitScale({
    viewportWidth,
    viewportHeight,
    canvasWidth,
    canvasHeight
  });

  root.style.setProperty("--canvas-scale", String(scale));
  return scale;
}
