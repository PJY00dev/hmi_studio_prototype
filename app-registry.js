export const APP_REGISTRY = [
  {
    id: "android-auto",
    title: "Android Auto",
    icon: "android-auto",
    color: "#313131",
    desc: "Android Auto 앱",
    surfaces: { launcher: true, edit: true },
    settings: {
      color: "#ffffff",
      permissions: [
        { id: "location", label: "위치 허용", enabled: false },
        { id: "microphone", label: "마이크 허용", enabled: false }
      ]
    }
  },
  {
    id: "chromium",
    title: "Chromium",
    icon: "chromium",
    color: "#edf0f4",
    desc: "Chromium 앱",
    surfaces: { launcher: true, edit: true },
    settings: {
      color: "#6ea6ff",
      permissions: [
        { id: "alarm", label: "알람 허용", enabled: false },
        { id: "location", label: "위치 허용", enabled: false },
        { id: "microphone", label: "마이크 허용", enabled: false }
      ]
    }
  },
  {
    id: "gleo-ai",
    title: "Gleo AI",
    icon: "gleo-ai",
    color: "#596BFF",
    desc: "Gleo AI 앱",
    surfaces: { launcher: true, edit: true },
    settings: {
      id: "gleo-ai-app",
      color: "#5e6bff",
      permissions: [
        { id: "alarm", label: "알람 허용", enabled: false },
        { id: "location", label: "위치 허용", enabled: false },
        { id: "microphone", label: "마이크 허용", enabled: false }
      ]
    }
  },
  {
    id: "navigation",
    title: "내비게이션",
    icon: "navigation",
    color: "#4833EE",
    desc: "내비게이션 앱",
    surfaces: { launcher: true, edit: true },
    settings: {
      id: "navigation-app",
      color: "#5137f3",
      permissions: [{ id: "location", label: "위치 허용", enabled: false }]
    }
  },
  {
    id: "radio",
    title: "라디오",
    icon: "radio",
    color: "#C911E7",
    desc: "라디오 앱",
    surfaces: { launcher: true, edit: true },
    settings: {
      id: "radio-app",
      color: "#d019ef",
      permissions: []
    }
  },
  { id: "music", title: "미디어", icon: "music", color: "#7B18DF", desc: "Playlist and volume controls", surfaces: { launcher: true, edit: true } },
  {
    id: "youtube",
    title: "YouTube",
    icon: "youtube",
    color: "#FF0033",
    desc: "Watch videos on YouTube",
    surfaces: { launcher: true, edit: true },
    media: {
      provider: "youtube",
      type: "video",
      placeholder: "영상, 채널, 주제 검색",
      empty: "검색된 영상이 없습니다."
    }
  },
  {
    id: "spotify",
    title: "Spotify",
    icon: "spotify",
    color: "#1DB954",
    desc: "Search music on Spotify",
    surfaces: { launcher: true, edit: true },
    media: {
      provider: "spotify",
      type: "music",
      placeholder: "곡, 아티스트, 앨범 검색",
      empty: "검색된 트랙이 없습니다."
    }
  },
  {
    id: "netflix",
    title: "Netflix",
    icon: "netflix",
    color: "#000000",
    desc: "Netflix 드라마 및 영화 감상",
    surfaces: { launcher: true, edit: true },
    media: {
      type: "netflix",
      placeholder: "드라마, 영화, 시리즈 검색",
      empty: "검색된 콘텐츠가 없습니다."
    }
  },
  {
    id: "app-market",
    title: "앱 마켓",
    icon: "app-market",
    color: "#5364FA",
    desc: "앱 마켓 앱",
    surfaces: { launcher: true, edit: true },
    settings: {
      color: "#41a8ee",
      permissions: [{ id: "alarm", label: "알람 허용", enabled: false }]
    }
  },
  {
    id: "call",
    title: "전화",
    icon: "call",
    color: "#29B557",
    desc: "전화 앱",
    surfaces: { launcher: true, edit: true },
    settings: {
      id: "phone-settings-app",
      color: "#24c861",
      permissions: [
        { id: "alarm", label: "알람 허용", enabled: false },
        { id: "microphone", label: "마이크 허용", enabled: false }
      ]
    }
  },
  {
    id: "vehicle",
    title: "차량 설정",
    icon: "vehicle",
    color: "#2E2E2E",
    desc: "차량 설정 앱",
    surfaces: { launcher: true, edit: true },
    settings: {
      id: "vehicle-settings-app",
      color: "#444444",
      permissions: [
        { id: "alarm", label: "알람 허용", enabled: false },
        { id: "location", label: "위치 허용", enabled: false }
      ]
    }
  },
  {
    id: "camera",
    title: "카메라",
    icon: "camera",
    color: "#91959D",
    desc: "Rear and surround view",
    surfaces: { launcher: true, edit: true },
    settings: {
      id: "camera-settings-app",
      color: "#b9bcc3",
      permissions: []
    }
  },
  { id: "message", title: "메시지", icon: "message", color: "#1D65FF", desc: "Read incoming notifications", surfaces: { launcher: true, edit: true } },
  { id: "bluetooth", title: "블루투스", icon: "bluetooth", color: "#1D65FF", desc: "블루투스 앱", surfaces: { launcher: true, edit: true } },
  { id: "energy", title: "충전", icon: "energy", color: "#3FC778", desc: "Battery and charging status", surfaces: { launcher: true, edit: true } },
  { id: "blackbox", title: "블랙박스", icon: "blackbox", color: "#2E2E2E", desc: "블랙박스 앱", surfaces: { launcher: true, edit: true } },
  { id: "driving", title: "주행 보조", icon: "driving", color: "#2B3456", desc: "주행 보조 앱", surfaces: { launcher: true, edit: true } },
  { id: "carplay", title: "CarPlay", icon: "carplay", color: "#18D722", desc: "CarPlay 앱", surfaces: { launcher: true, edit: true } },
  { id: "mirroring", title: "미러링", icon: "mirroring", color: "#1D65FF", desc: "미러링 앱", surfaces: { launcher: true, edit: true } },
  { id: "nav-home", title: "Navigate home", icon: "home", color: "#edf0f4", desc: "Quick route to a saved destination", surfaces: { edit: true } },
  { id: "climate", title: "Climate", icon: "climate", color: "#0068ff", desc: "Temperature, heat, and defrost", surfaces: { edit: true } },
  { id: "seat", title: "Seat", icon: "seat", color: "#edf0f4", desc: "Position and comfort settings", surfaces: { edit: true } },
  { id: "video", title: "Video", icon: "video", color: "#eb1616", desc: "Passenger media while autonomous", surfaces: { edit: true } },
  { id: "office", title: "Work mode", icon: "office", color: "#39a0ff", desc: "Calendar and meeting prep", surfaces: { edit: true } },
  { id: "tire-pressure", title: "Tire pressure", icon: "tire", color: "#ffd600", desc: "Tire pressure and wheel status", surfaces: { edit: true } },
  { id: "ambience", title: "Ambience", icon: "ambient", color: "#ffd600", desc: "Interior light and ambience", surfaces: { edit: true } },
  { id: "trip-meter", title: "Trip meter", icon: "office", color: "#ffd600", desc: "Trip distance and energy use", surfaces: { edit: true } },
  { id: "gallery", title: "Gallery", icon: "gallery", color: "#f0372f", desc: "Saved media and images", surfaces: { edit: true } },
  { id: "dashcam", title: "Dashcam", icon: "rec", color: "#ffd600", desc: "Built-in dashcam recordings", surfaces: { edit: true } },
  { id: "parking-camera", title: "Parking camera", icon: "camera-video", color: "#ffd600", desc: "Parking camera view", surfaces: { edit: true } },
  { id: "media-player", title: "Media player", icon: "music", color: "#f0372f", desc: "Media playback", surfaces: { edit: true } },
  { id: "siriusxm", title: "SiriusXM", icon: "sirius", color: "#edf0f4", desc: "Satellite radio", surfaces: { edit: true } },
  { id: "journey-log", title: "Journey log", icon: "journey", color: "#ffd600", desc: "Drive history", surfaces: { edit: true } }
];

export const APP_BY_ID = new Map(APP_REGISTRY.map((app) => [app.id, app]));

function toAppDisplayMeta(app) {
  return {
    id: app.id,
    icon: app.icon,
    color: app.color,
    title: app.title,
    desc: app.desc || `${app.title} 앱`,
    appId: app.id
  };
}

export function getAppById(id) {
  return APP_BY_ID.get(id) || null;
}

export function appDisplayMetaById(id) {
  const app = getAppById(id);
  return app ? toAppDisplayMeta(app) : null;
}

export function fallbackAppMeta() {
  return toAppDisplayMeta(APP_REGISTRY[0]);
}

export function launcherAppMetaById(id) {
  const app = getAppById(id);
  if (!app?.surfaces?.launcher) return null;
  const meta = toAppDisplayMeta(app);
  return { title: meta.title, icon: meta.icon, color: meta.color, appId: meta.appId };
}

export const ALL_APPS = APP_REGISTRY
  .filter((app) => app.surfaces?.launcher)
  .map((app) => {
    const meta = toAppDisplayMeta(app);
    return { title: meta.title, icon: meta.icon, color: meta.color, appId: meta.appId };
  });

export const EDIT_APPS = ALL_APPS.map((app) => app.appId);

export const MEDIA_APP_META = Object.fromEntries(
  APP_REGISTRY
    .filter((app) => app.media)
    .map((app) => [app.id, { title: app.title, ...app.media }])
);

export const APP_SETTING_APPS = APP_REGISTRY
  .filter((app) => app.settings)
  .map((app) => ({
    id: app.settings.id || app.id,
    title: app.settings.title || app.title,
    icon: app.settings.icon || app.icon,
    color: app.settings.color || app.color,
    permissions: app.settings.permissions || []
  }));
