import {
  buildNaverDirectionsUrl,
  buildNaverLocalSearchUrl,
  extractNaverRoute,
  extractMultipleNaverRoutes,
  getNaverMapFailureMessage,
  isValidNaverMapKey,
  normalizeNaverLocalSearchItem,
  normalizeNaverMapConfig,
  toNaverCompatibleLocalUrl,
  toNaverMapsSdkUrl,
  formatRouteDistance
} from "./map-utils.js?v=3";
import { createAppPermissionState, getAppSettingDetail, toggleAppPermission } from "./app-settings-utils.js";
import {
  closeGeneralDropdowns,
  createGeneralSettingsState,
  selectGeneralOption,
  toggleGeneralBoolean
} from "./general-settings-utils.js";
import { searchMediaCatalog, searchMediaCatalogWithFallback } from "./media-search-utils.js";
import { rawMapWidthFromPointer, snapMapWidth } from "./resize-utils.js?v=111";
import { applyCanvasFitScale } from "./canvas-fit-utils.js?v=1";
import { closeVehicleInfoModal, createVehicleInfoState, toggleVehicleInfoFlag } from "./vehicle-info-utils.js";
import { svgIcon } from "./icon-registry.js?v=2";
import {
  ALL_APPS,
  APP_SETTING_APPS,
  EDIT_APPS,
  MEDIA_APP_META,
  appDisplayMetaById,
  fallbackAppMeta,
  launcherAppMetaById
} from "./app-registry.js";

const FIXED_DRIVING_VIEW_WIDTH = 32.708333;

function createLoader(container, type = 'linear') {
  if (typeof lottie === 'undefined') return null;
  const isDark = document.documentElement.classList.contains('dark');
  const mode = isDark ? 'Dark' : 'Light';
  const typeName = type === 'tension' ? 'Tension' : 'Linear';
  return lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: `assets/lottie/Loading_${typeName}_${mode}.json`,
  });
}

function destroyLoader(anim) {
  if (anim) anim.destroy();
}

function mountLottieLoaders(root = document) {
  root.querySelectorAll('.lottie-loader:not([data-lottie-mounted])').forEach(el => {
    el.setAttribute('data-lottie-mounted', '1');
    createLoader(el, el.dataset.type || 'linear');
  });
}

function syncCanvasFitScale() {
  applyCanvasFitScale();
}

syncCanvasFitScale();
window.addEventListener("resize", syncCanvasFitScale, { passive: true });
window.addEventListener("orientationchange", syncCanvasFitScale, { passive: true });

const workspace = document.querySelector(".workspace");
const mapEdgeResizer = document.querySelector("#mapEdgeResizer");
const shortcutGrid = document.querySelector("#shortcutGrid");
const cardLimit = document.querySelector("#cardLimit");
const modeTabs = document.querySelectorAll(".mode-tab");
const modeToast = document.querySelector("#modeToast");
const homeTitle = document.querySelector("#homeTitle");
const destinationInput = document.querySelector("#destinationInput");
const mapSearch = document.querySelector("#mapSearch");
const mapStatus = document.querySelector("#mapStatus");
const mapCanvas = document.querySelector("#naverMap");
const searchResults = document.querySelector("#searchResults");
const routeCard = document.querySelector("#routeCard");
const routeDestination = document.querySelector("#routeDestination");
const routeDuration = document.querySelector("#routeDuration");
const routeDistance = document.querySelector("#routeDistance");
const routeFare = document.querySelector("#routeFare");
const routeGuides = document.querySelector("#routeGuides");
const playlist = document.querySelector("#playlist");
const trackTitle = document.querySelector("#trackTitle");
const artist = document.querySelector("#artist");
const albumArt = document.querySelector("#albumArt");
const clock = document.querySelector("#clock");
const editLayer = document.querySelector("#editLayer");
const appPalette = document.querySelector("#appPalette");
const saveEdit = document.querySelector("#saveEdit");
const cancelEdit = document.querySelector("#cancelEdit");
const enterEdit = document.querySelector("#enterEdit");
const editSlots = document.querySelectorAll("[data-widget-index]");
const dockHome = document.querySelector("#dockHome");
const dock = document.querySelector(".dock");
const gnbSvg = document.querySelector("#gnbSvg");
const gnbRecentApps = document.querySelector("#gnbRecentApps");
const climateTempButtons = document.querySelectorAll("[data-climate-step]");
const climateTempValues = document.querySelectorAll("[data-climate-temp-value]");
const climateKnobButtons = document.querySelectorAll("[data-climate-knob-zone]");
const gnbClimateButtons = document.querySelectorAll("[data-gnb-climate-action]");
const appsLayer = document.querySelector("#appsLayer");
const appsGrid = document.querySelector("#appsGrid");
const vehicleSettingsLayer = document.querySelector("#vehicleSettingsLayer");
const defaultSettingsNav = document.querySelector("#settingsNav");
const defaultSettingsDetail = document.querySelector("#settingsDetail");
let settingsNav = defaultSettingsNav;
let settingsDetail = defaultSettingsDetail;
const navSearchOverlay = document.querySelector("#navSearchOverlay");
const navSearchCard = document.querySelector("#navSearchCard");
const navSearchForm = document.querySelector("#navSearchForm");
const navSearchInput = document.querySelector("#navSearchInput");
const navClearBtn = document.querySelector("#navClearBtn");
const navCloseBtn = document.querySelector("#navCloseBtn");
const navSearchBody = document.querySelector("#navSearchBody");
const navSearchTabs = document.querySelector("#navSearchTabs");
const navDetailCard = document.querySelector("#navDetailCard");
const navDetailName = document.querySelector("#navDetailName");
const navDetailAddress = document.querySelector("#navDetailAddress");
const navDetailPhone = document.querySelector("#navDetailPhone");
const navBackBtn = document.querySelector("#navBackBtn");
const navDetailCloseBtn = document.querySelector("#navDetailCloseBtn");
const navSetDestBtn = document.querySelector("#navSetDestBtn");
const navSearchTrigger = document.querySelector("#navSearchTrigger");
const navMyLocationBtn = document.querySelector("#navMyLocationBtn");

// Navigation HUD & ETA bar
const navGuidanceHud = document.querySelector("#navGuidanceHud");
const navHudArrow = document.querySelector("#navHudArrow");
const navHudDistance = document.querySelector("#navHudDistance");
const navHudRoad = document.querySelector("#navHudRoad");
const navHudNextRoad = document.querySelector("#navHudNextRoad");
const navEtaBar = document.querySelector("#navEtaBar");
const navEtaDest = document.querySelector("#navEtaDest");
const navEtaTime = document.querySelector("#navEtaTime");
const navEtaDist = document.querySelector("#navEtaDist");
const navEtaArrival = document.querySelector("#navEtaArrival");
const navStopBtn = document.querySelector("#navStopBtn");
const routeStartBtn = document.querySelector("#routeStartBtn");
const navMapSettingsBtn = document.querySelector("#navMapSettingsBtn");
const routeCardCloseBtn = document.querySelector("#routeCardCloseBtn");
const routeMoreBtn = document.querySelector("#routeMoreBtn");
const routeCardFooter = document.querySelector(".route-card-footer");

let isCameraTracking = true;
let isRouteExpanded = false;
let routeStartTimerId = null;
let routeStartRemainingSeconds = 5;

const naverCompatibleLocalUrl = toNaverCompatibleLocalUrl(window.location.href);
if (naverCompatibleLocalUrl !== window.location.href) {
  window.location.replace(naverCompatibleLocalUrl);
}

let activeMediaApp = null;
let mediaSearchQuery = "";
let selectedMediaId = null;
let activeMediaItem = null;
let mediaSearchResults = null;
let mediaSearchLoading = false;
let mediaSearchError = "";
let spotifyActiveTab = "home";
let youtubeActiveTab = "home";
let netflixActiveTab = "home";
let netflixSubTab = "all";
let netflixPlaying = false;
let netflixMyList = ["netflix-mylist-0", "netflix-mylist-1", "netflix-mylist-6", "netflix-mylist-7"];
const RECENT_DOCK_LIMIT = 3;

let recentDockApps = [];
let bouncingAppId = null;

const FAVORITE_TILE_ITEMS = {
  "favorite-shortcuts": [
    { icon: "headlight", color: "#edf0f4", title: "Headlights" },
    { icon: "assist", color: "#0068ff", title: "Driver assist" },
    { icon: "regen", color: "#edf0f4", title: "Regenerative braking" },
    { icon: "fog", color: "#edf0f4", title: "Rear fog light" },
    { icon: "trunk", color: "#edf0f4", title: "Trunk" },
    { icon: "mirror", color: "#edf0f4", title: "Mirrors and windows" }
  ],
  "favorite-apps": [
    { icon: "phone", color: "#0068ff", title: "Phone" },
    { icon: "youtube", color: "#f11d1d", title: "YouTube" },
    { icon: "spotify", color: "#1DB954", title: "Spotify" },
    { icon: "chrome", color: "#edf0f4", title: "Browser" },
    { icon: "radio", color: "#f0372f", title: "Radio" },
    { icon: "gallery", color: "#f0372f", title: "Gallery" }
  ]
};

const MEDIA_CATALOG = [
  {
    id: "m1",
    type: "music",
    title: "Drive Mix",
    creator: "Elysia Biro",
    description: "Electronic focus playlist",
    imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=240&auto=format&fit=crop&q=60"
  },
  {
    id: "m2",
    type: "music",
    title: "Ditto",
    creator: "NewJeans",
    description: "K-pop essentials",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=240&auto=format&fit=crop&q=60"
  },
  {
    id: "m3",
    type: "music",
    title: "Seoul City Pop",
    creator: "Night Tempo",
    description: "Late-night Korean city pop",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=240&auto=format&fit=crop&q=60"
  },
  {
    id: "m4",
    type: "music",
    title: "Autonomous Lounge",
    creator: "Polestar Sound",
    description: "Ambient passenger mode",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=240&auto=format&fit=crop&q=60"
  },
  {
    id: "v1",
    type: "video",
    title: "Seoul night drive",
    creator: "Drive Lab",
    description: "4K city route video",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=480&auto=format&fit=crop&q=80"
  },
  {
    id: "v2",
    type: "video",
    title: "IONIQ cockpit walkthrough",
    creator: "HMI Studio",
    description: "Vehicle interface review",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=480&auto=format&fit=crop&q=80"
  },
  {
    id: "v3",
    type: "video",
    title: "Korea EV road trip",
    creator: "Charge Route",
    description: "Highway charging guide",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=480&auto=format&fit=crop&q=80"
  },
  {
    id: "v4",
    type: "video",
    title: "Relaxing dashboard visuals",
    creator: "Ambient Motion",
    description: "Passenger display loop",
    imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=480&auto=format&fit=crop&q=80"
  },
  {
    id: "netflix-picked-0",
    type: "netflix",
    title: "참교육",
    creator: "네이버웹툰 / 스튜디오 LICO",
    description: "선 넘는 학생들과 방관하는 교사들. 붕괴된 교권을 바로잡기 위해 교육부 산하 교권보호국 소속 나화진의 참교육이 시작된다.",
    imageUrl: "./assets/netflix/img1_row1_col0.jpg",
    category: "TV-Shows",
    genre: "K-웹툰 / 액션 / 학원물",
    rating: "18+",
    duration: "최신 등록",
    badge: "최신 등록"
  },
  {
    id: "netflix-picked-1",
    type: "netflix",
    title: "유재석 캠프★프",
    creator: "유재석 / 안테나",
    description: "유재석과 함께 떠나는 힐링 캠프. 특별한 게스트들과 나누는 깊은 이야기와 유쾌한 웃음의 순간들.",
    imageUrl: "./assets/netflix/img1_row1_col1.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 리얼리티 / 토크",
    rating: "15+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-picked-2",
    type: "netflix",
    title: "모두가 자신의 무가치함과 싸우고 있다",
    creator: "힐링 다큐멘터리",
    description: "마음의 상처를 치유하기 위한 여정. 현대인들이 겪는 내면의 갈등과 극복 스토리를 조명한다.",
    imageUrl: "./assets/netflix/img1_row1_col2.jpg",
    category: "TV-Shows",
    genre: "다큐멘터리 / 사회 / 힐링",
    rating: "15+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-picked-3",
    type: "netflix",
    title: "사냥개들",
    creator: "우도환, 이상이, 허준호",
    description: "돈을 쫓아 사채업의 세계에 발을 들인 두 청년이 거대한 악의 세력에 맞서 목숨 걸고 싸우는 액션 드라마.",
    imageUrl: "./assets/netflix/img1_row1_col3.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 범죄 / 액션 / 스릴러",
    rating: "18+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-picked-4",
    type: "netflix",
    title: "사이버펑크: 엣지러너",
    creator: "TRIGGER / CD PROJEKT RED",
    description: "기술과 신체 개조가 지배하는 디스토피아 미래 도시 나이트 시티에서 모든 것을 잃은 소년이 스트리트 키드 '엣지러너'가 되기로 결심한다.",
    imageUrl: "./assets/netflix/img1_row1_col4.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / SF / 사이버펑크 / 액션",
    rating: "18+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-picked-5",
    type: "netflix",
    title: "냉장고를 부탁해",
    creator: "김성주, 안정환 및 셰프 군단",
    description: "최고의 셰프들이 게스트의 냉장고 속 재료만을 사용해 15분 만에 기적 같은 요리를 선보이는 쿡방 예능.",
    imageUrl: "./assets/netflix/img1_row1_col5.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 요리 / 토크쇼",
    rating: "12+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-picked-6",
    type: "netflix",
    title: "멋진 신세계",
    creator: "올더스 헉슬리 원작 드라마",
    description: "완벽하게 통제된 유토피아 사회. 그 속에서 인간적 감정을 깨달은 이들이 겪는 갈등과 파멸의 서사.",
    imageUrl: "./assets/netflix/img1_row1_col6.jpg",
    category: "TV-Shows",
    genre: "SF / 디스토피아 / 미스터리",
    rating: "18+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-picked-7",
    type: "netflix",
    title: "주술회전 사멸회유",
    creator: "MAPPA / 아쿠타미 게게",
    description: "미증유의 주술 전투 '사멸회유'가 개막된다. 주술사들의 목숨을 건 데스게임이 펼쳐지는 본격 다크 판타지 애니메이션.",
    imageUrl: "./assets/netflix/img1_row1_col7.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 다크 판타지 / 액션",
    rating: "18+",
    duration: "최신 등록"
  },
  {
    id: "netflix-kdrama-0",
    type: "netflix",
    title: "슬기로운 의사생활",
    creator: "신원호 감독 / 조정석, 유연석, 정경호",
    description: "누군가는 태어나고 누군가는 삶을 끝내는, 인생의 축소판이라 불리는 병원에서 평범한 듯 특별한 하루하루를 살아가는 20년 지기 친구들의 케미스토리.",
    imageUrl: "./assets/netflix/img1_row2_col0.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 메디컬 / 휴먼 / 라이프",
    rating: "15+",
    duration: "시즌 2개",
    episodes: [
      { title: "1화: 무궁화 꽃이 피던 날", duration: "60분", description: "병원에서 매일 사투를 벌이는 다섯 명의 동기 의사들이 20년 전 밴드를 다시 모아 연습을 시작한다.", thumbnail: "./assets/netflix/img1_row2_col0.jpg" }
    ]
  },
  {
    id: "netflix-kdrama-1",
    type: "netflix",
    title: "이 사람 통역 되나요?",
    creator: "로맨틱 코미디",
    description: "언어 장벽을 넘어 소통하는 번역가와 톱스타 사이에서 벌어지는 좌충우돌 로맨틱 러브스토리.",
    imageUrl: "./assets/netflix/img1_row2_col1.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 로맨스 / 코미디",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-kdrama-2",
    type: "netflix",
    title: "이상한 변호사 우영우",
    creator: "박은빈, 강태오, 강기영",
    description: "천재적인 두뇌와 자폐스펙트럼을 동시에 가진 신입 변호사 우영우의 대형 로펌 생존기.",
    imageUrl: "./assets/netflix/img1_row2_col2.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 법정 / 휴먼 / 코미디",
    rating: "12+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-kdrama-3",
    type: "netflix",
    title: "그해 우리는",
    creator: "최우식, 김다미, 김성철",
    description: "함께해서 더러웠고 다신 보지 말자!로 끝났어야 할 인연이 10년 뒤 고등학교 시절 촬영한 다큐멘터리의 역주행으로 인해 강제 소환되면서 펼쳐지는 로맨스.",
    imageUrl: "./assets/netflix/img1_row2_col3.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 청춘 / 로맨스 / 멜로",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-kdrama-4",
    type: "netflix",
    title: "D.P.",
    creator: "정해인, 구교환, 김성균",
    description: "탈영병들을 잡는 군무 이탈 체포조(D.P.) 준호와 호열이 다양한 사연을 가진 이들을 쫓으며 미처 알지 못했던 현실을 마주하는 이야기.",
    imageUrl: "./assets/netflix/img1_row2_col4.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 군대 / 밀리터리 / 드라마",
    rating: "18+",
    duration: "시즌 2개"
  },
  {
    id: "netflix-kdrama-5",
    type: "netflix",
    title: "은중과 상연",
    creator: "김고은, 박지현",
    description: "초등학생 시절부터 절친이었던 두 여자가 자라나며 겪는 우정, 질투, 그리고 애틋한 연대를 다룬 섬세한 감성 드라마.",
    imageUrl: "./assets/netflix/img1_row2_col5.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 휴먼 / 워맨스",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-kdrama-6",
    type: "netflix",
    title: "폭싹 속았수다",
    creator: "아이유, 박보검",
    description: "1950년대 제주에서 태어난 '요망진 반항아' 애순이와 '팔불출 무쇠' 관식이의 모험 가득한 일생을 사계절로 풀어낸 헌사 같은 드라마.",
    imageUrl: "./assets/netflix/img1_row2_col6.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 시대극 / 청춘 / 로맨스",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-kdrama-7",
    type: "netflix",
    title: "멋진 신세계 (K)",
    creator: "오리지널 드라마",
    description: "새로운 가치관과 질서 속에서 살아가는 젊은 세대들의 사랑과 갈등을 담은 K-오리지널 드라마.",
    imageUrl: "./assets/netflix/img1_row2_col7.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 미스터리 / 로맨스",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-anime-0",
    type: "netflix",
    title: "진격의 거인 The Final Season",
    creator: "MAPPA / 이사야마 하지메",
    description: "벽 너머의 진실이 마침내 밝혀지고, 인류와 거인의 마지막 결전이 치달아간다. 에렌 예거의 종말을 향한 걸음과 그를 막으려는 동료들의 혈투.",
    imageUrl: "./assets/netflix/img1_row3_col0.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 액션 / 다크 판타지",
    rating: "18+",
    duration: "시즌 4개"
  },
  {
    id: "netflix-anime-1",
    type: "netflix",
    title: "주술회전",
    creator: "MAPPA / 아쿠타미 게게",
    description: "경이로운 신체 능력을 가진 고등학생 이타도리 유지가 저주에 걸린 손가락을 먹은 후 주술 고등학교에 입학하며 벌어지는 이능 액션 판타지.",
    imageUrl: "./assets/netflix/img1_row3_col1.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 액션 / 주술 / 다크 판타지",
    rating: "18+",
    duration: "시즌 2개"
  },
  {
    id: "netflix-anime-2",
    type: "netflix",
    title: "헌터x헌터 (Hunter x Hunter)",
    creator: "토가시 요시히로",
    description: "아버지를 찾기 위해 헌터가 되기로 결심한 소년 곤과 개성 넘치는 동료들이 다양한 시험과 미지의 세계를 모험하는 정통 판타지 애니메이션.",
    imageUrl: "./assets/netflix/img1_row3_col2.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 모험 / 정통 판타지 / 액션",
    rating: "15+",
    duration: "시즌 6개"
  },
  {
    id: "netflix-anime-3",
    type: "netflix",
    title: "장송의 프리렌",
    creator: "매드하우스",
    description: "마왕을 물리친 용사 일행의 마법사 프리렌. 수명이 아주 긴 엘프인 그녀가 동료들의 죽음 이후 인간을 알아가기 위해 떠나는 따뜻하고 잔잔한 마법 여정.",
    imageUrl: "./assets/netflix/img1_row3_col3.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 판타지 / 힐링 / 모험",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-anime-4",
    type: "netflix",
    title: "귀멸의 칼날",
    creator: "유포터블 / 고토게 코요하루",
    description: "혈귀에게 가족을 잃고 유일하게 살아남았으나 혈귀가 된 여동생 네즈코를 다시 인간으로 되돌리기 위해 검사 '귀살대'가 된 탄지로의 처절한 사투.",
    imageUrl: "./assets/netflix/img1_row3_col4.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 시대극 / 액션 / 다크 판타지",
    rating: "18+",
    duration: "시즌 4개"
  },
  {
    id: "netflix-anime-5",
    type: "netflix",
    title: "나 혼자만 레벨업",
    creator: "A-1 Pictures / 추공 원작",
    description: "인류 최약병기로 불리던 E급 헌터 성진우가 의문의 던전에서 살아남은 후, 자신에게만 보이는 퀘스트 창을 통해 끊임없이 성장하며 레벨업하는 액션 판타지.",
    imageUrl: "./assets/netflix/img1_row3_col5.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 현대 판타지 / 액션 / 먼치킨",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-anime-6",
    type: "netflix",
    title: "향기로운 꽃은 흐드러지게 핀다",
    creator: "로맨스 애니메이션",
    description: "이웃해 있는 앙숙 학교의 두 남녀가 우연히 빵집에서 만나 비밀스럽게 교류하며 자라나는 풋풋하고 따뜻한 청춘 학원 로맨스.",
    imageUrl: "./assets/netflix/img1_row3_col6.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 청춘 / 학원물 / 로맨스",
    rating: "12+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-anime-7",
    type: "netflix",
    title: "사이버펑크: 엣지러너 (A)",
    creator: "TRIGGER",
    description: "나이트 시티의 가혹한 현실 속에서 살아남기 위해 자신을 메카쿠시한 데이비드의 질주하는 인생과 우정의 SF 대작.",
    imageUrl: "./assets/netflix/img1_row3_col7.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / SF / 액션",
    rating: "18+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-mylist-0",
    type: "netflix",
    title: "스물다섯 스물하나",
    creator: "이나정 작가 / 김태리, 남주혁",
    description: "1998년 IMF로 꿈을 빼앗긴 스물둘의 나희도와 스물여덟의 백이진이 스물다섯과 스물하나에 서로 사랑하고 성장해가는 청춘 로맨스.",
    imageUrl: "./assets/netflix/img2_row1_col0.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 청춘 / 로맨스 / 스포츠",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-mylist-1",
    type: "netflix",
    title: "약한영웅 Class 1",
    creator: "최현욱, 이준영, 홍경",
    description: "완력은 없지만 뛰어난 두뇌로 학교 폭력에 맞서는 소년 연시은의 치열한 학원 액션 서바이벌.",
    imageUrl: "./assets/netflix/img2_row1_col1.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 액션 / 학원 / 청춘",
    rating: "18+",
    duration: "시즌 2개"
  },
  {
    id: "netflix-mylist-2",
    type: "netflix",
    title: "더 글로리",
    creator: "김은숙 작가 / 송혜교, 이도현",
    description: "학교 폭력 피해자 문동은이 가해자들에게 처절한 복수를 준비하며 20년을 벼려온 서늘하고 치밀한 복수극.",
    imageUrl: "./assets/netflix/img2_row1_col2.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 복수 / 스릴러 / 드라마",
    rating: "18+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-mylist-3",
    type: "netflix",
    title: "스트리트 브리거스",
    creator: "이제훈, 박정민",
    description: "거리의 전설들이 다시 뭉쳐 조직 내부의 배신과 권력 다툼 속에서 살아남기 위한 치열한 사투를 펼치는 액션 드라마.",
    imageUrl: "./assets/netflix/img2_row1_col3.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 액션 / 범죄",
    rating: "18+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-mylist-4",
    type: "netflix",
    title: "눈물의 여왕",
    creator: "박지은 작가 / 김수현, 김지원",
    description: "대한민국 1등 재벌가 퀸즈 백화점 상속녀와 평범한 시골 청년의 결혼 3년 차 위기를 그린 로맨틱 드라마.",
    imageUrl: "./assets/netflix/img2_row1_col4.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 로맨스 / 코미디 / 드라마",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-mylist-5",
    type: "netflix",
    title: "미스터 션샤인",
    creator: "김은숙 작가 / 이병헌, 김태리",
    description: "신미양요 때 미국 군함에 몸을 실은 소년이 미군 장교가 되어 조선으로 돌아오며 펼쳐지는 구한말 격동의 서사 로맨스.",
    imageUrl: "./assets/netflix/img2_row1_col5.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 역사 / 로맨스 / 시대극",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-mylist-6",
    type: "netflix",
    title: "쩐양먹기",
    creator: "K-푸드 예능",
    description: "전국 방방곡곡 숨어있는 골목 맛집과 길거리 음식을 찾아 떠나는 유쾌하고 맛있는 먹방 여행 예능.",
    imageUrl: "./assets/netflix/img2_row1_col6.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 먹방 / 여행 / 리얼리티",
    rating: "All",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-mylist-7",
    type: "netflix",
    title: "킹덤",
    creator: "김은희 작가 / 주지훈, 배두나, 류승룡",
    description: "병든 왕을 둘러싼 불길한 소문 속에 조선을 뒤덮은 괴질의 원인을 찾아 세자 창이 어둠 속에 숨겨진 굶주린 이들과 사투를 벌이는 미스터리 스릴러.",
    imageUrl: "./assets/netflix/img2_row1_col7.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 좀비 / 미스터리 / 사극",
    rating: "18+",
    duration: "시즌 2개"
  },
  {
    id: "netflix-reality-0",
    type: "netflix",
    title: "흑백요리사: 요리 계급 전쟁",
    creator: "백종원, 안성재 심사위원",
    description: "최고의 맛을 찾아 떠나는 치열한 대결. 재야의 숨은 요리 고수 '흑수저'들이 대한민국 스타 셰프 '백수저'들에게 도전한다.",
    imageUrl: "./assets/netflix/img2_row2_col0.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 서바이벌 / 요리",
    rating: "12+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-reality-1",
    type: "netflix",
    title: "연애기숙학교 돌싱글즈",
    creator: "K-연애 예능",
    description: "한 번 다녀온 돌싱 남녀들이 모여 서로의 아픔을 공유하고 새로운 사랑을 싹틔우는 본격 리얼 연애 서바이벌 예능.",
    imageUrl: "./assets/netflix/img2_row2_col1.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 리얼리티 / 데이팅",
    rating: "15+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-reality-2",
    type: "netflix",
    title: "나는 SOLO",
    creator: "데프콘, 송해나, 이이경",
    description: "결혼을 간절히 원하는 솔로 남녀들이 모여 사랑을 찾기 위해 고군분투하는 극사실주의 리얼 데이팅 프로그램.",
    imageUrl: "./assets/netflix/img2_row2_col2.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 리얼리티 / 데이팅",
    rating: "15+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-reality-3",
    type: "netflix",
    title: "솔로지옥",
    creator: "홍진경, 이다희, 규현, 덱스",
    description: "커플이 되어야만 탈출할 수 있는 외딴섬 '지옥도'에서 펼쳐지는 청춘 남녀들의 솔직하고 도발적인 연애 리얼리티.",
    imageUrl: "./assets/netflix/img2_row2_col3.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 리얼리티 / 로맨스",
    rating: "15+",
    duration: "시즌 3개"
  },
  {
    id: "netflix-reality-4",
    type: "netflix",
    title: "최후의 인류",
    creator: "리얼 다큐",
    description: "극단적인 기후 변화 속에서 생존하기 위한 인류 최후의 기록과 사투를 그려낸 본격 환경 예능 다큐멘터리.",
    imageUrl: "./assets/netflix/img2_row2_col4.jpg",
    category: "TV-Shows",
    genre: "다큐멘터리 / 생존 / 사회",
    rating: "15+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-reality-5",
    type: "netflix",
    title: "법륜스님의 스님과 손님",
    creator: "법륜스님",
    description: "인생의 길을 잃은 손님들에게 법륜스님이 전하는 따뜻하고 명쾌한 즉문즉설 인생 조언 멘토링 예능.",
    imageUrl: "./assets/netflix/img2_row2_col5.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 토크 / 힐링 / 멘토링",
    rating: "All",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-reality-6",
    type: "netflix",
    title: "피지컬: 100",
    creator: "생존 게임 서바이벌",
    description: "가장 완벽한 피지컬을 찾기 위해 모인 100인의 몸싸움 서바이벌 극강 퀘스트.",
    imageUrl: "./assets/netflix/img2_row2_col6.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 서바이벌 / 운동",
    rating: "12+",
    duration: "시즌 2개"
  },
  {
    id: "netflix-reality-7",
    type: "netflix",
    title: "신규 리얼리티",
    creator: "신작 예능",
    description: "새롭게 단장하여 시청자를 찾아가는 좌충우돌 라이브 버라이어티.",
    imageUrl: "./assets/netflix/img2_row2_col7.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 코미디",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-acclaimed-0",
    type: "netflix",
    title: "언젠가는 슬기로울 전공의생활",
    creator: "고윤정, 신시아",
    description: "대학병원 산부인과 전공의들의 리얼한 병원 생활과 풋풋한 우정을 다룬 의사생활 스핀오프.",
    imageUrl: "./assets/netflix/img2_row3_col0.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 메디컬 / 휴먼",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-acclaimed-1",
    type: "netflix",
    title: "슬기로운 감빵생활",
    creator: "박해수, 정경호, 성동일",
    description: "하루아침에 교도소에 갇히게 된 슈퍼스타 야구선수 김제혁의 슬기로운 교도소 생존기와 그 안의 다양한 수감자들의 이야기.",
    imageUrl: "./assets/netflix/img2_row3_col1.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 코미디 / 드라마 / 블랙 코미디",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-acclaimed-2",
    type: "netflix",
    title: "폭싹 속았수다 (M)",
    creator: "로맨스 사극",
    description: "제주에서 태어난 반항아 애순이와 우직한 관식이의 일생을 사계절로 풀어낸 헌사 같은 사랑 드라마.",
    imageUrl: "./assets/netflix/img2_row3_col2.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 시대극 / 청춘 / 로맨스",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-acclaimed-3",
    type: "netflix",
    title: "모범택시",
    creator: "이제훈, 이솜, 김의성",
    description: "법의 보호를 받지 못하는 억울한 피해자들을 대신해 사적 복수를 대행해 주는 비밀 택시회사 무지개 운수와 그들의 처절한 복수극.",
    imageUrl: "./assets/netflix/img2_row3_col3.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 액션 / 범죄 / 스릴러",
    rating: "18+",
    duration: "시즌 2개"
  },
  {
    id: "netflix-acclaimed-4",
    type: "netflix",
    title: "선재 업고 튀어",
    creator: "변우석, 김혜윤",
    description: "삶의 의지를 놓아버렸던 순간, 자신을 살려준 아티스트 류선재의 죽음. 그의 비극적인 운명을 바꾸기 위해 2008년으로 시간 여행을 떠나는 임솔의 로맨스 구원 서사.",
    imageUrl: "./assets/netflix/img2_row3_col4.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 타임슬립 / 판타지 / 로맨스 / 청춘",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-acclaimed-5",
    type: "netflix",
    title: "재벌집 막내아들",
    creator: "송중기, 이성민, 신현빈",
    description: "재벌 총수 일가의 리스크를 관리하던 비서가 재벌가의 막내아들로 회귀하여 인생 2회차를 살며 순양그룹을 통째로 집어삼키는 판타지 복수극.",
    imageUrl: "./assets/netflix/img2_row3_col5.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 회귀 / 판타지 / 기업 경영",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-acclaimed-6",
    type: "netflix",
    title: "스물다섯 스물하나",
    creator: "김태리, 남주혁",
    description: "IMF 시대에 꿈을 빼앗긴 청춘들의 방황과 성장을 그린 드라마. 스물둘과 열여덟에 만나, 스물다섯과 스물하나에 사랑하고 성장한 청춘 로맨스.",
    imageUrl: "./assets/netflix/img2_row3_col6.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 청춘 / 성장 / 로맨스 / 스포츠",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-acclaimed-7",
    type: "netflix",
    title: "은중과 상연 (M)",
    creator: "우정 멜로",
    description: "평생에 걸친 깊고 특별한 우정과 질투, 갈등을 그려낸 정교한 감성 멜로 드라마.",
    imageUrl: "./assets/netflix/img2_row3_col7.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 휴먼 / 우정",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-top10-0",
    type: "netflix",
    title: "참교육",
    creator: "네이버웹툰 / 스튜디오 LICO",
    description: "무너진 교권을 다시 세우기 위한 나화진의 과감하고 시원한 정의 집행 학원 액션 드라마.",
    imageUrl: "./assets/netflix/img3_top10_col0.jpg",
    category: "TV-Shows",
    genre: "K-웹툰 / 액션 / 학원물",
    rating: "18+",
    duration: "최신 등록",
    rank: 1,
    badge: "최신 등록"
  },
  {
    id: "netflix-top10-1",
    type: "netflix",
    title: "멋진 신세계 (TOP)",
    creator: "오리지널 시리즈",
    description: "새로운 문명과 사회 체제 속 통제된 유토피아에서 인간 존엄성을 찾으려 발버둥 치는 이들의 SF 드라마.",
    imageUrl: "./assets/netflix/img3_top10_col1.jpg",
    category: "TV-Shows",
    genre: "SF / 미스터리 / 스릴러",
    rating: "18+",
    duration: "신규 에피소드",
    rank: 2,
    badge: "신규 에피소드"
  },
  {
    id: "netflix-top10-2",
    type: "netflix",
    title: "유재석 캠프★프 (TOP)",
    creator: "안테나 예능",
    description: "대국민 힐링 웃음 배달 프로젝트. 특별한 자연 속 캠프에서 펼쳐지는 유쾌한 야외 예능.",
    imageUrl: "./assets/netflix/img3_top10_col2.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 리얼리티 / 야외",
    rating: "15+",
    duration: "신규 에피소드",
    rank: 3,
    badge: "신규 에피소드"
  },
  {
    id: "netflix-top10-3",
    type: "netflix",
    title: "꼬리에 꼬리를 무는 그날 이야기 (꼬꼬무)",
    creator: "SBS 시사 예능",
    description: "대한민국을 뒤흔들었던 역사 속 '그날'의 미스터리와 사건을 이야기꾼들이 친구에게 직접 말해주듯 들려주는 다큐형 토크쇼 예능.",
    imageUrl: "./assets/netflix/img3_top10_col3.jpg",
    category: "TV-Shows",
    genre: "K-예능 / 다큐멘터리 / 범죄 역사 / 토크",
    rating: "15+",
    duration: "신규 에피소드",
    rank: 4,
    badge: "신규 에피소드"
  },
  {
    id: "netflix-top10-4",
    type: "netflix",
    title: "최후의 인류 (TOP)",
    creator: "SF 생존 다큐",
    description: "종말을 앞둔 인류의 사투와 자연과의 전쟁을 리얼하게 담아낸 대작 다큐멘터리 예능.",
    imageUrl: "./assets/netflix/img3_top10_col4.jpg",
    category: "TV-Shows",
    genre: "다큐멘터리 / SF / 생존",
    rating: "15+",
    duration: "신규 에피소드",
    rank: 5,
    badge: "신규 에피소드"
  },
  {
    id: "netflix-game-0",
    type: "netflix",
    title: "Football Manager 2026 Mobile",
    creator: "Sports Interactive / SEGA",
    description: "클럽을 이끌며 전 세계 리그를 지배해 보세요. 최고의 전략과 전술로 나만의 드림팀을 구성하여 우승 트로피를 차지하는 스포츠 감독 매니지먼트 게임.",
    imageUrl: "./assets/netflix/img3_games_col0.jpg",
    category: "Game",
    genre: "게임 / 스포츠 / 시뮬레이션 / 전략",
    rating: "All",
    duration: "새 업데이트",
    isGame: true,
    badge: "새 업데이트"
  },
  {
    id: "netflix-game-1",
    type: "netflix",
    title: "솔리테어",
    creator: "넷플릭스 클래식 카드 게임",
    description: "간단하고 중독성 있는 클래식 카드 맞추기 퍼즐. 오프라인에서도 언제 어디서나 즐길 수 있는 최고의 캐주얼 힐링 게임.",
    imageUrl: "./assets/netflix/img3_games_col1.jpg",
    category: "Game",
    genre: "게임 / 카드 / 퍼즐 / 캐주얼",
    rating: "All",
    duration: "카드 게임",
    isGame: true
  },
  {
    id: "netflix-game-2",
    type: "netflix",
    title: "레드 데드 리뎀션 (Red Dead Redemption)",
    creator: "Rockstar Games",
    description: "무법자 아서 모건과 반 더 린드 갱단의 몰락해가는 서부 개척 시대를 생생히 그려낸 오픈 월드 명작 액션 게임.",
    imageUrl: "./assets/netflix/img3_games_col2.jpg",
    category: "Game",
    genre: "게임 / 액션 / 오픈월드 / 어드벤처",
    rating: "18+",
    duration: "액션",
    isGame: true
  },
  {
    id: "netflix-game-3",
    type: "netflix",
    title: "넷플릭스 퍼즐 모음",
    creator: "다양한 두뇌 퍼즐",
    description: "쉬우면서도 머리를 써야 하는 퍼즐 게임들의 집합. 레벨별 챌린지를 클리어하며 두뇌 훈련을 해보세요.",
    imageUrl: "./assets/netflix/img3_games_col3.jpg",
    category: "Game",
    genre: "게임 / 퍼즐 / 두뇌개발",
    rating: "All",
    duration: "퍼즐",
    isGame: true
  },
  {
    id: "netflix-game-4",
    type: "netflix",
    title: "블루스 TD 6 (풍선 타워 디펜스 6)",
    creator: "Ninja Kiwi",
    description: "풍선들을 물리치기 위해 원숭이 타워와 강력한 영웅들을 조합하여 막아내는 중독성 만점의 타워 디펜스 전략 게임.",
    imageUrl: "./assets/netflix/img3_games_col4.jpg",
    category: "Game",
    genre: "게임 / 디펜스 / 전략 / 캐주얼",
    rating: "All",
    duration: "새 업데이트",
    isGame: true,
    badge: "새 업데이트"
  },
  {
    id: "netflix-game-5",
    type: "netflix",
    title: "넷플릭스 놀이터",
    creator: "어린이 키즈 퍼즐",
    description: "아이들을 위한 귀여운 동물 캐릭터들과 함께하는 직관적이고 안전한 미니 게임 및 창의력 퍼즐 컬렉션.",
    imageUrl: "./assets/netflix/img3_games_col5.jpg",
    category: "Game",
    genre: "게임 / 어린이 / 교육 / 퍼즐",
    rating: "All",
    duration: "어린이",
    isGame: true
  },
  {
    id: "netflix-game-6",
    type: "netflix",
    title: "Word Trails",
    creator: "영어 단어 맞추기",
    description: "제시된 알파벳을 연결하여 숨겨진 단어를 찾아내는 심플하고 스마트한 크로스워드 영단어 퍼즐 게임.",
    imageUrl: "./assets/netflix/img3_games_col6.jpg",
    category: "Game",
    genre: "게임 / 퍼즐 / 어휘력",
    rating: "All",
    duration: "퍼즐",
    isGame: true
  },
  {
    id: "netflix-game-7",
    type: "netflix",
    title: "World of Peppa Pig (페파피그)",
    creator: "어린이 애니메이션 게임",
    description: "귀여운 페파피그와 그 친구들과 함께 떠나는 창의 미니게임 및 생활 습관 발달용 키즈 플레이랜드.",
    imageUrl: "./assets/netflix/img3_games_col7.jpg",
    category: "Game",
    genre: "게임 / 어린이 / 캐주얼",
    rating: "All",
    duration: "어린이",
    isGame: true
  },
  {
    id: "netflix-new-0",
    type: "netflix",
    title: "참교육 (NEW)",
    creator: "웹툰 원작",
    description: "학교 내의 불의를 처단하고 정의를 재정의하는 특별교사 나화진의 카리스마 액션 활약상.",
    imageUrl: "./assets/netflix/img3_new_col0.jpg",
    category: "TV-Shows",
    genre: "K-웹툰 / 액션",
    rating: "18+",
    duration: "최신 등록",
    badge: "최신 등록"
  },
  {
    id: "netflix-new-1",
    type: "netflix",
    title: "선재 업고 튀어 (NEW)",
    creator: "판타지 로맨스",
    description: "임솔의 헌신적인 시간여행 로맨스. 선재를 살리기 위한 2008년의 풋풋하고 치열한 기억의 조각.",
    imageUrl: "./assets/netflix/img3_new_col1.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 로맨스",
    rating: "15+",
    duration: "시즌 1개"
  },
  {
    id: "netflix-new-2",
    type: "netflix",
    title: "최후의 인류 (NEW)",
    creator: "생존 다큐",
    description: "신규 에피소드 공개! 환경 파괴 속 지구 구석구석에서 살아남은 인류의 다큐멘터리 서사.",
    imageUrl: "./assets/netflix/img3_new_col2.jpg",
    category: "TV-Shows",
    genre: "다큐멘터리 / 생존",
    rating: "15+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-new-3",
    type: "netflix",
    title: "중간계",
    creator: "정통 판타지 대작",
    description: "빛과 어둠의 세력이 대립하는 중간계에서 펼쳐지는 장엄한 여정과 종족 간의 운명을 건 거대한 전투 서사 드라마.",
    imageUrl: "./assets/netflix/img3_new_col3.jpg",
    category: "Movies",
    genre: "판타지 / 모험 / 액션",
    rating: "15+",
    duration: "2시간 45분"
  },
  {
    id: "netflix-new-4",
    type: "netflix",
    title: "세계의 부인",
    creator: "격동의 실화 시대극",
    description: "역사 속 위대한 발견과 혁명의 순간을 이끌었던 한 부인의 강인한 극복 스토리와 로맨스 실화 영화.",
    imageUrl: "./assets/netflix/img3_new_col4.jpg",
    category: "Movies",
    genre: "영화 / 드라마 / 시대극 / 실화",
    rating: "15+",
    duration: "2시간 12분"
  },
  {
    id: "netflix-new-5",
    type: "netflix",
    title: "교조",
    creator: "미스터리 스릴러",
    description: "신규 에피소드 공개! 사이비 종교의 어두운 실체를 파헤치는 수사팀의 끈질긴 추적 미스터리 수사극.",
    imageUrl: "./assets/netflix/img3_new_col5.jpg",
    category: "TV-Shows",
    genre: "K-Drama / 미스터리 / 스릴러",
    rating: "18+",
    duration: "신규 에피소드",
    badge: "신규 에피소드"
  },
  {
    id: "netflix-new-6",
    type: "netflix",
    title: "Re:제로부터 시작하는 이세계 생활",
    creator: "White Fox / 하라하라 텟페이",
    description: "갑자기 이세계로 소환된 고등학생 나츠키 스바루가 죽음으로써 시간을 되돌리는 '사망귀환'의 루프 속에서 소중한 사람들을 구하는 처절한 판타지.",
    imageUrl: "./assets/netflix/img3_new_col6.jpg",
    category: "TV-Shows",
    genre: "애니메이션 / 다크 판타지 / 루프물 / 액션",
    rating: "15+",
    duration: "시즌 3개"
  },
  {
    id: "netflix-new-7",
    type: "netflix",
    title: "신규 콘텐츠",
    creator: "넷플릭스 오리지널 신작",
    description: "이번 주 새롭게 공개된 초감각 어드벤처 오리지널 대작 무비.",
    imageUrl: "./assets/netflix/img3_new_col7.jpg",
    category: "Movies",
    genre: "영화 / 액션 / SF",
    rating: "15+",
    duration: "1시간 58분"
  }
];

const VEHICLE_SETTINGS = [
  { id: "quick", title: "빠른 설정", icon: "settings-quick" },
  { id: "lights", title: "라이트", icon: "settings-lights" },
  { id: "assist", title: "주행 보조", icon: "settings-assist" },
  { id: "lock", title: "잠금", icon: "settings-lock" },
  { id: "seat-position", title: "시트 포지션", icon: "settings-seat-position" },
  { id: "climate-settings", title: "공조", icon: "settings-climate" },
  { id: "charging", title: "충전", icon: "settings-charging" },
  { id: "navigation-settings", title: "내비게이션", icon: "settings-navigation" },
  { id: "gleo-ai", title: "Gleo AI", icon: "settings-gleo-ai" },
  { id: "display", title: "화면", icon: "settings-display" },
  { id: "security", title: "보안", icon: "settings-security" },
  { id: "sound", title: "사운드", icon: "settings-sound" },
  { id: "profile", title: "프로필", icon: "settings-profile" },
  { id: "convenience", title: "편의 기능", icon: "settings-convenience" },
  { id: "connection", title: "연결", icon: "settings-connection" },
  { id: "apps-settings", title: "앱", icon: "settings-apps" },
  { id: "general", title: "일반 설정", icon: "settings-general" },
  { id: "vehicle-info", title: "차량 정보", icon: "settings-vehicle-info" }
];

const QUICK_SETTING_TILES = [
  { id: "door-lock", title: "도어 잠금", offStatus: "해제됨", onStatus: "잠김", icon: "doorLock" },
  { id: "window", title: "창문", offStatus: "닫힘", onStatus: "열림", icon: "window" },
  { id: "window-lock", title: "창문 잠금", offStatus: "해제됨", onStatus: "잠김", icon: "windowLock" },
  { id: "child-lock", title: "어린이 보호 잠금", offStatus: "해제됨", onStatus: "잠김", icon: "childLock" },
  { id: "glovebox", title: "글로브박스", offStatus: "닫힘", onStatus: "열림", icon: "glovebox", disabledWhenOn: true },
  { id: "frunk", title: "프렁크", offStatus: "닫힘", onStatus: "열림", icon: "frunk" },
  { id: "trunk", title: "트렁크", offStatus: "닫힘", onStatus: "열림", icon: "trunk" },
  { id: "sunroof", title: "선루프", offStatus: "닫힘", onStatus: "열림", icon: "sunroof" },
  { id: "side-mirror", title: "사이드미러", offStatus: "펴짐", onStatus: "접힘", icon: "mirror" },
  { id: "charge-port", title: "충전구", offStatus: "닫힘", onStatus: "열림", icon: "chargePort" }
];

const GENERIC_SETTING_ROWS = {
  lights: ["실외 조명", "실내 조명", "웰컴 라이트", "하이빔 보조"],
  assist: ["차로 유지 보조", "스마트 크루즈", "전방 충돌 방지", "주차 보조"],
  lock: ["도어 잠금", "자동 잠금", "어린이 보호 잠금", "디지털 키"],
  "seat-position": ["운전석", "동승석", "메모리 포지션", "승하차 편의"],
  "climate-settings": ["Auto 공조", "공기 청정", "앞좌석 열선", "앞좌석 통풍"],
  charging: ["충전 목표", "예약 충전", "충전구", "배터리 컨디셔닝"],
  "navigation-settings": ["경로 옵션", "지도 표시", "안내 음량", "최근 목적지"],
  "gleo-ai": ["음성 호출", "추천 카드", "개인화", "대화 기록"],
  display: ["밝기", "테마", "화면 자동 꺼짐", "위젯 표시"],
  sound: ["미디어 음량", "안내 음량", "알림음", "몰입 사운드"],
  profile: ["운전자 프로필", "동기화", "게스트 모드", "프로필 초기화"],
  convenience: ["후방 안개등", "회생제동", "트렁크", "사이드미러"],
  connection: ["Bluetooth", "Wi-Fi", "모바일 핫스팟", "기기 관리"],
  "apps-settings": ["기본 앱", "앱 권한", "알림", "저장 공간"],
  general: ["언어", "날짜 및 시간", "단위", "초기화"],
  "vehicle-info": ["차량 상태", "소프트웨어", "주행 가능 거리", "라이선스"]
};

const GENERAL_SEGMENTS = {
  timeFormat: ["12 시간", "24 시간"],
  distanceUnit: ["km", "mile"],
  temperatureUnit: ["°C", "°F"],
  efficiencyUnit: ["km/kWh", "kWh/100km"],
  tirePressureUnit: ["psi", "kPa", "bar"]
};

const GENERAL_DROPDOWNS = {
  font: ["기본", "현대", "기아", "제네시스"],
  language: ["English", "한국어"]
};

const MODE_META = {
  manual: {
    title: "Manual Home",
    destination: "Seongsu-ro 42-gil",
    playlist: "Manual focus",
    trackTitle: "Drive Mix",
    artist: "Elysia Biro",
    album: "flow",
    defaults: ["navigation", "call", "spotify", "android-auto"]
  },
  auto: {
    title: "Autonomous Home",
    destination: "Gangbyeonbuk-ro AV Zone",
    playlist: "Autonomous lounge",
    trackTitle: "Passenger Mode",
    artist: "Polestar experience",
    album: "ease",
    defaults: ["youtube", "chromium", "spotify", "android-auto"]
  }
};

const STORAGE_KEY = "polestar-hmi-home-v1";
let activeMode = "manual";
let currentDestinationLabel = MODE_META.manual.destination;
let longPressTimer = null;
let longPressTriggered = false;
let draftCards = [];
let selectedAppId = null;
let draggedWidgetIndex = null;
let naverMap = null;
let vehicleMarker = null;
let searchMarker = null;
let routePolyline = null;
let currentRoutes = [];
let selectedRouteIndex = 0;
let routePolylinesList = [];
let routeArrowMarkers = [];
let routeDurationBubbles = [];
let trafficLayerInstance = null;
let isTrafficLayerActive = false;
let naverMapReady = false;
let naverSdkPromise = null;
let navResultMarkers = [];
let selectedDestination = null;
let isResizingMap = false;
const navState = {
  view: "closed",
  query: "",
  results: [],
  selectedPlace: null,
  isNavigating: false,
  currentRoute: null
};

// Navigation simulation state
const navSimState = {
  guideIndex: 0,
  remainingMs: 0,
  remainingMeters: 0,
  intervalId: null,
  vehiclePath: [],
  vehiclePathIndex: 0,
  vehicleMoveIntervalId: null
};

let previewMapWidth = null;
let activeSettingsId = "quick";
const quickSettingState = Object.fromEntries(QUICK_SETTING_TILES.map((item) => [item.id, false]));
const lightSettingsState = {
  steeringLight: false,
  autoTurnSignal: false,
  autoEmergency: false,
  colorPickerOpen: false,
  cabinBrightness: 6,
  moodBrightness: 6
};
const assistSettingsState = {
  autoHold: false,
  surroundCamera: false,
  rearCamera: false
};
const seatSettingsState = {
  easyAccess: false,
  modalOpen: false
};
const climateSettingsState = {
  washer: false,
  tunnel: false,
  airQuality: false,
  overheat: false,
  autoDry: false,
  rearClimateLock: false
};
const launcherClimateState = {
  frontDefrost: false,
  rearDefrost: false,
  auto: true,
  driverSeatHeat: 0,
  passengerSeatHeat: 0,
  driverSeatVent: 0,
  passengerSeatVent: 0,
  recirculate: false,
  steeringHeat: false
};
const CLIMATE_TEMP_MIN = 17;
const CLIMATE_TEMP_MID = 22;
const CLIMATE_TEMP_MAX = 27;
const CLIMATE_TEMP_RANGE = CLIMATE_TEMP_MAX - CLIMATE_TEMP_MIN;
let activeClimateKnobZone = null;
const chargingSettingsState = {
  limit: 100,
  current: 48,
  display: "km"
};
const navigationSettingsState = {
  evPlanner: false,
  chargers: new Set(["hyundai", "gs", "kepco", "sk"])
};
const gleoSettingsState = {
  voice: 1,
  style: "calm",
  wakeWord: false
};
const displaySettingsState = {
  themeAuto: false,
  theme: "light",
  brightnessAuto: false,
  brightness: 6,
  hudSpeed: false,
  hudRoute: false,
  hudCruise: false,
  hudMedia: false
};
const soundSettingsState = {
  driveSound: "soft",
  balance: "center"
};
const profileSettingsState = {
  view: "main",
  addName: "",
  manageOpen: false
};
const convenienceSettingsState = {
  activeMode: null,
  modal: null,
  pin: "",
  toast: ""
};
const connectionSettingsState = {
  view: "main",
  scanning: false,
  securityOpen: false,
  security: "WPA/WPA2-개인",
  networkName: "",
  wifiPassword: "",
  hotspotPassword: "jz5tc96hcb8urrh",
  hotspotPasswordVisible: false,
  toggles: {
    bluetooth: false,
    wifi: false,
    hotspot: false,
    mobile: false,
    androidAuto: false,
    carplay: false
  }
};
const appSettingsState = {
  view: "main",
  permissions: createAppPermissionState(APP_SETTING_APPS)
};
let activeMediaHost = "apps";
let generalSettingsState = createGeneralSettingsState();
let vehicleInfoState = createVehicleInfoState();
const genericSettingsState = Object.fromEntries(
  Object.entries(GENERIC_SETTING_ROWS).map(([categoryId, rows]) => [
    categoryId,
    Object.fromEntries(rows.map((label, index) => [label, index % 2 === 0]))
  ])
);
let isDraggingChargeLimit = false;

const naverMapConfig = normalizeNaverMapConfig(window.NAVER_MAP_CONFIG);
const currentPosition = { ...naverMapConfig.center, name: "Current position" };

const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
const state = stored || {
  manual: [...MODE_META.manual.defaults],
  auto: [...MODE_META.auto.defaults],
  mapWidth: FIXED_DRIVING_VIEW_WIDTH,
  climateTemperatures: {
    left: CLIMATE_TEMP_MID,
    right: CLIMATE_TEMP_MID
  }
};
state.mapWidth = FIXED_DRIVING_VIEW_WIDTH;
state.climateTemperatures = {
  left: normalizeClimateTemperature(state.climateTemperatures?.left, CLIMATE_TEMP_MID),
  right: normalizeClimateTemperature(state.climateTemperatures?.right, CLIMATE_TEMP_MID)
};

function removeMusicCard(cards) {
  if (!Array.isArray(cards)) return [];
  const replacements = ["call", "energy", "message", "youtube", "navigation", "camera"];
  const next = [...cards].filter((id) => id !== "favorite-shortcuts" && id !== "favorite-apps");

  next.forEach((id, index) => {
    if (id !== "music") return;
    next[index] = replacements.find((replacement) => !next.includes(replacement)) || "call";
  });

  return next.slice(0, 4);
}

const HOME_CARD_REPLACEMENTS = {
  phone: "call",
  "nav-home": "navigation",
  video: "youtube",
  office: "chromium",
  climate: "vehicle",
  seat: "vehicle",
  "media-player": "music",
  "parking-camera": "camera",
  dashcam: "blackbox"
};

const HOME_CARD_APP_IDS = new Set(EDIT_APPS);

function normalizeHomeCardIds(cards) {
  const next = [];

  cards.forEach((id) => {
    const normalizedId = HOME_CARD_REPLACEMENTS[id] || id;
    if (!HOME_CARD_APP_IDS.has(normalizedId)) return;
    if (next.includes(normalizedId)) return;
    next.push(normalizedId);
  });

  return next;
}

function applyHomeCardDefaults(cards, defaults = []) {
  const next = normalizeHomeCardIds(removeMusicCard(cards));
  const fallbackCards = [
    ...defaults,
    "navigation",
    "call",
    "spotify",
    "youtube",
    "energy",
    "message",
    "vehicle",
    "chromium",
    "camera"
  ];

  fallbackCards.forEach((id) => {
    if (next.length >= 4) return;
    if (!next.includes(id)) next.push(id);
  });

  return next.slice(0, 4);
}

state.manual = applyHomeCardDefaults(state.manual, MODE_META.manual.defaults);
state.auto = applyHomeCardDefaults(state.auto, MODE_META.auto.defaults);
saveState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeClimateTemperature(value, fallback = CLIMATE_TEMP_MID) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  const steppedValue = Math.round(numericValue * 2) / 2;
  return Math.min(CLIMATE_TEMP_MAX, Math.max(CLIMATE_TEMP_MIN, steppedValue));
}

function formatClimateTemperature(value) {
  const normalizedValue = normalizeClimateTemperature(value);
  if (normalizedValue <= CLIMATE_TEMP_MIN) return "LO";
  if (normalizedValue >= CLIMATE_TEMP_MAX) return "HI";
  return normalizedValue.toFixed(1);
}

function climateTemperatureProgress(value) {
  const normalizedValue = normalizeClimateTemperature(value);
  return ((normalizedValue - CLIMATE_TEMP_MIN) / CLIMATE_TEMP_RANGE) * 100;
}

function renderClimateTemperatures(animDirection = null) {
  climateTempValues.forEach((element) => {
    const zone = element.dataset.climateTempValue;
    const value = normalizeClimateTemperature(state.climateTemperatures?.[zone], CLIMATE_TEMP_MID);
    const newText = formatClimateTemperature(value);
    
    if (element.textContent !== newText && animDirection) {
      const animClass = animDirection === "up" ? "temp-anim-up" : "temp-anim-down";
      element.classList.remove("temp-anim-up", "temp-anim-down");
      void element.offsetWidth; // force reflow
      element.classList.add(animClass);
      
      const onAnimEnd = () => {
        element.classList.remove(animClass);
        element.removeEventListener("animationend", onAnimEnd);
      };
      element.addEventListener("animationend", onAnimEnd);
    }
    
    element.textContent = newText;
    element.closest(".gnb-climate-readout")?.classList.toggle(
      "is-extreme-temp",
      value <= CLIMATE_TEMP_MIN || value >= CLIMATE_TEMP_MAX
    );
  });
  updateClimateKnob();
  renderGnbClimateControls();
}

function adjustClimateTemperature(zone, step) {
  if (!["left", "right"].includes(zone)) return;
  const currentValue = normalizeClimateTemperature(state.climateTemperatures[zone], 20);
  state.climateTemperatures[zone] = normalizeClimateTemperature(currentValue + step, currentValue);
  renderClimateTemperatures(step > 0 ? "up" : "down");
  saveState();
}

function closeClimateKnob() {
  activeClimateKnobZone = null;
  document.querySelector(".gnb-climate-popover")?.remove();
  climateKnobButtons.forEach((button) => {
    button.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
  });
}

function setClimateTemperatureFromProgress(zone, clientX) {
  const popover = document.querySelector(".gnb-climate-popover");
  const track = popover?.querySelector(".gnb-climate-slider-track");
  if (!track || !["left", "right"].includes(zone)) return;

  const rect = track.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  const rawValue = CLIMATE_TEMP_MIN + ratio * CLIMATE_TEMP_RANGE;
  state.climateTemperatures[zone] = normalizeClimateTemperature(rawValue, CLIMATE_TEMP_MID);
  renderClimateTemperatures();
  saveState();
}

function updateClimateKnob() {
  const popover = document.querySelector(".gnb-climate-popover");
  if (!popover || !activeClimateKnobZone) return;

  const value = normalizeClimateTemperature(state.climateTemperatures?.[activeClimateKnobZone], CLIMATE_TEMP_MID);
  const track = popover.querySelector(".gnb-climate-slider-track");
  popover.style.setProperty("--climate-progress", `${climateTemperatureProgress(value)}%`);
  popover.dataset.climateValue = formatClimateTemperature(value);
  track?.setAttribute("aria-valuenow", String(value));
  track?.setAttribute("aria-valuetext", formatClimateTemperature(value));
}

function openClimateKnob(zone, anchor) {
  if (!["left", "right"].includes(zone) || !anchor) return;

  const existingPopover = document.querySelector(".gnb-climate-popover");
  if (activeClimateKnobZone === zone && existingPopover) {
    closeClimateKnob();
    return;
  }

  closeClimateKnob();
  activeClimateKnobZone = zone;
  anchor.classList.add("is-open");
  anchor.setAttribute("aria-expanded", "true");

  const popover = document.createElement("div");
  popover.className = "gnb-climate-popover dropdown-enter";
  popover.dataset.climateZone = zone;
  popover.innerHTML = `
    <div class="gnb-climate-slider-track" role="slider" aria-label="${zone === "left" ? "운전석" : "동승석"} 온도" aria-valuemin="${CLIMATE_TEMP_MIN}" aria-valuemax="${CLIMATE_TEMP_MAX}" aria-valuenow="${normalizeClimateTemperature(state.climateTemperatures?.[zone], CLIMATE_TEMP_MID)}" tabindex="0">
      <span class="gnb-climate-slider-fill" aria-hidden="true"></span>
      <span class="gnb-climate-slider-knob" aria-hidden="true"></span>
    </div>
  `;
  document.querySelector(".dock")?.appendChild(popover);

  const dockRect = dock.getBoundingClientRect();
  const popoverWidth = 400;
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--canvas-scale")) || 1;
  // Center over the full < temp > group (prev step + readout + next step)
  // getBoundingClientRect returns viewport px → divide by scale for canvas px
  const prevStep = anchor.previousElementSibling;
  const nextStep = anchor.nextElementSibling;
  const groupCenterVP = ((prevStep || anchor).getBoundingClientRect().left + (nextStep || anchor).getBoundingClientRect().right) / 2;
  const groupCenterCanvas = (groupCenterVP - dockRect.left) / scale;
  const left = groupCenterCanvas - popoverWidth / 2;
  popover.style.left = `${left}px`;
  popover.style.bottom = "calc(100% - 16px)";
  updateClimateKnob();

  const track = popover.querySelector(".gnb-climate-slider-track");
  const commitPointer = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setClimateTemperatureFromProgress(zone, event.clientX);
  };

  track.addEventListener("pointerdown", (event) => {
    commitPointer(event);
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (!track.hasPointerCapture(event.pointerId)) return;
    commitPointer(event);
  });
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    adjustClimateTemperature(zone, event.key === "ArrowLeft" ? -0.5 : 0.5);
  });
}

function renderGnbClimateControls() {
  gnbClimateButtons.forEach((button) => {
    const action = button.dataset.gnbClimateAction;
    const isActive = Boolean(launcherClimateState[action]);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function functionById(id) {
  return appDisplayMetaById(id) || fallbackAppMeta();
}

function cardIcon(item, className = "card-icon") {
  const isBrand = [
    "navigation", "music", "message", "call", "bluetooth", "radio", 
    "energy", "blackbox", "camera", "app-market", "vehicle", "driving", 
    "android-auto", "carplay", "mirroring", "gleo-ai",
    "youtube", "spotify", "netflix", "chromium"
  ].includes(item.icon);
  const extraClass = isBrand ? " brand-icon" : "";
  return `<span class="${className}${extraClass} launcher-icon-${item.icon}" style="--card-color: ${item.color}" aria-hidden="true">${svgIcon(item.icon)}</span>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function appMetaById(id) {
  return launcherAppMetaById(id);
}

function renderRecentDockApps() {
  if (!gnbRecentApps) return;

  const recentSlots = recentDockApps
    .map(appMetaById)
    .filter(Boolean)
    .slice(0, RECENT_DOCK_LIMIT);

  const appButtons = Array.from({ length: RECENT_DOCK_LIMIT }, (_, index) => {
    const app = recentSlots[index];
    if (!app) {
      return '<span class="gnb-recent-button gnb-recent-empty" aria-hidden="true"></span>';
    }

    const isBouncing = app.appId === bouncingAppId;
    const bounceClass = isBouncing ? " gnb-icon-bounce" : "";

    const isBrand = [
      "navigation", "music", "message", "call", "bluetooth", "radio", 
      "energy", "blackbox", "camera", "app-market", "vehicle", "driving", 
      "android-auto", "carplay", "mirroring", "gleo-ai",
      "youtube", "spotify", "netflix", "chromium"
    ].includes(app.icon);
    const brandClass = isBrand ? " brand-icon" : "";

    return `
      <button class="gnb-recent-button${bounceClass}" type="button" data-app-id="${escapeHtml(app.appId)}" aria-label="${escapeHtml(app.title)} 실행">
        <span class="gnb-recent-icon${brandClass} launcher-icon-${escapeHtml(app.icon)}" style="--card-color: ${escapeHtml(app.color)}" aria-hidden="true">
          ${svgIcon(app.icon)}
        </span>
      </button>
    `;
  });

  gnbRecentApps.innerHTML = appButtons.join("");

  gnbRecentApps.querySelectorAll(".gnb-icon-bounce").forEach((btn) => {
    btn.addEventListener("animationend", () => {
      btn.classList.remove("gnb-icon-bounce");
      if (btn.dataset.appId === bouncingAppId) {
        bouncingAppId = null;
      }
    }, { once: true });
  });
}

function rememberRecentApp(id) {
  if (!appMetaById(id)) return;
  bouncingAppId = id;
  recentDockApps = [id, ...recentDockApps.filter((appId) => appId !== id)].slice(0, RECENT_DOCK_LIMIT);
  renderRecentDockApps();
}

function mediaArtwork(item, className, fallback, label = "") {
  if (item?.imageUrl) {
    return `<span class="${className} has-image" aria-hidden="true"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(label)}" loading="lazy" /></span>`;
  }
  return `<span class="${className}" aria-hidden="true">${fallback}</span>`;
}

function mediaFallbackIcon(meta) {
  if (activeMediaApp === "spotify") return svgIcon("spotify");
  if (activeMediaApp === "youtube") return svgIcon("youtube");
  return meta.type === "music" ? "♪" : "▶";
}

function mediaResultsForActiveApp() {
  const meta = MEDIA_APP_META[activeMediaApp];
  if (!meta) return [];
  if (Array.isArray(mediaSearchResults)) return mediaSearchResults;
  return searchMediaCatalog(MEDIA_CATALOG, mediaSearchQuery, meta.type);
}

function mediaIndexLetter(item, index) {
  const first = String(item?.title || "").trim().charAt(0).toUpperCase();
  if (/^[A-Z]$/.test(first)) return first;
  return index === 0 ? "A" : "";
}

function renderPleosMediaRows(results, selected, fallback) {
  if (mediaSearchLoading) {
    return `<div class="pleos-media-state">검색 중...</div>`;
  }

  if (mediaSearchError) {
    return `<div class="pleos-media-state">${escapeHtml(mediaSearchError)}</div>`;
  }

  if (!results.length) {
    return `<div class="pleos-media-state">검색어를 입력하고 돋보기를 누르세요.</div>`;
  }

  return results.map((item, index) => `
    <button class="pleos-media-row${selected?.id === item.id ? " selected" : ""}" type="button" data-media-id="${escapeHtml(item.id)}">
      <span class="pleos-media-letter">${escapeHtml(mediaIndexLetter(item, index))}</span>
      <span class="pleos-media-checkbox" aria-hidden="true"></span>
      ${mediaArtwork(item, "pleos-media-thumb", fallback, item.title)}
      <span class="pleos-media-copy">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.creator || item.description || "")}</small>
      </span>
    </button>
  `).join("");
}

function renderSpotifyTabletRows(results, selected, fallback) {
  if (mediaSearchLoading) return `<div class="spotify-tablet-state">검색 중...</div>`;
  if (mediaSearchError) return `<div class="spotify-tablet-state">${escapeHtml(mediaSearchError)}</div>`;
  if (!results.length) return `<div class="spotify-tablet-state">검색어를 입력하고 음악을 찾아보세요.</div>`;

  return results.map((item, index) => `
    <button class="spotify-tablet-result${selected?.id === item.id ? " selected" : ""}" type="button" data-media-id="${escapeHtml(item.id)}">
      <span class="spotify-result-index">${index + 1}</span>
      ${mediaArtwork(item, "spotify-result-art", fallback, item.title)}
      <span class="spotify-result-copy">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.creator)} · ${escapeHtml(item.description)}</small>
      </span>
      <span class="spotify-result-duration">${index % 2 ? "3:18" : "3:05"}</span>
    </button>
  `).join("");
}

function renderSpotifyTabletPanel(meta, results, selected, fallback) {
  const selectedItem = selected || results[0] || null;
  const musicRecommendations = MEDIA_CATALOG.filter((item) => item.type === "music" && !results.some((result) => result.id === item.id));
  const queueItems = [...results.filter(item => !selectedItem || item.id !== selectedItem.id), ...musicRecommendations].slice(0, 5);

  let mainContent = "";
  if (spotifyActiveTab === "home") {
    mainContent = `
      <div class="spotify-chip-row" aria-hidden="true">
        <span class="active">Music</span>
        <span>Podcasts</span>
        <span>Downloaded</span>
      </div>
      <div class="spotify-section-heading">
        <strong>${mediaSearchQuery ? "Search results" : "Recommended for this drive"}</strong>
        <span>${results.length ? `${results.length} tracks` : "Enter a keyword"}</span>
      </div>
      <div class="spotify-results-list" aria-live="polite">
        ${renderSpotifyTabletRows(results, selectedItem, fallback)}
      </div>
    `;
  } else if (spotifyActiveTab === "search") {
    mainContent = `
      <div class="spotify-search-tab">
        <div class="spotify-section-heading">
          <strong>Explore genres</strong>
          <span>Browse all categories</span>
        </div>
        <div class="spotify-genre-grid">
          <div class="spotify-genre-card pop"><span>Pop</span></div>
          <div class="spotify-genre-card kpop"><span>K-Pop</span></div>
          <div class="spotify-genre-card hiphop"><span>Hip-Hop</span></div>
          <div class="spotify-genre-card rock"><span>Rock</span></div>
          <div class="spotify-genre-card electronic"><span>Electronic</span></div>
          <div class="spotify-genre-card chill"><span>Chill</span></div>
        </div>
      </div>
    `;
  } else if (spotifyActiveTab === "library") {
    mainContent = `
      <div class="spotify-library-tab">
        <div class="spotify-section-heading">
          <strong>Your Library</strong>
          <span>Playlists and Albums</span>
        </div>
        <div class="spotify-library-list">
          <div class="spotify-library-item">
            <div class="spotify-library-art liked-songs">♥</div>
            <div class="spotify-library-info">
              <strong>Liked Songs</strong>
              <span>Playlist · 128 tracks</span>
            </div>
          </div>
          <div class="spotify-library-item">
            <div class="spotify-library-art mix">Mix</div>
            <div class="spotify-library-info">
              <strong>Chill EV Drive Mix</strong>
              <span>Playlist · HMI Studio</span>
            </div>
          </div>
          <div class="spotify-library-item">
            <div class="spotify-library-art album">AL</div>
            <div class="spotify-library-info">
              <strong>Midnight City Pop</strong>
              <span>Album · Night Tempo</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (spotifyActiveTab === "profile") {
    mainContent = `
      <div class="spotify-profile-tab">
        <div class="spotify-section-heading">
          <strong>User Profile</strong>
          <span>Connected Account</span>
        </div>
        <div class="spotify-profile-card">
          <div class="spotify-profile-avatar">P</div>
          <div class="spotify-profile-details">
            <strong>PJY Driver</strong>
            <span>pjy@connect-hmi.dev</span>
            <small>Spotify Premium Member</small>
          </div>
        </div>
        <div class="spotify-profile-settings">
          <div class="spotify-profile-setting-row">
            <span>Audio Quality</span>
            <strong>Very High (320kbps)</strong>
          </div>
          <div class="spotify-profile-setting-row">
            <span>Offline Storage</span>
            <strong>2.4 GB used of 64 GB</strong>
          </div>
          <div class="spotify-profile-setting-row">
            <span>Active Device</span>
            <strong>Connect-L (HMI Audio)</strong>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <section class="media-app-panel spotify-media-app spotify-tablet-app" aria-label="${meta.title}">
      <div class="landscape-drag-handle" aria-hidden="true"></div>
      <header class="media-tablet-topbar">
        <span class="spotify-brand-icon media-tablet-logo" aria-hidden="true">${svgIcon("spotify")}</span>
        <form class="media-search-form media-tablet-search" id="mediaSearchForm">
          <input id="mediaSearchInput" type="search" value="${escapeHtml(mediaSearchQuery)}" placeholder="${meta.placeholder}" autocomplete="off" />
          <button type="button" id="mediaSearchButton" aria-label="검색">${svgIcon("search-outline")}</button>
        </form>
      </header>
      <section class="spotify-tablet-shell">
        <nav class="spotify-tablet-rail" aria-label="Spotify navigation">
          <button type="button" class="${spotifyActiveTab === "home" ? "active" : ""}" data-spotify-tab="home">${svgIcon("home-outline")}<span>Home</span></button>
          <button type="button" class="${spotifyActiveTab === "search" ? "active" : ""}" data-spotify-tab="search">${svgIcon("search-outline")}<span>Search</span></button>
          <button type="button" class="${spotifyActiveTab === "library" ? "active" : ""}" data-spotify-tab="library">${svgIcon("library-outline")}<span>Library</span></button>
          <button type="button" class="${spotifyActiveTab === "profile" ? "active" : ""}" data-spotify-tab="profile">${svgIcon("profile-outline")}<span>Profile</span></button>
        </nav>
        <main class="spotify-browse-panel">
          ${mainContent}
        </main>
        <aside class="spotify-now-panel">
          ${mediaArtwork(selectedItem, "spotify-now-art", fallback, selectedItem?.title || meta.empty)}
          <div class="spotify-now-copy">
            <strong>${escapeHtml(selectedItem?.title || meta.empty)}</strong>
            <span>${escapeHtml(selectedItem?.creator || "Search Spotify")}</span>
            <p>${escapeHtml(selectedItem?.description || "검색 결과를 선택하면 재생 상세 화면이 표시됩니다.")}</p>
          </div>
          <div class="spotify-progress spotify-now-progress" aria-hidden="true">
            <span>0:42</span>
            <div><i></i></div>
            <span>3:24</span>
          </div>
          <div class="spotify-now-controls" aria-hidden="true">
            <button type="button" id="spotifyPrevBtn">${svgIcon("prev")}</button>
            <button type="button" class="primary" id="spotifyPlayPauseBtn">${svgIcon("pause")}</button>
            <button type="button" id="spotifyNextBtn">${svgIcon("next")}</button>
          </div>
          <div class="spotify-queue">
            <strong>Up next</strong>
            ${queueItems.map((item) => `
              <button type="button" data-media-id="${escapeHtml(item.id)}">
                ${mediaArtwork(item, "spotify-queue-art", fallback, item.title)}
                <span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.creator)}</small></span>
              </button>
            `).join("")}
          </div>
        </aside>
      </section>
    </section>
  `;
}

function renderYouTubeTabletPanel(meta, results, selected, fallback) {
  const isWatchMode = selectedMediaId !== null;
  const selectedItem = isWatchMode ? (results.find((item) => item.id === selectedMediaId) || MEDIA_CATALOG.find((item) => item.id === selectedMediaId) || results[0]) : null;
  
  const videoRecommendations = MEDIA_CATALOG.filter((item) => item.type === "video" && (!selectedItem || selectedItem.id !== item.id));
  const relatedItems = [...results.filter(item => !selectedItem || item.id !== selectedItem.id), ...videoRecommendations].slice(0, 8);

  let mainContent = "";
  if (isWatchMode && selectedItem) {
    mainContent = `
      <main class="youtube-watch-panel">
        <button type="button" class="youtube-back-button" data-youtube-back aria-label="목록으로">
          ${svgIcon("chevron-left")}
        </button>
        <section class="youtube-player-card">
          ${mediaArtwork(selectedItem, "youtube-player-thumb", fallback, selectedItem.title)}
          <div class="youtube-player-overlay" aria-hidden="true">
            <button type="button">${svgIcon("play")}</button>
            <div><i></i></div>
            <span>0:00 / 12:48</span>
          </div>
        </section>
        <section class="youtube-video-meta">
          <h2>${escapeHtml(selectedItem.title)}</h2>
          <div class="youtube-channel-row">
            <span class="youtube-channel-avatar">${escapeHtml((selectedItem.creator || "Y").charAt(0))}</span>
            <span><strong>${escapeHtml(selectedItem.creator || "YouTube")}</strong><small>128만 구독자</small></span>
            <button type="button">구독</button>
          </div>
          <div class="youtube-action-row" aria-hidden="true">
            <span>좋아요 2.4만</span>
            <span>공유</span>
            <span>저장</span>
            <span>오프라인</span>
          </div>
          <p>${escapeHtml(selectedItem.description || "영상 상세 정보가 제공되지 않습니다.")}</p>
        </section>
      </main>
    `;
  } else {
    // List Page
    if (youtubeActiveTab === "home") {
      mainContent = `
        <main class="youtube-list-panel">
          <div class="youtube-section-heading">
            <strong>${mediaSearchQuery ? "Search results" : "Recommended Videos"}</strong>
            <span>${results.length ? `${results.length} videos` : "Explore YouTube catalog"}</span>
          </div>
          <div class="youtube-grid">
            ${results.map((item) => `
              <div class="youtube-grid-card" data-media-id="${escapeHtml(item.id)}">
                <div class="youtube-card-thumb">
                  ${mediaArtwork(item, "youtube-related-thumb", fallback, item.title)}
                </div>
                <div class="youtube-card-info-row">
                  <span class="youtube-card-avatar">${escapeHtml((item.creator || "Y").charAt(0))}</span>
                  <div class="youtube-card-text">
                    <strong>${escapeHtml(item.title)}</strong>
                    <span>${escapeHtml(item.creator)} · 조회수 ${Math.max(12, item.title.length * 3)}만회</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </main>
      `;
    } else if (youtubeActiveTab === "shorts") {
      const SHORTS_ITEMS = [
        {
          id: "v1",
          title: "Testing autonomous parking! 🚗",
          creator: "EV Tech",
          views: "42만회",
          imageUrl: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=360&auto=format&fit=crop&q=80"
        },
        {
          id: "v2",
          title: "NewJeans Ditto HMI Remix 🎶",
          creator: "Music Lab",
          views: "102만회",
          imageUrl: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=360&auto=format&fit=crop&q=80"
        },
        {
          id: "v3",
          title: "Cockpit ambient lighting review",
          creator: "Car Vibe",
          views: "15만회",
          imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=360&auto=format&fit=crop&q=80"
        },
        {
          id: "v4",
          title: "EV charging in 10 seconds ⚡",
          creator: "Charge Lab",
          views: "73만회",
          imageUrl: "https://images.unsplash.com/photo-1563720223523-491ff04651de?w=360&auto=format&fit=crop&q=80"
        }
      ];
      mainContent = `
        <main class="youtube-list-panel">
          <div class="youtube-section-heading">
            <strong>Shorts</strong>
            <span>Trending vertical videos</span>
          </div>
          <div class="youtube-shorts-grid">
            ${SHORTS_ITEMS.map((item) => `
              <div class="youtube-shorts-card" data-media-id="${escapeHtml(item.id)}">
                <div class="youtube-shorts-thumb">
                  ${mediaArtwork(item, "youtube-related-thumb", fallback, item.title)}
                  <div class="youtube-shorts-overlay">▶ ${item.views}</div>
                </div>
                <div class="youtube-shorts-info">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.creator)}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </main>
      `;
    } else if (youtubeActiveTab === "subscriptions") {
      mainContent = `
        <main class="youtube-list-panel">
          <div class="youtube-section-heading">
            <strong>Subscriptions</strong>
            <span>Latest from channels you subscribe to</span>
          </div>
          <div class="youtube-subs-header">
            <div class="youtube-sub-channel"><span class="youtube-channel-avatar">D</span><span>Drive Lab</span></div>
            <div class="youtube-sub-channel"><span class="youtube-channel-avatar">H</span><span>HMI Studio</span></div>
            <div class="youtube-sub-channel"><span class="youtube-channel-avatar">C</span><span>Charge Route</span></div>
            <div class="youtube-sub-channel"><span class="youtube-channel-avatar">A</span><span>Ambient Motion</span></div>
          </div>
          <div class="youtube-grid">
            ${results.slice(0, 3).map((item) => `
              <div class="youtube-grid-card" data-media-id="${escapeHtml(item.id)}">
                <div class="youtube-card-thumb">
                  ${mediaArtwork(item, "youtube-related-thumb", fallback, item.title)}
                </div>
                <div class="youtube-card-info-row">
                  <span class="youtube-card-avatar">${escapeHtml((item.creator || "Y").charAt(0))}</span>
                  <div class="youtube-card-text">
                    <strong>${escapeHtml(item.title)}</strong>
                    <span>${escapeHtml(item.creator)} · 조회수 ${Math.max(12, item.title.length * 3)}만회</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </main>
      `;
    } else if (youtubeActiveTab === "you") {
      mainContent = `
        <main class="youtube-list-panel">
          <div class="youtube-section-heading">
            <strong>You</strong>
            <span>Your dashboard</span>
          </div>
          <div class="youtube-you-profile">
            <span class="youtube-channel-avatar large">P</span>
            <div class="youtube-you-info">
              <h2>PJY Driver</h2>
              <span>pjy@connect-ev.com · 구독 채널 12개</span>
            </div>
          </div>
          <div class="youtube-you-section">
            <h3>History</h3>
            <div class="youtube-you-grid">
              ${results.slice(0, 2).map((item) => `
                <div class="youtube-you-card" data-media-id="${escapeHtml(item.id)}">
                  <div class="youtube-card-thumb mini">
                    ${mediaArtwork(item, "youtube-related-thumb", fallback, item.title)}
                  </div>
                  <strong>${escapeHtml(item.title)}</strong>
                </div>
              `).join("")}
            </div>
          </div>
        </main>
      `;
    }
  }

  return `
    <section class="media-app-panel youtube-media-app youtube-tablet-app${isWatchMode ? " watch-mode" : " list-mode"}" aria-label="${meta.title}">
      <div class="landscape-drag-handle" aria-hidden="true"></div>
      <header class="media-tablet-topbar youtube-topbar">
        <span class="youtube-brand-icon media-tablet-logo" aria-hidden="true">${svgIcon("youtube")}</span>
        <form class="media-search-form media-tablet-search" id="mediaSearchForm">
          <input id="mediaSearchInput" type="search" value="${escapeHtml(mediaSearchQuery)}" placeholder="${meta.placeholder}" autocomplete="off" />
          <button type="button" id="mediaSearchButton" aria-label="검색">${svgIcon("search-outline")}</button>
        </form>
      </header>
      <section class="youtube-tablet-shell">
        <nav class="youtube-tablet-rail" aria-label="YouTube navigation">
          <button type="button" class="${youtubeActiveTab === "home" ? "active" : ""}" data-youtube-tab="home">${svgIcon("home-outline")}<span>Home</span></button>
          <button type="button" class="${youtubeActiveTab === "shorts" ? "active" : ""}" data-youtube-tab="shorts">${svgIcon("shorts-outline")}<span>Shorts</span></button>
          <button type="button" class="${youtubeActiveTab === "subscriptions" ? "active" : ""}" data-youtube-tab="subscriptions">${svgIcon("subscriptions-outline")}<span>Subscriptions</span></button>
          <button type="button" class="${youtubeActiveTab === "you" ? "active" : ""}" data-youtube-tab="you">${svgIcon("profile-outline")}<span>You</span></button>
        </nav>
        ${mainContent}
        <aside class="youtube-related-panel">
          <div class="youtube-filter-row" aria-hidden="true">
            <span class="active">All</span><span>Music</span><span>Recently uploaded</span>
          </div>
          <div class="youtube-related-list" aria-live="polite">
            ${mediaSearchLoading ? `<div class="media-empty">검색 중...</div>` : ""}
            ${mediaSearchError ? `<div class="media-empty">${escapeHtml(mediaSearchError)}</div>` : ""}
            ${!mediaSearchLoading && !mediaSearchError && relatedItems.map((item) => `
              <button class="youtube-related-item${selectedItem?.id === item.id ? " selected" : ""}" type="button" data-media-id="${escapeHtml(item.id)}">
                ${mediaArtwork(item, "youtube-related-thumb", fallback, item.title)}
                <span>
                  <strong>${escapeHtml(item.title)}</strong>
                  <small>${escapeHtml(item.creator)} · 조회수 ${Math.max(12, item.title.length * 3)}만회</small>
                </span>
              </button>
            `).join("")}
            ${!mediaSearchLoading && !mediaSearchError && !relatedItems.length ? `<div class="media-empty">${meta.empty}</div>` : ""}
          </div>
        </aside>
      </section>
    </section>
  `;
}

function renderNetflixDetailModal(selectedItem, fallback) {
  const isMyList = netflixMyList.includes(selectedItem.id);
  const isChamgyoyuk = selectedItem.id === "netflix-picked-0" || selectedItem.title.includes("참교육");
  
  const backdropUrl = isChamgyoyuk ? "./assets/netflix/detail_chamgyoyuk.jpg" : selectedItem.imageUrl;
  const ratingText = isChamgyoyuk ? "19+" : (selectedItem.rating || "15+");
  const yearText = isChamgyoyuk ? "2026" : "2024";
  const descText = isChamgyoyuk ? "무너진 교육 현장을 바로 잡겠다는 목표로 창설된 '교권보호국'. 특전사 출신 나화진(김무열)이 현장 감독관으로 합류하여 참교육을 시전한다. 저지른 만큼 되돌려 받고, 뼈저리게 깨달을 때까지!" : selectedItem.description;
  
  const castMarkup = isChamgyoyuk 
    ? `
      <div class="netflix-crew-item">
        <span class="label">출연:</span> <span class="val">김무열, 이성민, 진기주 ... <a href="#" class="more-link" onclick="event.preventDefault();">더 보기</a></span>
      </div>
      <div class="netflix-crew-item">
        <span class="label">크리에이터:</span> <span class="val">홍종찬, 이남규, 김다희</span>
      </div>
      <div class="netflix-crew-item">
        <span class="label">장르:</span> <span class="val">드라마, 코미디 시리즈</span>
      </div>
    `
    : `
      <div class="netflix-crew-item">
        <span class="label">출연:</span> <span class="val">${escapeHtml(selectedItem.creator || "출연진 정보 없음")}</span>
      </div>
      <div class="netflix-crew-item">
        <span class="label">장르:</span> <span class="val">${escapeHtml(selectedItem.genre || "드라마")}</span>
      </div>
    `;

  return `
    <div class="netflix-modal-backdrop" data-netflix-back>
      <div class="netflix-detail-modal" onclick="event.stopPropagation();">
        <div class="netflix-modal-banner" style="background-image: url('${escapeHtml(backdropUrl)}');">
          <button type="button" class="netflix-modal-close" data-netflix-back aria-label="닫기">✕</button>
          <button type="button" class="netflix-modal-audio-toggle" aria-label="음소거 설정">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="audio-icon">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          </button>
        </div>
        
        <div class="netflix-modal-body">
          <div class="netflix-modal-brand-row">
            <span class="netflix-brand-logo-text">NETFLIX</span>
          </div>
          <h2 class="netflix-modal-title">${escapeHtml(selectedItem.title)}</h2>
          
          <div class="netflix-modal-meta-row">
            <span class="netflix-meta-year">${escapeHtml(yearText)}</span>
            <span class="netflix-meta-rating-badge">${escapeHtml(ratingText)}</span>
            <span class="netflix-meta-type">리미티드 시리즈</span>
            <span class="netflix-meta-badge-rect">HD</span>
            <span class="netflix-meta-badge-ad">AD))</span>
            <span class="netflix-meta-speech-bubble">💬</span>
          </div>
          
          <div class="netflix-modal-rank-row">
            <div class="netflix-modal-rank-badge">TOP 10</div>
            <span class="netflix-modal-rank-text">오늘 시리즈 순위 1위</span>
          </div>
          
          <div class="netflix-modal-action-buttons">
            <button type="button" class="netflix-modal-btn-play" data-netflix-play data-netflix-hero-id="${escapeHtml(selectedItem.id)}">
              ${svgIcon("play")} 재생
            </button>
            <button type="button" class="netflix-modal-btn-save">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="download-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              저장
            </button>
          </div>
          
          <div class="netflix-modal-content-grid">
            <div class="netflix-modal-desc-col">
              <p class="netflix-modal-description">${escapeHtml(descText)}</p>
            </div>
            <div class="netflix-modal-crew-col">
              ${castMarkup}
            </div>
          </div>
          
          <div class="netflix-modal-icon-actions">
            <button type="button" class="netflix-modal-icon-btn ${isMyList ? "active" : ""}" data-netflix-mylist-toggle="${escapeHtml(selectedItem.id)}">
              <span class="icon-span">
                ${isMyList 
                  ? `<svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` 
                  : `<svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
                }
              </span>
              <span class="text-span">내가 찜한 리스트</span>
            </button>
            <button type="button" class="netflix-modal-icon-btn">
              <span class="icon-span">
                <svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </span>
              <span class="text-span">평가</span>
            </button>
            <button type="button" class="netflix-modal-icon-btn">
              <span class="icon-span">
                <svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </span>
              <span class="text-span">공유</span>
            </button>
          </div>
          
          <div class="netflix-modal-tabs">
            <button type="button" class="netflix-modal-tab-btn active">회차</button>
            <button type="button" class="netflix-modal-tab-btn">비슷한 콘텐츠</button>
            <button type="button" class="netflix-modal-tab-btn">예고편 및 다른 영상</button>
          </div>
          
          <div class="netflix-modal-episodes-list">
            <div class="netflix-modal-episodes-header">
              <span>리미티드 시리즈</span>
              <button type="button" class="info-btn">ⓘ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNetflixTabletPanel(meta, results, selected, fallback) {
  const selectedItem = selectedMediaId ? MEDIA_CATALOG.find(item => item.id === selectedMediaId) : null;

  // 1. Video Player View
  if (netflixPlaying && selectedItem) {
    return `
      <section class="netflix-player-view">
        <div class="netflix-player-backdrop" style="background-image: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('${escapeHtml(selectedItem.imageUrl)}')"></div>
        <header class="netflix-player-header">
          <button type="button" class="netflix-player-back" data-netflix-player-back aria-label="이전 화면으로">
            ${svgIcon("chevron-left")}
          </button>
          <div class="netflix-player-title-info">
            <h2>${escapeHtml(selectedItem.title)}</h2>
            <span>${selectedItem.category === "TV-Shows" ? "시즌 1: 1화 재생 중" : "영화 감상 중"}</span>
          </div>
        </header>
        <div class="netflix-player-center">
          <button type="button" class="netflix-player-control-btn prev-10" aria-label="10초 뒤로">${svgIcon("prev")}</button>
          <button type="button" class="netflix-player-control-btn play-pause primary" aria-label="일시 정지">${svgIcon("pause")}</button>
          <button type="button" class="netflix-player-control-btn next-10" aria-label="10초 앞으로">${svgIcon("next")}</button>
        </div>
        <footer class="netflix-player-footer">
          <div class="netflix-player-scrubber-row">
            <span>04:12</span>
            <div class="netflix-player-scrubber-bar">
              <div class="netflix-player-scrubber-fill" style="width: 25%"></div>
              <div class="netflix-player-scrubber-handle" style="left: 25%"></div>
            </div>
            <span>${escapeHtml(selectedItem.duration)}</span>
          </div>
          <div class="netflix-player-actions-row">
            <div class="netflix-player-actions-left">
              <button type="button" class="netflix-action-btn">${svgIcon("mute")}</button>
              <span class="netflix-volume-bar"><div><i style="width: 60%"></i></div></span>
            </div>
            <div class="netflix-player-actions-right">
              <span class="netflix-badge">UHD</span>
              <span class="netflix-badge">5.1 CH</span>
            </div>
          </div>
        </footer>
      </section>
    `;
  }

  // 2. Compute Modal overlay markup if selection exists
  let modalMarkup = "";
  if (selectedItem) {
    modalMarkup = renderNetflixDetailModal(selectedItem, fallback);
  }

  // 3. Browse Feed (Catalog) View
  let mainContent = "";

  if (mediaSearchQuery.trim() !== "") {
    mainContent = `
      <div class="netflix-scrollable-content">
        <div class="netflix-section-heading">
          <h2>"${escapeHtml(mediaSearchQuery)}" 검색 결과</h2>
          <span>${results.length}개의 작품</span>
        </div>
        <div class="netflix-cards-grid">
          ${results.map(item => {
            const isGame = item.isGame;
            return `
              <div class="${isGame ? "netflix-game-card" : "netflix-card"}" data-media-id="${escapeHtml(item.id)}">
                <div class="${isGame ? "netflix-game-art-wrapper" : "netflix-card-thumb-wrapper"}">
                  ${mediaArtwork(item, isGame ? "netflix-game-art" : "netflix-card-thumb", fallback, item.title)}
                  <span class="netflix-card-badge">${escapeHtml(item.rating)}</span>
                </div>
                <div class="netflix-card-info">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.genre ? item.genre.split(" / ")[0] : "콘텐츠")}</span>
                </div>
              </div>
            `;
          }).join("")}
          ${!results.length ? `<div class="netflix-empty-state">검색 결과가 없습니다. 다른 검색어를 입력해 보세요.</div>` : ""}
        </div>
      </div>
    `;
  } else {
    // Sub-navigation buttons
    const subNavMarkup = `
      <div class="netflix-sub-nav">
        <button type="button" class="netflix-sub-nav-btn ${netflixActiveTab === "tv-shows" ? "active" : ""}" data-netflix-sub-tab="tv-shows">시리즈</button>
        <button type="button" class="netflix-sub-nav-btn ${netflixActiveTab === "movies" ? "active" : ""}" data-netflix-sub-tab="movies">영화</button>
        <button type="button" class="netflix-sub-nav-btn ${netflixActiveTab === "new-hot" ? "active" : ""}" data-netflix-sub-tab="new-hot">NEW & HOT</button>
        <button type="button" class="netflix-sub-nav-btn dropdown" data-netflix-sub-tab="categories">카테고리 <span class="arrow">▼</span></button>
      </div>
    `;

    // Helper to render regular cards
    const renderCard = (itemId) => {
      const item = MEDIA_CATALOG.find(i => i.id === itemId);
      if (!item) return "";
      return `
        <div class="netflix-card-regular" data-media-id="${escapeHtml(item.id)}">
          <div class="netflix-card-art-wrapper">
            ${mediaArtwork(item, "netflix-card-art", fallback, item.title)}
            ${netflixCardBadge(item)}
          </div>
        </div>
      `;
    };

    // Helper for cards badge
    function netflixCardBadge(item) {
      if (!item.badge) return "";
      if (item.badge === "최신 등록") {
        return `<div class="netflix-card-badge-red">최신 등록</div>`;
      }
      if (item.badge === "신규 에피소드") {
        return `
          <div class="netflix-card-badge-pill">
            <span class="pill-top">새로운 에피소드</span>
            <span class="pill-bottom">지금 시청하기</span>
          </div>
        `;
      }
      return `<div class="netflix-card-badge-generic">${escapeHtml(item.badge)}</div>`;
    }

    if (netflixActiveTab === "home") {
      const heroItemId = "netflix-picked-0"; // 참교육
      const heroItem = MEDIA_CATALOG.find(i => i.id === heroItemId) || results[0];

      // Shelf lists by screenshot card definitions
      const pickedRow = ["netflix-picked-0", "netflix-picked-1", "netflix-picked-2", "netflix-picked-3", "netflix-picked-4", "netflix-picked-5", "netflix-picked-6", "netflix-picked-7"];
      const kdramaRow = ["netflix-kdrama-0", "netflix-kdrama-1", "netflix-kdrama-2", "netflix-kdrama-3", "netflix-kdrama-4", "netflix-kdrama-5", "netflix-kdrama-6", "netflix-kdrama-7"];
      const animeRow = ["netflix-anime-0", "netflix-anime-1", "netflix-anime-2", "netflix-anime-3", "netflix-anime-4", "netflix-anime-5", "netflix-anime-6", "netflix-anime-7"];
      const mylistRow = ["netflix-mylist-0", "netflix-mylist-1", "netflix-mylist-2", "netflix-mylist-3", "netflix-mylist-4", "netflix-mylist-5", "netflix-mylist-6", "netflix-mylist-7"];
      const realityRow = ["netflix-reality-0", "netflix-reality-1", "netflix-reality-2", "netflix-reality-3", "netflix-reality-4", "netflix-reality-5", "netflix-reality-6", "netflix-reality-7"];
      const acclaimedRow = ["netflix-acclaimed-0", "netflix-acclaimed-1", "netflix-acclaimed-2", "netflix-acclaimed-3", "netflix-acclaimed-4", "netflix-acclaimed-5", "netflix-acclaimed-6", "netflix-acclaimed-7"];
      const top10Row = ["netflix-top10-0", "netflix-top10-1", "netflix-top10-2", "netflix-top10-3", "netflix-top10-4"];
      const gamesRow = ["netflix-game-0", "netflix-game-1", "netflix-game-2", "netflix-game-3", "netflix-game-4", "netflix-game-5", "netflix-game-6", "netflix-game-7"];
      const newRow = ["netflix-new-0", "netflix-new-1", "netflix-new-2", "netflix-new-3", "netflix-new-4", "netflix-new-5", "netflix-new-6", "netflix-new-7"];

      mainContent = `
        <div class="netflix-scrollable-content">
          ${subNavMarkup}
          
          <!-- Hero Banner (참교육 메인 배너) -->
          <div class="netflix-hero-banner" style="background-image: linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0.4) 40%, rgba(20,20,20,0) 80%), url('./assets/netflix/hero_banner.jpg')">
            <div class="netflix-hero-overlay">
              <span class="netflix-hero-badge">N SERIES</span>
              <h1 class="netflix-hero-title">${escapeHtml(heroItem.title)}</h1>
              <p class="netflix-hero-desc">지금 리미티드 시리즈를 시청하세요</p>
              <div class="netflix-hero-actions">
                <button type="button" class="netflix-btn-play" data-netflix-play data-netflix-hero-id="${heroItem.id}">
                  ${svgIcon("play")} <span>재생</span>
                </button>
                <button type="button" class="netflix-btn-mylist-toggle" data-netflix-mylist-toggle="${heroItem.id}">
                  ＋ <span>내가 찜한 리스트</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Shelf 1: 엄선한 오늘의 콘텐츠 -->
          <div class="netflix-shelf">
            <h3>회원님을 위해 엄선한 오늘의 콘텐츠</h3>
            <div class="netflix-shelf-row scroll-x">
              ${pickedRow.map(id => renderCard(id)).join("")}
            </div>
          </div>

          <!-- Shelf 2: 영어 자막이 제공되는 한국 드라마 -->
          <div class="netflix-shelf">
            <h3>영어 자막이 제공되는 한국 드라마</h3>
            <div class="netflix-shelf-row scroll-x">
              ${kdramaRow.map(id => renderCard(id)).join("")}
            </div>
          </div>

          <!-- Shelf 3: 애니 -->
          <div class="netflix-shelf">
            <h3>애니</h3>
            <div class="netflix-shelf-row scroll-x">
              ${animeRow.map(id => renderCard(id)).join("")}
            </div>
          </div>

          <!-- Shelf 4: 내가 찜한 리스트 -->
          <div class="netflix-shelf">
            <div class="netflix-shelf-title-row">
              <h3>내가 찜한 리스트</h3>
              <button type="button" class="netflix-see-all-btn" data-netflix-tab="my-netflix">모두 보기 &gt;</button>
            </div>
            <div class="netflix-shelf-row scroll-x">
              ${mylistRow.map(id => renderCard(id)).join("")}
            </div>
          </div>

          <!-- Shelf 5: 한국 리얼리티, 버라이어티 & 토크쇼 -->
          <div class="netflix-shelf">
            <h3>한국 리얼리티, 버라이어티 & 토크쇼</h3>
            <div class="netflix-shelf-row scroll-x">
              ${realityRow.map(id => renderCard(id)).join("")}
            </div>
          </div>

          <!-- Shelf 6: 작품성을 인정받은 시리즈 -->
          <div class="netflix-shelf">
            <h3>작품성을 인정받은 시리즈</h3>
            <div class="netflix-shelf-row scroll-x">
              ${acclaimedRow.map(id => renderCard(id)).join("")}
            </div>
          </div>

          <!-- Shelf 7: TOP 10 시리즈 -->
          <div class="netflix-shelf">
            <h3>오늘 대한민국이 TOP 10 시리즈</h3>
            <div class="netflix-shelf-row scroll-x netflix-top10-row">
              ${top10Row.map((id, idx) => {
                const item = MEDIA_CATALOG.find(i => i.id === id);
                if (!item) return "";
                return `
                  <div class="netflix-top10-card" data-media-id="${escapeHtml(item.id)}">
                    <div class="netflix-top10-rank-num">${idx + 1}</div>
                    <div class="netflix-top10-art-wrapper">
                      ${mediaArtwork(item, "netflix-poster-art", fallback, item.title)}
                      ${netflixCardBadge(item)}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Shelf 8: 모바일 게임 (Square) -->
          <div class="netflix-shelf">
            <div class="netflix-shelf-title-row">
              <h3>모바일 게임</h3>
              <button type="button" class="netflix-see-all-btn" data-netflix-tab="my-netflix">내가 찜한 리스트 &gt;</button>
            </div>
            <div class="netflix-shelf-row scroll-x netflix-games-row">
              ${gamesRow.map(id => {
                const item = MEDIA_CATALOG.find(i => i.id === id);
                if (!item) return "";
                return `
                  <div class="netflix-game-card" data-media-id="${escapeHtml(item.id)}">
                    <div class="netflix-game-art-wrapper">
                      ${mediaArtwork(item, "netflix-game-art", fallback, item.title)}
                      ${item.badge ? `<div class="netflix-game-badge">새 업데이트</div>` : ""}
                    </div>
                    <div class="netflix-game-info">
                      <strong class="netflix-game-title">${escapeHtml(item.title)}</strong>
                      <span class="netflix-game-genre">${escapeHtml(item.genre ? item.genre.split(" / ")[1] || item.genre.split(" / ")[0] : "게임")}</span>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Shelf 9: 새로 올라온 콘텐츠 -->
          <div class="netflix-shelf">
            <h3>넷플릭스에 새로 올라온 콘텐츠</h3>
            <div class="netflix-shelf-row scroll-x netflix-new-row">
              ${newRow.map(id => {
                const item = MEDIA_CATALOG.find(i => i.id === id);
                if (!item) return "";
                return `
                  <div class="netflix-card-new" data-media-id="${escapeHtml(item.id)}">
                    <div class="netflix-new-art-wrapper">
                      ${mediaArtwork(item, "netflix-new-art", fallback, item.title)}
                      ${netflixCardBadge(item)}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

        </div>
      `;
    } else if (netflixActiveTab === "tv-shows" || netflixActiveTab === "movies") {
      const isTv = netflixActiveTab === "tv-shows";
      const subNavTitle = isTv ? "시리즈" : "영화";
      
      const filteredRow1 = isTv 
        ? ["netflix-kdrama-0", "netflix-kdrama-1", "netflix-kdrama-2", "netflix-kdrama-3", "netflix-kdrama-4", "netflix-kdrama-5", "netflix-kdrama-6", "netflix-kdrama-7"]
        : ["netflix-new-3", "netflix-new-4", "netflix-new-7"];
      const filteredRow2 = isTv
        ? ["netflix-anime-0", "netflix-anime-1", "netflix-anime-2", "netflix-anime-3", "netflix-anime-4", "netflix-anime-5", "netflix-anime-6", "netflix-anime-7"]
        : ["netflix-game-2", "netflix-picked-3", "netflix-mylist-3"];

      mainContent = `
        <div class="netflix-scrollable-content">
          ${subNavMarkup}
          
          <div class="netflix-category-header">
            <h2>${subNavTitle}</h2>
          </div>

          <div class="netflix-shelf">
            <h3>인기 콘텐츠</h3>
            <div class="netflix-shelf-row scroll-x">
              ${filteredRow1.map(id => renderCard(id)).join("")}
            </div>
          </div>

          <div class="netflix-shelf">
            <h3>새로 올라온 콘텐츠</h3>
            <div class="netflix-shelf-row scroll-x">
              ${filteredRow2.map(id => renderCard(id)).join("")}
            </div>
          </div>
        </div>
      `;
    } else if (netflixActiveTab === "new-hot") {
      const upcoming = [
        {
          id: "netflix-picked-0",
          title: "참교육 시즌 2",
          date: "12월 26일 공개 예정",
          month: "12월",
          day: "26",
          description: "선 넘는 학생들과 방관하는 교사들. 붕괴된 교권을 바로잡기 위해 교육부 산하 교권보호국 소속 나화진의 참교육이 다시 찾아온다.",
          genre: "K-웹툰 / 액션 / 학원물",
          imageUrl: "./assets/netflix/img3_new_col0.jpg"
        },
        {
          id: "netflix-acclaimed-4",
          title: "선재 업고 튀어 스페셜",
          date: "다음 달 공개 예정",
          month: "7월",
          day: "15",
          description: "류선재와 임솔의 못다 한 청춘 이야기. 그들의 가장 찬란하고 아름다웠던 시간들이 펼쳐진다.",
          genre: "K-Drama / 타임슬립 / 판타지 / 로맨스",
          imageUrl: "./assets/netflix/img3_new_col1.jpg"
        },
        {
          id: "netflix-reality-4",
          title: "최후의 인류 시즌 2",
          date: "곧 공개 예정",
          month: "8월",
          day: "01",
          description: "극단적인 기후 변화 속에서 생존하기 위한 인류 최후의 기록과 사투를 그려낸 본격 환경 예능 다큐멘터리.",
          genre: "다큐멘터리 / 생존 / 사회",
          imageUrl: "./assets/netflix/img3_new_col2.jpg"
        }
      ];

      mainContent = `
        <div class="netflix-scrollable-content new-hot-page">
          ${subNavMarkup}
          <div class="netflix-new-hot-timeline">
            ${upcoming.map(item => `
              <div class="netflix-new-hot-row" data-media-id="${item.id}">
                <div class="netflix-date-column">
                  <span class="new-hot-month">${item.month}</span>
                  <span class="new-hot-day">${item.day}</span>
                </div>
                <div class="netflix-new-hot-card">
                  <div class="new-hot-image-wrapper" style="background-image: url('${escapeHtml(item.imageUrl)}')"></div>
                  <div class="new-hot-details">
                    <div class="new-hot-header-row">
                      <h2>${escapeHtml(item.title)}</h2>
                      <div class="new-hot-action-buttons">
                        <button type="button" class="btn-remind">🔔 종소리</button>
                      </div>
                    </div>
                    <span class="new-hot-release-date">${escapeHtml(item.date)}</span>
                    <p class="new-hot-desc">${escapeHtml(item.description)}</p>
                    <span class="new-hot-genre">${escapeHtml(item.genre)}</span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    } else if (netflixActiveTab === "my-netflix") {
      const myListItems = MEDIA_CATALOG.filter(item => item.type === "netflix" && netflixMyList.includes(item.id));

      mainContent = `
        <div class="netflix-scrollable-content my-netflix-page">
          <div class="my-netflix-profile-section">
            <span class="my-netflix-avatar-large">${svgIcon("netflix-profile")}</span>
            <div class="my-netflix-profile-info">
              <h2>지석</h2>
              <span>프로필 변경 및 계정 설정</span>
            </div>
          </div>

          <div class="netflix-shelf">
            <h3>내가 찜한 콘텐츠</h3>
            <div class="netflix-cards-grid">
              ${myListItems.map(item => `
                <div class="netflix-card" data-media-id="${escapeHtml(item.id)}">
                  <div class="netflix-card-thumb-wrapper">
                    ${mediaArtwork(item, "netflix-card-thumb", fallback, item.title)}
                    <span class="netflix-card-badge">${escapeHtml(item.rating)}</span>
                  </div>
                  <div class="netflix-card-info">
                    <strong>${escapeHtml(item.title)}</strong>
                    <span>${escapeHtml(item.genre ? item.genre.split(" / ")[0] : "드라마")}</span>
                  </div>
                </div>
              `).join("")}
              ${!myListItems.length ? `<div class="netflix-empty-state">찜한 콘텐츠가 비어 있습니다.</div>` : ""}
            </div>
          </div>
        </div>
      `;
    }
  }

  // Layout wrapper with 92px menu rail and search topbar
  return `
    <div class="netflix-tablet-shell">
      <!-- Sidebar Navigation Rail (92px column) -->
      <aside class="netflix-tablet-rail">
        <span class="netflix-rail-logo" aria-hidden="true">${svgIcon("netflix")}</span>

        <nav class="netflix-rail-nav">
          <button type="button" class="${netflixActiveTab === "home" ? "active" : ""}" data-netflix-tab="home" aria-label="홈">
            ${svgIcon("home-outline")}
            <span>홈</span>
          </button>
          <button type="button" class="${netflixActiveTab === "tv-shows" ? "active" : ""}" data-netflix-tab="tv-shows" aria-label="TV 프로그램">
            ${svgIcon("netflix-tv")}
            <span>TV 프로그램</span>
          </button>
          <button type="button" class="${netflixActiveTab === "movies" ? "active" : ""}" data-netflix-tab="movies" aria-label="영화">
            ${svgIcon("netflix-movies")}
            <span>영화</span>
          </button>
          <button type="button" class="${netflixActiveTab === "new-hot" ? "active" : ""}" data-netflix-tab="new-hot" aria-label="New & Hot">
            ${svgIcon("netflix-hot")}
            <span>New & Hot</span>
          </button>
          <button type="button" class="${netflixActiveTab === "my-netflix" ? "active" : ""}" data-netflix-tab="my-netflix" aria-label="나의 넷플릭스">
            <span class="netflix-rail-avatar-icon">${svgIcon("netflix-profile")}</span>
            <span>나의 넷플릭스</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content and Topbar -->
      <section class="netflix-main-container">
        <div class="netflix-panel-content">
          <!-- Custom sticky Netflix top header -->
          <header class="netflix-top-bar" id="netflixTopBar">
            <div class="netflix-top-bar-left">
              <svg class="netflix-top-bar-logo" viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Netflix">
                <path d="M 52 32 H 66 V 110 Q 59 110 52 113 Z" fill="#E50914"/>
                <path d="M 78 32 H 92 V 113 Q 85 110 78 110 Z" fill="#E50914"/>
                <path d="M 52 32 H 66 L 92 113 Q 85 110 78 110 Z" fill="#B81D24"/>
              </svg>
              <span class="netflix-top-bar-title">홈</span>
            </div>
            <div class="netflix-top-bar-right">
              <!-- Search Toggle Button -->
              <button type="button" class="netflix-top-bar-btn" id="netflixSearchToggle" aria-label="검색">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
              <!-- Download Button -->
              <button type="button" class="netflix-top-bar-btn" aria-label="오프라인 저장 콘텐츠">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <!-- Notification Bell Button -->
              <button type="button" class="netflix-top-bar-btn netflix-bell-btn" aria-label="알림">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="netflix-top-bar-badge">4</span>
              </button>
            </div>
          </header>

          <!-- Collapsible Search Form Overlay -->
          <div class="netflix-search-overlay" id="netflixSearchOverlay" style="display: ${mediaSearchQuery.trim() !== '' ? 'block' : 'none'};">
            <form class="netflix-overlay-search-form" id="mediaSearchForm" onsubmit="event.preventDefault();">
              <input id="mediaSearchInput" type="search" value="${escapeHtml(mediaSearchQuery)}" placeholder="${meta.placeholder}" autocomplete="off" />
              <button type="button" id="mediaSearchButton" aria-label="검색">${svgIcon("search-outline")}</button>
            </form>
          </div>

          ${mainContent}
        </div>
      </section>
      ${modalMarkup}
    </div>
  `;
}

async function fetchExternalMediaResults() {
  const meta = MEDIA_APP_META[activeMediaApp];
  const query = mediaSearchQuery.trim();
  if (!meta?.provider || !query) {
    mediaSearchResults = null;
    mediaSearchError = "";
    return;
  }

  mediaSearchLoading = true;
  mediaSearchError = "";
  renderMediaApp();

  try {
    const response = await fetch(`/api/media-search?provider=${encodeURIComponent(meta.provider)}&query=${encodeURIComponent(query)}`);
    const responseText = await response.text();
    let payload;
    try {
      payload = JSON.parse(responseText);
    } catch {
      throw new Error("검색 서비스를 사용할 수 없습니다.");
    }
    if (!response.ok) throw new Error(payload.message || "검색에 실패했습니다.");
    if (payload.ok === false) throw new Error(payload.message || "검색에 실패했습니다.");
    const externalResults = Array.isArray(payload.items) ? payload.items : [];
    mediaSearchResults = externalResults.length
      ? externalResults
      : searchMediaCatalogWithFallback(MEDIA_CATALOG, query, meta.type);
    mediaSearchError = mediaSearchResults.length ? "" : "검색 결과가 없습니다.";
  } catch (error) {
    const fallbackResults = searchMediaCatalogWithFallback(MEDIA_CATALOG, query, meta.type);
    mediaSearchResults = fallbackResults;
    mediaSearchError = fallbackResults.length ? "" : (error.message || "검색에 실패했습니다.");
  } finally {
    mediaSearchLoading = false;
    selectedMediaId = null;
    renderMediaApp();
    mediaAppHost().querySelector("#mediaSearchInput")?.focus();
  }
}

function mediaAppHost() {
  return activeMediaHost === "landscape" ? shortcutGrid : appsLayer;
}

function restoreDefaultSettingsRoot() {
  settingsNav = defaultSettingsNav;
  settingsDetail = defaultSettingsDetail;
}

function closeLandscapeApp({ renderHomeScreen = true } = {}) {
  restoreDefaultSettingsRoot();
  activeMediaApp = null;
  activeMediaHost = "apps";
  mediaSearchQuery = "";
  selectedMediaId = null;
  mediaSearchResults = null;
  mediaSearchLoading = false;
  mediaSearchError = "";
  shortcutGrid.classList.remove("media-landscape-host");
  appsLayer.classList.remove("media-app-open");
  appsLayer.hidden = true;
  vehicleSettingsLayer.hidden = true;
  workspace.hidden = false;
  shortcutGrid.innerHTML = "";
  setActiveSurface("home");
  if (renderHomeScreen) renderHome();
}

function bindLandscapeDragToClose(container) {
  if (!container || container.dataset.landscapeDragBound === "true") return;
  const handle = container.querySelector(".landscape-drag-handle, .radio-drag-handle, .phone-drag-handle");
  if (!handle) return;
  handle.classList.add("landscape-drag-handle");
  container.dataset.landscapeDragBound = "true";

  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let rafId = null;
  const closeThreshold = 120;

  const startDrag = (clientY) => {
    if (isDragging) return;
    isDragging = true;
    startY = clientY;
    currentY = 0;
    container.style.transition = "none";
    container.style.willChange = "transform, opacity";
    container.classList.add("is-dragging-landscape");
  };

  const moveDrag = (clientY) => {
    if (!isDragging) return;
    currentY = Math.max(0, clientY - startY);
    
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
      if (!isDragging) return;
      container.style.transform = `translateY(${currentY}px)`;
      container.style.opacity = String(Math.max(0.35, 1 - currentY / 360));
    });
  };

  const resetContainerStyle = () => {
    container.style.willChange = "";
    container.style.transition = "";
    container.style.transform = "";
    container.style.opacity = "";
    container.style.animation = "";
  };

  const finishDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    container.classList.remove("is-dragging-landscape");

    if (currentY > closeThreshold) {
      // --- 닫기 경로 ---
      // (Bug 1 fix) 스타일 정리를 closeLandscapeApp() 호출 이전에 미리 수행한다.
      // try-catch 안에 closeLandscapeApp()을 넣으면 내부 에러가 조용히 삼켜져
      // renderHome()이 실행되지 않아 홈 화면이 나타나지 않는 현상이 생긴다.
      container.style.transition = "transform 220ms ease, opacity 220ms ease";
      container.style.transform = "translateY(100%)";
      container.style.opacity = "0";
      window.setTimeout(() => {
        resetContainerStyle();
        closeLandscapeApp();
      }, 220);
    } else {
      // --- 복귀 경로 ---
      // (Bug 2 fix) 인라인 transition + transform 제거를 고정 240ms setTimeout 대신
      // transitionend 이벤트로 처리한다. 고정 타이머가 전환 애니메이션 완료 전에 실행되면
      // 브라우저가 CSS 기본 animation(scale-up-center, fill-mode:both)을 재활성화해
      // 패널이 갑자기 scale(0.5)에서 튀어오르는 끊김 현상이 발생한다.
      // animation: none 인라인 선언으로 scale-up-center 재발동을 완전히 차단한다.
      container.style.animation = "none";
      container.style.transition = "transform 220ms ease, opacity 220ms ease";
      container.style.transform = "translateY(0)";
      container.style.opacity = "1";

      const onTransitionEnd = () => resetContainerStyle();
      container.addEventListener("transitionend", onTransitionEnd, { once: true });

      // transitionend가 발화하지 않는 예외 상황을 대비한 안전망 타이머
      window.setTimeout(() => {
        container.removeEventListener("transitionend", onTransitionEnd);
        resetContainerStyle();
      }, 350);
    }
    currentY = 0;
  };

  const cancelDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    container.classList.remove("is-dragging-landscape");
    resetContainerStyle();
    currentY = 0;
  };

  handle.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    startDrag(event.clientY);
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort across environments.
    }
  });

  handle.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    moveDrag(event.clientY);
  });

  handle.addEventListener("pointerup", (event) => {
    if (!isDragging) return;
    // (Bug 3 fix) pointerup의 최종 좌표로 currentY를 갱신한다.
    // 마지막 pointermove와 pointerup 사이에 발생하는 위치 차이(관성·빠른 스와이프)로 인해
    // moveDrag에서 캡처된 currentY가 실제 손을 뗀 위치와 달라 임계값 판단이 틀어질 수 있다.
    currentY = Math.max(0, event.clientY - startY);
    try {
      handle.releasePointerCapture(event.pointerId);
    } catch {}
    finishDrag();
  });

  handle.addEventListener("pointercancel", (event) => {
    if (!isDragging) return;
    try {
      handle.releasePointerCapture(event.pointerId);
    } catch {}
    cancelDrag();
  });
}

function resetMediaAppState() {
  activeMediaApp = null;
  activeMediaHost = "apps";
  mediaSearchQuery = "";
  selectedMediaId = null;
  mediaSearchResults = null;
  mediaSearchLoading = false;
  mediaSearchError = "";
  spotifyActiveTab = "home";
  youtubeActiveTab = "home";
  netflixActiveTab = "home";
  netflixPlaying = false;
  shortcutGrid.classList.remove("media-landscape-host");
  appsLayer.classList.remove("media-app-open");
}

function prepareLandscapeAppLaunch() {
  closeAllStatusOverlays();
  restoreDefaultSettingsRoot();
  appsLayer.hidden = true;
  appsLayer.classList.remove("media-app-open");
  vehicleSettingsLayer.hidden = true;
  workspace.hidden = false;
  setActiveSurface("home");
  shortcutGrid.innerHTML = "";
  shortcutGrid.classList.add("media-landscape-host");
  activeMediaHost = "landscape";
}

function openLandscapeMediaApp(id) {
  prepareLandscapeAppLaunch();
  activeMediaHost = "landscape";
  activeMediaApp = id;
  mediaSearchQuery = "";
  selectedMediaId = null;
  mediaSearchResults = null;
  mediaSearchLoading = false;
  mediaSearchError = "";
  spotifyActiveTab = "home";
  youtubeActiveTab = "home";
  netflixActiveTab = "home";
  netflixPlaying = false;
  renderMediaApp();

}

// ===== Radio App State & Controllers =====
let radioState = {
  frequency: 95.1,
  activeTab: "manual", // "favorites", "stations", "manual"
  isPlaying: true,
  favorites: [89.1, 95.1, 107.7]
};

const STATION_NAMES = {
  89.1: { name: "KBS 2FM Cool FM", song: "박명수의 라디오쇼" },
  91.9: { name: "MBC FM4U", song: "배철수의 음악캠프" },
  95.1: { name: "MBC 표준FM", song: "안녕하세요 이문세입니다" },
  107.7: { name: "SBS Power FM", song: "김영철의 파워FM" }
};

function getStationInfo(freq) {
  const f = freq.toFixed(1);
  return STATION_NAMES[f] || { name: "지상파 FM 라디오", song: "음악 감상 중" };
}

function openRadioApp() {
  prepareLandscapeAppLaunch();
  activeMediaApp = "radio";
  activeMediaHost = "landscape";
  renderRadioApp();
}

function renderRadioApp() {
  const isLandscapeHost = activeMediaHost === "landscape";
  const host = mediaAppHost();

  shortcutGrid.classList.toggle("media-landscape-host", isLandscapeHost);
  appsLayer.classList.toggle("media-app-open", !isLandscapeHost);
  
  const freqStr = radioState.frequency.toFixed(1);
  const info = getStationInfo(radioState.frequency);
  const isStarred = radioState.favorites.includes(Number(freqStr));

  host.innerHTML = `
    <div class="sample-radio-app">
      <div class="radio-drag-handle" id="radioDragHandle" aria-hidden="true"></div>
      <!-- L1: Header -->
      <header class="ivi_header">
        <div class="title_group">
          <div class="radio-sources-badge">
            ${svgIcon("radio")}
          </div>
          <button class="primary_button" type="button">
            <span class="btn-title">Radio</span>
            <svg class="chevron-d" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z"/>
            </svg>
          </button>
          <div class="header-divider"></div>
          <button class="secondary_button" type="button">
            <span class="btn-title">FM</span>
            <svg class="chevron-d" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z"/>
            </svg>
          </button>
          <div class="header-divider"></div>
          <div class="segmented_control_line">
            <button class="line_button${radioState.activeTab === "favorites" ? " active" : ""}" data-tab="favorites" type="button">
              <span>즐겨찾기</span>
            </button>
            <button class="line_button${radioState.activeTab === "stations" ? " active" : ""}" data-tab="stations" type="button">
              <span>방송국 전체</span>
            </button>
            <button class="line_button${radioState.activeTab === "manual" ? " active" : ""}" data-tab="manual" type="button">
              <span>수동 조정</span>
            </button>
          </div>
        </div>
        <button class="header-more-btn" type="button">
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="#131417" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5" cy="12" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="19" cy="12" r="1.5"/>
          </svg>
        </button>
      </header>

      <!-- L2: Body (Manual Tuning) -->
      <main class="manual_tuning">
        <div class="channel_control">
          <button class="tune-arrow-btn" id="tunePrevBtn" type="button" aria-label="이전 주파수">
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="#131417" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="tuning-text-group">
            <h1 class="tuning-frequency">FM ${freqStr}</h1>
            <div class="tuning-station-info">
              <div class="tuning-station-name">${info.name}</div>
              <div class="tuning-station-song">${info.song}</div>
            </div>
          </div>
          <button class="tune-arrow-btn" id="tuneNextBtn" type="button" aria-label="다음 주파수">
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="#131417" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="ivi_frequency_control">
          <div class="gradient_mask_left"></div>
          <div class="gradient_mask_right"></div>
          <div class="frequency-scale-outer" id="freqScaleOuter">
            <div class="frequency-scale-inner">
              <div class="frequency-ticks-row" id="freqTicksRow"></div>
              <div class="frequency-numbers-row" id="freqNumbersRow"></div>
            </div>
          </div>
          <div class="frequency-purple-glow"></div>
          <!-- Fixed center indicator line -->
          <div class="frequency-center-indicator"></div>
        </div>
      </main>

      <!-- L3: Footer -->
      <footer class="ivi_radio_control">
        <div class="radio-player-button-group">
          <button class="radio-player-btn" id="radioPrevBtn" type="button" aria-label="이전 채널">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="radio-player-btn play-pause-btn" id="radioPlayBtn" type="button" aria-label="재생">
            ${radioState.isPlaying ? 
              `<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor"/></svg>` : 
              `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`
            }
          </button>
          <button class="radio-player-btn" id="radioNextBtn" type="button" aria-label="다음 채널">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button class="radio-player-btn star-btn${isStarred ? " active-star" : ""}" id="radioStarBtn" type="button" aria-label="즐겨찾기">
            ${isStarred ? 
              `<svg viewBox="0 0 24 24" width="28" height="28" fill="#FFB800" stroke="#FFB800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 10 17 15 18 22 12 18 6 22 7 15 2 10 9 9"></polygon></svg>` : 
              `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 10 17 15 18 22 12 18 6 22 7 15 2 10 9 9"></polygon></svg>`
            }
          </button>
        </div>
        <div class="radio-footer-info">
          <div class="radio-footer-text-group">
            <span class="radio-footer-freq">FM ${freqStr}</span>
            <span class="radio-footer-desc">${info.name} · ${info.song}</span>
          </div>
          <div class="radio-footer-cover">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#131417" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20V9"/>
              <circle cx="12" cy="7.5" r="1"/>
              <path d="M8 12a6 6 0 0 1 0-6M16 6a6 6 0 0 1 0 6M5 15a10 10 0 0 1 0-10M19 5a10 10 0 0 1 0 10"/>
            </svg>
          </div>
        </div>
      </footer>
    </div>
  `;

  // Initialize ticks and scrolling
  generateRadioTicks();

  // Scroll event for real-time dial adjustment
  const scaleOuter = host.querySelector("#freqScaleOuter");
  let scrollTimeout;
  if (scaleOuter) {
    scaleOuter.addEventListener("scroll", () => {
      if (radioState.isScrollingProgrammatically) return;
      const newFreq = 80.0 + scaleOuter.scrollLeft / 28;
      const clampedFreq = Math.max(87.5, Math.min(108.0, Number(newFreq.toFixed(1))));
      if (Math.abs(radioState.frequency - clampedFreq) >= 0.1) {
        radioState.frequency = clampedFreq;
        
        // Update DOM text directly to prevent lag during active drag
        const freqText = host.querySelector(".tuning-frequency");
        if (freqText) freqText.innerText = `FM ${clampedFreq.toFixed(1)}`;
        
        const footerFreq = host.querySelector(".radio-footer-freq");
        if (footerFreq) footerFreq.innerText = `FM ${clampedFreq.toFixed(1)}`;
        
        const info = getStationInfo(clampedFreq);
        const nameText = host.querySelector(".tuning-station-name");
        if (nameText) nameText.innerText = info.name;
        const songText = host.querySelector(".tuning-station-song");
        if (songText) songText.innerText = info.song;
        
        const footerDesc = host.querySelector(".radio-footer-desc");
        if (footerDesc) footerDesc.innerText = `${info.name} · ${info.song}`;
        
        // Debounce full render to update active-star and other parts
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          renderRadioApp();
        }, 300);
      }
    });
  }

  const radioContainer = host.querySelector(".sample-radio-app");
  bindLandscapeDragToClose(radioContainer);

  host.querySelectorAll(".line_button").forEach(btn => {
    btn.addEventListener("click", () => {
      radioState.activeTab = btn.dataset.tab;
      renderRadioApp();
    });
  });

  host.querySelector("#tunePrevBtn")?.addEventListener("click", () => {
    radioState.frequency = Math.max(87.5, radioState.frequency - 0.1);
    renderRadioApp();
  });

  host.querySelector("#tuneNextBtn")?.addEventListener("click", () => {
    radioState.frequency = Math.min(108.0, radioState.frequency + 0.1);
    renderRadioApp();
  });

  host.querySelector("#radioPrevBtn")?.addEventListener("click", () => {
    radioState.frequency = Math.max(87.5, radioState.frequency - 0.1);
    renderRadioApp();
  });

  host.querySelector("#radioNextBtn")?.addEventListener("click", () => {
    radioState.frequency = Math.min(108.0, radioState.frequency + 0.1);
    renderRadioApp();
  });

  host.querySelector("#radioPlayBtn")?.addEventListener("click", () => {
    radioState.isPlaying = !radioState.isPlaying;
    renderRadioApp();
  });

  host.querySelector("#radioStarBtn")?.addEventListener("click", () => {
    const f = Number(radioState.frequency.toFixed(1));
    if (radioState.favorites.includes(f)) {
      radioState.favorites = radioState.favorites.filter(x => x !== f);
    } else {
      radioState.favorites.push(f);
    }
    renderRadioApp();
  });
}

function generateRadioTicks() {
  const ticksRow = document.getElementById("freqTicksRow");
  const numbersRow = document.getElementById("freqNumbersRow");
  if (!ticksRow || !numbersRow) return;

  ticksRow.innerHTML = "";
  numbersRow.innerHTML = "";

  const startFreq = 80.0;
  const endFreq = 110.0;
  const tickStep = 0.5;
  const totalTicks = Math.round((endFreq - startFreq) / tickStep) + 1;

  for (let i = 0; i < totalTicks; i++) {
    const freqVal = Number((startFreq + i * tickStep).toFixed(1));
    const tick = document.createElement("div");
    
    if (Math.round(freqVal) === freqVal && Math.round(freqVal) % 5 === 0) {
      tick.className = "tick-line tall";
    } else if (Math.round(freqVal) === freqVal) {
      tick.className = "tick-line medium";
    } else {
      tick.className = "tick-line short";
    }
    tick.style.left = `${i * 14}px`;
    ticksRow.appendChild(tick);

    if (Math.round(freqVal) === freqVal && Math.round(freqVal) % 5 === 0) {
      const numLabel = document.createElement("span");
      numLabel.className = "freq-number";
      const diff = Math.abs(radioState.frequency - freqVal);
      if (diff < 2.5) {
        numLabel.classList.add("active");
      }
      numLabel.innerText = Math.round(freqVal);
      numLabel.style.left = `${i * 14}px`;
      numbersRow.appendChild(numLabel);
    }
  }

  const scaleOuter = document.getElementById("freqScaleOuter");
  if (scaleOuter) {
    radioState.isScrollingProgrammatically = true;
    const scrollTarget = (radioState.frequency - startFreq) * 28 - (scaleOuter.offsetWidth / 2);
    scaleOuter.scrollLeft = scrollTarget;
    setTimeout(() => {
      radioState.isScrollingProgrammatically = false;
    }, 50);
  }
}

// ===== Phone App State & Controllers =====
let phoneState = {
  dialString: "",
  isCalling: false
};

function openPhoneApp() {
  prepareLandscapeAppLaunch();
  activeMediaApp = "phone";
  activeMediaHost = "landscape";
  renderPhoneApp();
}

function renderPhoneApp() {
  const isLandscapeHost = activeMediaHost === "landscape";
  const host = mediaAppHost();

  shortcutGrid.classList.toggle("media-landscape-host", isLandscapeHost);
  appsLayer.classList.toggle("media-app-open", !isLandscapeHost);

  host.innerHTML = `
    <div class="phone-dialer-app">
      <div class="phone-drag-handle" id="phoneDragHandle" aria-hidden="true"></div>
      <button class="media-app-back" type="button" data-close-media-app aria-label="돌아가기" style="position: absolute; left: 24px; top: 24px; background:transparent; border:none; font-size:28px; cursor:pointer; color:#131417;">‹</button>
      
      <div class="dial_title">
        <h1 class="dial-number-display" id="dialDisplay">${phoneState.dialString || "번호를 입력하세요"}</h1>
      </div>

      <div class="phone_dial">
        <button class="phone_dial_num dial-btn" data-val="1" type="button">1</button>
        <button class="phone_dial_num dial-btn" data-val="2" type="button">2</button>
        <button class="phone_dial_num dial-btn" data-val="3" type="button">3</button>
        <button class="phone_dial_num dial-btn" data-val="4" type="button">4</button>
        <button class="phone_dial_num dial-btn" data-val="5" type="button">5</button>
        <button class="phone_dial_num dial-btn" data-val="6" type="button">6</button>
        <button class="phone_dial_num dial-btn" data-val="7" type="button">7</button>
        <button class="phone_dial_num dial-btn" data-val="8" type="button">8</button>
        <button class="phone_dial_num dial-btn" data-val="9" type="button">9</button>
        <button class="phone_dial_num dial-btn" data-val="*" type="button">*</button>
        <button class="phone_dial_num dial-btn" data-val="0" type="button">0</button>
        <button class="phone_dial_num dial-btn" data-val="#" type="button">#</button>
      </div>

      <div class="phone-action-row">
        <button class="phone-action-btn" id="dialBackspaceBtn" type="button" aria-label="지우기">
          <svg viewBox="0 0 24 24" width="32" height="32"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="18" y1="9" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="18" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="phone-call-btn" id="dialCallBtn" type="button" aria-label="통화">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
        </button>
      </div>
    </div>
  `;

  const phoneContainer = host.querySelector(".phone-dialer-app");
  bindLandscapeDragToClose(phoneContainer);

  host.querySelector("[data-close-media-app]")?.addEventListener("click", () => {
    closeLandscapeApp();
  });

  host.querySelectorAll(".phone_dial_num").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.val;
      phoneState.dialString += val;
      phoneState.dialString = formatPhoneNumber(phoneState.dialString);
      updateDialDisplay();
    });
  });

  host.querySelector("#dialBackspaceBtn")?.addEventListener("click", () => {
    let raw = phoneState.dialString.replace(/-/g, "");
    raw = raw.slice(0, -1);
    phoneState.dialString = formatPhoneNumber(raw);
    updateDialDisplay();
  });

  host.querySelector("#dialCallBtn")?.addEventListener("click", () => {
    if (!phoneState.dialString) return;
    if (phoneState.isCalling) {
      phoneState.isCalling = false;
      alert("통화가 종료되었습니다.");
      phoneState.dialString = "";
      renderPhoneApp();
    } else {
      phoneState.isCalling = true;
      alert(`${phoneState.dialString} 번호로 연결 중...`);
      renderPhoneApp();
    }
  });

}

function formatPhoneNumber(str) {
  const cleaned = str.replace(/-/g, "");
  if (cleaned.startsWith("010") && cleaned.length <= 11) {
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return cleaned;
}

function updateDialDisplay() {
  const display = document.getElementById("dialDisplay");
  if (display) {
    display.innerText = phoneState.dialString || "번호를 입력하세요";
  }
}

function renderMediaApp() {
  const meta = MEDIA_APP_META[activeMediaApp];
  const host = mediaAppHost();
  const isLandscapeHost = activeMediaHost === "landscape";
  const isSpotifyApp = activeMediaApp === "spotify";
  const isYoutubeApp = activeMediaApp === "youtube";
  if (!meta) {
    appsLayer.classList.remove("media-app-open");
    shortcutGrid.classList.remove("media-landscape-host");
    return;
  }

  const results = mediaResultsForActiveApp();
  const selected = results.find((item) => item.id === selectedMediaId) || results[0];
  const fallback = mediaFallbackIcon(meta);
  const mediaSubtitle = isSpotifyApp
    ? "Search tracks, artists and albums"
    : isYoutubeApp
      ? "Search videos, channels and creators"
      : meta.type === "music"
        ? "음악 검색"
        : "영상 검색";
  const sectionTitle = isSpotifyApp
    ? `<div class="media-section-title"><span>Search results</span><small>${results.length ? `${results.length} tracks` : "Spotify catalog"}</small></div>`
    : isYoutubeApp
      ? `<div class="media-section-title"><span>Recommended videos</span><small>${results.length ? `${results.length} videos` : "YouTube catalog"}</small></div>`
      : "";
  const selectedKicker = isSpotifyApp
    ? `<span class="media-kicker">Now playing</span>`
    : isYoutubeApp
      ? `<span class="media-kicker">Now watching</span>`
      : "";
  const selectedProgress = isSpotifyApp
    ? `
      <div class="spotify-progress" aria-hidden="true">
        <span>0:00</span>
        <div><i></i></div>
        <span>3:24</span>
      </div>
    `
    : isYoutubeApp
      ? `
        <div class="youtube-video-progress" aria-hidden="true">
          <div><i></i></div>
          <span>0:00</span>
          <span>12:48</span>
        </div>
        <div class="youtube-action-row" aria-hidden="true">
          <span>좋아요</span>
          <span>공유</span>
          <span>저장</span>
        </div>
      `
      : "";
  const emptyHint = isSpotifyApp
    ? `<span>Type a keyword and press search.</span>`
    : isYoutubeApp
      ? `<span>Enter a keyword and press search.</span>`
      : "";
  appsLayer.classList.toggle("media-app-open", !isLandscapeHost);
  shortcutGrid.classList.toggle("media-landscape-host", isLandscapeHost);
  const isNetflixApp = activeMediaApp === "netflix";
  if (isSpotifyApp) {
    host.innerHTML = renderSpotifyTabletPanel(meta, results, selected, fallback);
  } else if (isYoutubeApp) {
    host.innerHTML = renderYouTubeTabletPanel(meta, results, selected, fallback);
  } else if (isNetflixApp) {
    host.innerHTML = renderNetflixTabletPanel(meta, results, selected, fallback);
  } else {
    host.innerHTML = `
      <section class="media-app-panel" aria-label="${meta.title}">
        <header class="media-app-header">
          <button class="media-app-back" type="button" data-close-media-app aria-label="${isLandscapeHost ? "홈으로 돌아가기" : "앱 목록으로 돌아가기"}">‹</button>
          <div>
            <h1>${meta.title}</h1>
            <p>${mediaSubtitle}</p>
          </div>
        </header>
        <form class="media-search-form" id="mediaSearchForm">
          <input id="mediaSearchInput" type="search" value="${escapeHtml(mediaSearchQuery)}" placeholder="${meta.placeholder}" autocomplete="off" />
          <button type="button" id="mediaSearchButton" aria-label="검색">${svgIcon("search")}</button>
        </form>
        <section class="media-app-content">
          <div class="media-results" aria-live="polite">
            ${sectionTitle}
            ${mediaSearchLoading ? `<div class="media-empty">검색 중...</div>` : ""}
            ${!mediaSearchLoading && mediaSearchError ? `<div class="media-empty">${escapeHtml(mediaSearchError)}</div>` : ""}
            ${!mediaSearchLoading && !mediaSearchError && results.length ? results.map((item) => `
              <button class="media-result${selected?.id === item.id ? " selected" : ""}" type="button" data-media-id="${escapeHtml(item.id)}">
                ${mediaArtwork(item, "media-thumb", fallback, item.title)}
                <span>
                  <strong>${escapeHtml(item.title)}</strong>
                  <small>${escapeHtml(item.creator)} · ${escapeHtml(item.description)}</small>
                </span>
              </button>
            `).join("") : ""}
            ${!mediaSearchLoading && !mediaSearchError && !results.length ? `<div class="media-empty">${meta.empty}</div>` : ""}
          </div>
          <aside class="media-now-playing">
            ${selected ? `
              ${selectedKicker}
              ${mediaArtwork(selected, "media-hero-thumb", fallback, selected.title)}
              <div class="media-track-copy">
                <strong>${escapeHtml(selected.title)}</strong>
                <span>${escapeHtml(selected.creator)}</span>
                <p>${escapeHtml(selected.description)}</p>
              </div>
              ${selectedProgress}
              <button class="media-play-button" type="button">${meta.type === "music" ? "재생" : "보기"}</button>
            ` : `
              ${mediaArtwork(null, "media-hero-thumb", fallback, meta.empty)}
              <div class="media-track-copy">
                <strong>${meta.empty}</strong>
                ${emptyHint}
              </div>
            `}
          </aside>
        </section>
      </section>
    `;
  }

  if (isLandscapeHost) {
    bindLandscapeDragToClose(host.querySelector(".media-app-panel"));
  }

  host.querySelector("[data-close-media-app]")?.addEventListener("click", () => {
    closeLandscapeApp();
  });

  host.querySelector("#mediaSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    mediaSearchQuery = host.querySelector("#mediaSearchInput")?.value || "";
    selectedMediaId = null;
    mediaSearchResults = null;
    fetchExternalMediaResults();
  });

  host.querySelector("#mediaSearchInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  });

  host.querySelector("#mediaSearchButton")?.addEventListener("click", () => {
    mediaSearchQuery = host.querySelector("#mediaSearchInput")?.value || "";
    selectedMediaId = null;
    mediaSearchResults = null;
    fetchExternalMediaResults();
  });

  host.querySelectorAll("[data-media-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedMediaId = button.dataset.mediaId;
      renderMediaApp();
    });
  });

  host.querySelectorAll("[data-spotify-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      spotifyActiveTab = button.dataset.spotifyTab;
      renderMediaApp();
    });
  });

  host.querySelectorAll("[data-youtube-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      youtubeActiveTab = button.dataset.youtubeTab;
      selectedMediaId = null;
      renderMediaApp();
    });
  });

  host.querySelector("[data-youtube-back]")?.addEventListener("click", () => {
    selectedMediaId = null;
    renderMediaApp();
  });


  host.querySelector(".media-play-button")?.addEventListener("click", () => {
    if (selected) {
      activeMediaItem = selected;
      isPlaying = true;
      updateMediaUI();
    }
  });

  // Netflix scroll handler for header opacity & search toggle
  if (isNetflixApp) {
    const scrollContent = host.querySelector(".netflix-scrollable-content");
    const topBar = host.querySelector("#netflixTopBar");
    if (scrollContent && topBar) {
      scrollContent.addEventListener("scroll", () => {
        if (scrollContent.scrollTop > 20) {
          topBar.classList.add("scrolled");
        } else {
          topBar.classList.remove("scrolled");
        }
      });
      if (scrollContent.scrollTop > 20) {
        topBar.classList.add("scrolled");
      }
    }

    const searchToggle = host.querySelector("#netflixSearchToggle");
    const searchOverlay = host.querySelector("#netflixSearchOverlay");
    if (searchToggle && searchOverlay) {
      searchToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const isVisible = searchOverlay.style.display === "block";
        searchOverlay.style.display = isVisible ? "none" : "block";
        if (!isVisible) {
          searchOverlay.querySelector("input")?.focus();
        }
      });
    }
  }

  // Netflix tab switching
  host.querySelectorAll("[data-netflix-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      netflixActiveTab = button.dataset.netflixTab;
      selectedMediaId = null;
      netflixPlaying = false;
      renderMediaApp();
    });
  });

  // Netflix sub-tab switching
  host.querySelectorAll("[data-netflix-sub-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const subTab = button.dataset.netflixSubTab;
      if (subTab === "categories") {
        // Toggle categories or simply reset to home for this prototype
        netflixActiveTab = "home";
      } else {
        netflixActiveTab = subTab;
      }
      selectedMediaId = null;
      netflixPlaying = false;
      renderMediaApp();
    });
  });

  // Netflix back to list
  host.querySelectorAll("[data-netflix-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedMediaId = null;
      renderMediaApp();
    });
  });

  // Netflix play content
  host.querySelectorAll("[data-netflix-play]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (button.dataset.netflixHeroId) {
        selectedMediaId = button.dataset.netflixHeroId;
      }
      netflixPlaying = true;
      renderMediaApp();
    });
  });

  // Netflix back from video player
  host.querySelector("[data-netflix-player-back]")?.addEventListener("click", () => {
    netflixPlaying = false;
    renderMediaApp();
  });

  // Netflix toggle "My List"
  host.querySelectorAll("[data-netflix-mylist-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.dataset.netflixMylistToggle;
      if (netflixMyList.includes(id)) {
        netflixMyList = netflixMyList.filter(item => item !== id);
      } else {
        netflixMyList.push(id);
      }
      renderMediaApp();
    });
  });
}

function favoriteTileGrid(itemId) {
  const items = FAVORITE_TILE_ITEMS[itemId];
  if (!items) return "";

  return `
    <span class="favorite-mini-grid" aria-label="${functionById(itemId).title} items">
      ${items
        .slice(0, 6)
        .map(
          (item) => `
            <span class="favorite-mini-icon" style="--card-color: ${item.color}" title="${item.title}" aria-label="${item.title}">
              ${svgIcon(item.icon)}
            </span>
          `
        )
        .join("")}
    </span>
  `;
}

function renderApps() {
  if (activeMediaHost !== "landscape") {
    activeMediaApp = null;
    activeMediaHost = "apps";
    mediaSearchQuery = "";
    selectedMediaId = null;
    shortcutGrid.classList.remove("media-landscape-host");
  }
  appsLayer.classList.remove("media-app-open");

  appsLayer.innerHTML = `
    <!-- Top Climate quick settings panel -->
    <div class="apps-climate-section">
      <div class="apps-climate-row">
        <button class="apps-climate-btn${launcherClimateState.frontDefrost ? " active" : ""}" data-action="frontDefrost" type="button">
          ${svgIcon("apps-front-defrost")}
          <span class="apps-climate-label">앞유리<br/>서리 제거</span>
        </button>
        <button class="apps-climate-btn${launcherClimateState.rearDefrost ? " active" : ""}" data-action="rearDefrost" type="button">
          ${svgIcon("apps-rear-defrost")}
          <span class="apps-climate-label">뒷유리<br/>서리 제거</span>
        </button>
        <button class="apps-climate-btn apps-climate-auto-btn${launcherClimateState.auto ? " active" : ""}" data-action="auto" type="button">
          <span class="apps-climate-auto-glyph" aria-hidden="true">AUTO</span>
          <span class="apps-climate-label">Auto</span>
        </button>
        <button class="apps-climate-btn${launcherClimateState.driverSeatHeat ? " active" : ""}" data-action="driverSeatHeat" type="button">
          ${svgIcon("apps-driver-seat-heat")}
          <span class="apps-climate-label">운전석<br/>시트 열선</span>
        </button>
        <button class="apps-climate-btn${launcherClimateState.passengerSeatHeat ? " active" : ""}" data-action="passengerSeatHeat" type="button">
          ${svgIcon("apps-passenger-seat-heat")}
          <span class="apps-climate-label">동승석<br/>시트 열선</span>
        </button>
        <button class="apps-climate-btn${launcherClimateState.driverSeatVent ? " active" : ""}" data-action="driverSeatVent" type="button">
          ${svgIcon("apps-driver-seat-vent")}
          <span class="apps-climate-label">운전석<br/>시트 통풍</span>
        </button>
        <button class="apps-climate-btn${launcherClimateState.passengerSeatVent ? " active" : ""}" data-action="passengerSeatVent" type="button">
          ${svgIcon("apps-passenger-seat-vent")}
          <span class="apps-climate-label">동승석<br/>시트 통풍</span>
        </button>

      </div>
      <div class="apps-climate-row">
        <button class="apps-climate-btn${launcherClimateState.recirculate ? " active" : ""}" data-action="recirculate" type="button">
          ${svgIcon("apps-recirculate")}
          <span class="apps-climate-label">내기<br/>순환</span>
        </button>
        <button class="apps-climate-btn${launcherClimateState.steeringHeat ? " active" : ""}" data-action="steeringHeat" type="button">
          ${svgIcon("apps-steering-heat")}
          <span class="apps-climate-label">운전대<br/>열선</span>
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="apps-divider"></div>

    <!-- Bottom apps list -->
    <div class="apps-grid" id="appsGrid"></div>
  `;

  // Attach Climate listeners
  appsLayer.querySelectorAll(".apps-climate-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      launcherClimateState[action] = !launcherClimateState[action];
      btn.classList.toggle("active", launcherClimateState[action]);
      renderGnbClimateControls();
    });
  });

  const currentAppsGrid = appsLayer.querySelector("#appsGrid");

  ALL_APPS.forEach((item) => {
    const app = document.createElement("button");
    app.type = "button";
    app.className = "launcher-app";
    if (item.appId) app.dataset.appId = item.appId;
    app.innerHTML = `
      ${cardIcon(item, "launcher-icon")}
      <strong>${item.title}</strong>
    `;
    app.addEventListener("click", () => {
      launchAppOrWidget(item.appId);
    });
    currentAppsGrid.appendChild(app);
  });
}

function renderSettingsNav() {
  settingsNav.innerHTML = VEHICLE_SETTINGS.map(
    (item) => `
      <button class="settings-nav-item${item.id === activeSettingsId ? " active" : ""}" type="button" data-settings-id="${item.id}">
        <span class="settings-nav-icon" aria-hidden="true">${svgIcon(item.icon)}</span>
        <strong>${item.title}</strong>
      </button>
    `
  ).join("");

  settingsNav.querySelectorAll("[data-settings-id]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSettingsId = button.dataset.settingsId;
      renderVehicleSettings();
    });
  });
}

function openLandscapeSettingsApp(categoryId, options = {}) {
  prepareLandscapeAppLaunch();
  activeMediaApp = `settings:${categoryId}`;
  activeMediaHost = "landscape";
  activeSettingsId = categoryId;
  if (options.appSettingsView) appSettingsState.view = options.appSettingsView;

  shortcutGrid.innerHTML = `
    <section class="landscape-settings-app" aria-label="Vehicle settings">
      <div class="landscape-drag-handle" aria-hidden="true"></div>
      <button class="media-app-back landscape-app-close" type="button" data-close-landscape-app aria-label="홈으로 돌아가기">‹</button>
      <aside class="settings-nav landscape-settings-nav" aria-label="Vehicle setting categories"></aside>
      <section class="settings-detail landscape-settings-detail" aria-live="polite"></section>
    </section>
  `;

  settingsNav = shortcutGrid.querySelector(".landscape-settings-nav");
  settingsDetail = shortcutGrid.querySelector(".landscape-settings-detail");
  renderVehicleSettings();
  bindLandscapeDragToClose(shortcutGrid.querySelector(".landscape-settings-app"));

  shortcutGrid.querySelector("[data-close-landscape-app]")?.addEventListener("click", () => {
    closeLandscapeApp();
  });
}

function settingsButtonLabel(label) {
  return `<button class="settings-soft-button" type="button">${label}</button>`;
}

function settingsToggle(id, label, checked = false) {
  return `
    <button class="settings-toggle${checked ? " checked" : ""}" type="button" data-light-toggle="${id}" aria-pressed="${checked}">
      <span aria-hidden="true"></span>
    </button>
    <strong>${label}</strong>
  `;
}

function assistToggle(id, label, checked = false) {
  return `
    <button class="settings-toggle${checked ? " checked" : ""}" type="button" data-assist-toggle="${id}" aria-pressed="${checked}">
      <span aria-hidden="true"></span>
    </button>
    <strong>${label}</strong>
  `;
}

function attachSegmentedControlInteractions(root = settingsDetail) {
  root.querySelectorAll(".segmented-control button").forEach((button) => {
    button.addEventListener("click", () => {
      const control = button.closest(".segmented-control");
      control.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

function renderLightSegment() {
  return `
    <div class="segmented-control light-main-control">
      <button type="button">${svgIcon("climate")}<strong>Off</strong></button>
      <button class="active" type="button">Auto</button>
      <button type="button">${svgIcon("ambient")}</button>
      <button type="button">${svgIcon("headlight")}</button>
    </div>
    <button class="settings-soft-button light-side-button" type="button">${svgIcon("headlight")}</button>
    <button class="settings-soft-button light-side-button" type="button">${svgIcon("fog")}</button>
  `;
}

function renderAssistSettings() {
  return `
    <div class="settings-title-row assist-title-row">
      <h1>주행 모드</h1>
    </div>
    <div class="assist-panel">
      <div class="segmented-control assist-drive-mode">
        <button class="active" type="button">표준</button>
        <button type="button">에코</button>
        <button type="button">스포츠</button>
      </div>
      <div class="assist-toggle-line">
        ${assistToggle("autoHold", "자동 정차", assistSettingsState.autoHold)}
      </div>
      <div class="settings-separator"></div>
      <section class="assist-section">
        <h2>충돌 경고 민감도</h2>
        <div class="segmented-control collision-control">
          <button class="active" type="button">끄기</button>
          <button type="button">낮음</button>
          <button type="button">보통</button>
          <button type="button">높음</button>
        </div>
      </section>
      <div class="settings-separator"></div>
      <section class="assist-section camera-section">
        <h2>주행 보조 카메라</h2>
        <div class="assist-toggle-line">
          ${assistToggle("surroundCamera", "사각지대 카메라", assistSettingsState.surroundCamera)}
        </div>
        <div class="assist-toggle-line">
          ${assistToggle("rearCamera", "룸미러 후방 카메라", assistSettingsState.rearCamera)}
        </div>
      </section>
    </div>
  `;
}

function seatPresetRow(label) {
  return `
    <section class="seat-preset-section">
      <h2>${label}</h2>
      <div class="seat-preset-row">
        <div class="segmented-control seat-preset-control">
          <button class="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">휴식 모드</button>
        </div>
        <button class="settings-soft-button seat-config-button" type="button" data-open-seat-modal>설정</button>
      </div>
    </section>
  `;
}

function renderSeatModal() {
  if (!seatSettingsState.modalOpen) return "";

  return `
    <div class="seat-modal" role="dialog" aria-label="시트 포지션 설정">
      <h2>시트 포지션</h2>
      <div class="seat-preview">
        <div class="seat-position-pad" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
        <button class="seat-reset" type="button">초기화</button>
        <div class="seat-illustration" aria-hidden="true">
          <span class="seat-back"></span>
          <span class="seat-base"></span>
          <span class="seat-head"></span>
        </div>
      </div>
      <section class="seat-modal-preset">
        <h3>프리셋</h3>
        <div class="segmented-control seat-modal-control">
          <button class="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
        </div>
      </section>
      <div class="seat-modal-actions">
        <button class="save" type="button" data-close-seat-modal>저장</button>
        <button type="button" data-close-seat-modal>취소</button>
      </div>
    </div>
  `;
}

function renderSeatSettings() {
  return `
    <div class="settings-title-row seat-title-row">
      <h1>프리셋</h1>
    </div>
    <div class="seat-panel">
      ${seatPresetRow("운전석")}
      ${seatPresetRow("동승석")}
      <div class="assist-toggle-line seat-easy-access">
        ${assistToggle("easyAccess", "이지 액세스", seatSettingsState.easyAccess)}
      </div>
    </div>
    ${renderSeatModal()}
  `;
}

function climateToggle(id, label, disabled = false) {
  const checked = Boolean(climateSettingsState[id]);
  return `
    <div class="climate-toggle-line${disabled ? " disabled" : ""}">
      <button
        class="settings-toggle${checked ? " checked" : ""}"
        type="button"
        data-climate-toggle="${id}"
        aria-pressed="${checked}"
        ${disabled ? 'disabled aria-disabled="true"' : ""}
      >
        <span aria-hidden="true"></span>
      </button>
      <strong>${label}</strong>
    </div>
  `;
}

function renderClimateSettings() {
  return `
    <div class="settings-title-row climate-title-row">
      <h1>실내 공기 순환</h1>
    </div>
    <div class="climate-settings-panel">
      ${climateToggle("washer", "워셔액 작동")}
      ${climateToggle("tunnel", "터널 진입")}
      ${climateToggle("airQuality", "공기 질 저하")}
      <div class="settings-separator"></div>
      <section class="climate-comfort-section">
        <h2>공조 편의</h2>
        ${climateToggle("overheat", "실내 과열 방지")}
        ${climateToggle("autoDry", "에어컨 자동 건조")}
        ${climateToggle("rearClimateLock", "뒷좌석 공조 잠금")}
        ${climateToggle("preconditioning", "탑승 전 온도 설정", true)}
      </section>
    </div>
  `;
}

function renderChargeLimitTicks() {
  return [20, 40, 60, 80, 100]
    .map(
      (value) => `
        <span class="charge-tick${value === chargingSettingsState.limit ? " active" : ""}" style="left: ${value}%" aria-hidden="true">
          <i></i>
        </span>
      `
    )
    .join("");
}

function renderChargingSettings() {
  const unit = chargingSettingsState.display;
  const primaryValue = unit === "%" ? 100 : 500;

  return `
    <div class="charging-panel">
      <div class="charge-range-display">
        <strong>${primaryValue}</strong><small>${unit}</small>
      </div>
      <div
        class="charge-limit-slider"
        role="slider"
        tabindex="0"
        aria-label="충전 한도"
        aria-valuemin="20"
        aria-valuemax="100"
        aria-valuenow="${chargingSettingsState.limit}"
      >
        ${renderChargeLimitTicks()}
      </div>
      <div class="charge-limit-label">충전 한도: <strong>${chargingSettingsState.limit}%</strong></div>
      <div class="settings-separator"></div>
      <section class="charge-section">
        <h2>충전 전류</h2>
        <div class="charge-current-stepper">
          <button type="button" data-charge-current="-24" aria-label="충전 전류 낮추기">−</button>
          <strong>${chargingSettingsState.current}A</strong>
          <button type="button" data-charge-current="24" aria-label="충전 전류 높이기">＋</button>
        </div>
      </section>
      <section class="charge-section">
        <h2>충전 잔량 표시</h2>
        <div class="segmented-control charge-display-toggle">
          <button class="${unit === "km" ? "active" : ""}" type="button" data-charge-display="km">km</button>
          <button class="${unit === "%" ? "active" : ""}" type="button" data-charge-display="%">%</button>
        </div>
      </section>
    </div>
  `;
}

function navigationToggle(id, label, description, checked = false) {
  return `
    <div class="navigation-toggle-line">
      <button class="settings-toggle${checked ? " checked" : ""}" type="button" data-navigation-toggle="${id}" aria-pressed="${checked}">
        <span aria-hidden="true"></span>
      </button>
      <div>
        <strong>${label}</strong>
        <p>${description}</p>
      </div>
    </div>
  `;
}

function renderChargerChips() {
  const chargers = [
    ["hyundai", "현대자동차(E-pit)"],
    ["everon", "에버온"],
    ["gs", "GS차지비"],
    ["powercube", "파워큐브"],
    ["kepco", "한국전력공사"],
    ["environment", "환경부"],
    ["lg", "LG유플러스"],
    ["chaevi", "채비"],
    ["ez", "이지차저"],
    ["sk", "SK일렉링크"],
    ["pluglink", "플러그링크"],
    ["finance", "한국전자금융"],
    ["turu", "투루차저"],
    ["starcof", "스타코프"],
    ["e-carplug", "이카플러그"]
  ];

  return `
    <div class="charger-chip-grid">
      ${chargers
        .map(
          ([id, label]) => `
            <button class="charger-chip${navigationSettingsState.chargers.has(id) ? " selected" : ""}" type="button" data-charger-id="${id}">
              ${label}
            </button>
          `
        )
        .join("")}
      <button class="charger-chip muted more-chip" type="button">더보기 <span aria-hidden="true">＋</span></button>
    </div>
  `;
}

function renderNavigationSettings() {
  return `
    <div class="navigation-panel">
      <section class="navigation-section charging-options">
        <h1>충전 설정</h1>
        ${navigationToggle(
          "evPlanner",
          "EV 경로 플래너",
          "목적지까지 이동하기에 배터리가 부족할 것으로 예상되면 경로에 선호 충전소가 추가됩니다.",
          navigationSettingsState.evPlanner
        )}
        <div class="preferred-chargers">
          <h2>선호 충전소 설정</h2>
          <p>아래에서 선호하는 충전 사업자를 선택하세요.</p>
          ${renderChargerChips()}
        </div>
      </section>
      <div class="settings-separator"></div>
      <section class="navigation-section version-info">
        <h2>버전 정보</h2>
        <strong>내비게이션</strong>
        <p>2.0.7-rc7 - 2025.03.26</p>
      </section>
      <div class="settings-separator"></div>
      <section class="navigation-section data-management">
        <h2>데이터 관리</h2>
        <div class="data-reset-row">
          <div>
            <strong>사용 기록 초기화</strong>
            <p>최근 목적지, 즐겨찾기, 주행 기록 등 내비게이션 사용 이력을 모두 삭제합니다.</p>
          </div>
          <button class="settings-soft-button data-reset-button" type="button">초기화</button>
        </div>
      </section>
    </div>
  `;
}

function renderGleoSettings() {
  return `
    <div class="gleo-panel">
      <div class="settings-title-row gleo-title-row">
        <h1>Gleo AI</h1>
      </div>
      <section class="gleo-section">
        <h2>음성 유형</h2>
        <div class="segmented-control gleo-voice-control">
          ${[1, 2, 3, 4, 5, 6]
            .map(
              (voice) => `
                <button class="${gleoSettingsState.voice === voice ? "active" : ""}" type="button" data-gleo-voice="${voice}">
                  음성 ${voice}
                </button>
              `
            )
            .join("")}
        </div>
      </section>
      <section class="gleo-section gleo-style-section">
        <h2>대화 스타일</h2>
        <div class="segmented-control gleo-style-control">
          <button class="${gleoSettingsState.style === "calm" ? "active" : ""}" type="button" data-gleo-style="calm">정중한</button>
          <button class="${gleoSettingsState.style === "friendly" ? "active" : ""}" type="button" data-gleo-style="friendly">친근한</button>
        </div>
      </section>
      <div class="settings-separator"></div>
      <section class="gleo-section gleo-call-section">
        <h2>호출 방법</h2>
        <p>글레오와 대화를 어떻게 시작할지 설정합니다.</p>
        <div class="gleo-toggle-line">
          <button
            class="settings-toggle${gleoSettingsState.wakeWord ? " checked" : ""}"
            type="button"
            data-gleo-toggle="wakeWord"
            aria-pressed="${gleoSettingsState.wakeWord}"
          >
            <span aria-hidden="true"></span>
          </button>
          <strong>'글레오'라고 부르기</strong>
        </div>
      </section>
    </div>
  `;
}

function displayToggle(id, label, description = "") {
  const checked = Boolean(displaySettingsState[id]);
  return `
    <div class="display-toggle-line">
      <button class="settings-toggle${checked ? " checked" : ""}" type="button" data-display-toggle="${id}" aria-pressed="${checked}">
        <span aria-hidden="true"></span>
      </button>
      <div>
        <strong>${label}</strong>
        ${description ? `<p>${description}</p>` : ""}
      </div>
    </div>
  `;
}

function renderThemePreview(theme) {
  return `
    <span class="theme-preview ${theme}" aria-hidden="true">
      <i class="theme-road"></i>
      <i class="theme-map"></i>
      <i class="theme-card"></i>
      <i class="theme-route"></i>
      <i class="theme-marker">${svgIcon("pin")}</i>
      <i class="theme-dock"></i>
      <i class="theme-controls"><b></b><b></b><b></b></i>
    </span>
  `;
}

function renderDisplaySettings() {
  const themeDisabled = displaySettingsState.themeAuto;

  return `
    <div class="display-panel">
      <section class="display-section theme-section">
        <h1>테마</h1>
        ${displayToggle("themeAuto", "자동", "테마를 주변 밝기에 맞춰 자동으로 변경합니다.")}
        <div class="theme-choice-grid${themeDisabled ? " disabled" : ""}">
          <button
            class="theme-choice${displaySettingsState.theme === "light" ? " selected" : ""}"
            type="button"
            data-theme-choice="light"
            ${themeDisabled ? 'disabled aria-disabled="true"' : ""}
          >
            ${renderThemePreview("light")}
            <span><i></i>라이트</span>
          </button>
          <button
            class="theme-choice${displaySettingsState.theme === "dark" ? " selected" : ""}"
            type="button"
            data-theme-choice="dark"
            ${themeDisabled ? 'disabled aria-disabled="true"' : ""}
          >
            ${renderThemePreview("dark")}
            <span><i></i>다크</span>
          </button>
        </div>
      </section>
      <div class="settings-separator"></div>
      <section class="display-section brightness-section">
        <h2>밝기</h2>
        <h3>밝기 조정</h3>
        <div class="light-slider-row display-brightness-row${displaySettingsState.brightnessAuto ? " disabled" : ""}">
          <button class="light-arrow" type="button" data-display-brightness="down" aria-label="밝기 낮추기" ${displaySettingsState.brightnessAuto ? "disabled" : ""}>‹</button>
          <div class="light-slider-track">
            <span class="light-slider-fill" style="width: ${(displaySettingsState.brightness ?? 6) * 10}%">${svgIcon("climate")}</span>
          </div>
          <button class="light-arrow" type="button" data-display-brightness="up" aria-label="밝기 높이기" ${displaySettingsState.brightnessAuto ? "disabled" : ""}>›</button>
        </div>
        ${displayToggle("brightnessAuto", "자동", "화면 밝기를 주변 밝기에 맞춰 자동으로 변경합니다.")}
      </section>
      <div class="settings-separator"></div>
      <section class="display-section hud-section">
        <h2>헤드업 디스플레이</h2>
        ${displayToggle("hudSpeed", "속도")}
        ${displayToggle("hudRoute", "경로")}
        ${displayToggle("hudCruise", "크루즈")}
        ${displayToggle("hudMedia", "미디어")}
      </section>
    </div>
  `;
}

function soundLevelControl(label, className = "") {
  return `
    <section class="sound-level ${className}">
      <h3>${label}</h3>
      <div class="sound-level-row">
        <button class="sound-arrow" type="button" aria-label="${label} 낮추기">‹</button>
        <div class="sound-slider-track">
          <span>${svgIcon("mute")}</span>
        </div>
        <button class="sound-arrow" type="button" aria-label="${label} 높이기">›</button>
      </div>
    </section>
  `;
}

function renderSoundSettings() {
  return `
    <div class="sound-settings-panel">
      <section class="sound-settings-section">
        <h1>주행 사운드</h1>
        <div class="segmented-control sound-drive-control">
          <button class="${soundSettingsState.driveSound === "soft" ? "active" : ""}" type="button" data-drive-sound="soft">약하게</button>
          <button class="${soundSettingsState.driveSound === "normal" ? "active" : ""}" type="button" data-drive-sound="normal">보통</button>
          <button class="${soundSettingsState.driveSound === "strong" ? "active" : ""}" type="button" data-drive-sound="strong">강하게</button>
        </div>
      </section>
      <div class="settings-separator"></div>
      <section class="sound-settings-section tone-section">
        <h2>톤 설정</h2>
        ${soundLevelControl("고음")}
        ${soundLevelControl("중음")}
        ${soundLevelControl("저음")}
      </section>
      <div class="settings-separator"></div>
      <section class="sound-settings-section balance-section">
        <h2>페이드/밸런스</h2>
        <div class="segmented-control sound-balance-control">
          <button class="${soundSettingsState.balance === "front" ? "active" : ""}" type="button" data-sound-balance="front">전방</button>
          <button class="${soundSettingsState.balance === "center" ? "active" : ""}" type="button" data-sound-balance="center">중앙</button>
          <button class="${soundSettingsState.balance === "rear" ? "active" : ""}" type="button" data-sound-balance="rear">후방</button>
        </div>
      </section>
      <div class="settings-separator"></div>
      <section class="sound-ai-row">
        <div>
          <h2>AI 음성</h2>
          <p>Gleo AI에서 선호 음성을 선택할 수 있습니다.</p>
        </div>
        <button class="settings-soft-button sound-ai-button" type="button" data-open-gleo>Gleo AI로 이동</button>
      </section>
      <div class="settings-separator"></div>
      <section class="sound-settings-section volume-section">
        <h2>음량</h2>
        ${soundLevelControl("내비게이션")}
        ${soundLevelControl("미디어")}
        ${soundLevelControl("Gleo AI")}
        ${soundLevelControl("통화")}
      </section>
      <div class="settings-separator"></div>
      <section class="sound-settings-section connected-volume-section">
        <h2>연결 기기 음량</h2>
        <button class="connected-audio-row" type="button">
          <span class="connected-audio-icon android-auto" aria-hidden="true"></span>
          <strong>Android Auto</strong>
          <i aria-hidden="true">›</i>
        </button>
        <button class="connected-audio-row" type="button">
          <span class="connected-audio-icon apple-carplay" aria-hidden="true"></span>
          <strong>Apple Carplay</strong>
          <i aria-hidden="true">›</i>
        </button>
      </section>
    </div>
  `;
}

function disabledToggle(label) {
  return `
    <div class="lock-toggle-line disabled">
      <button class="settings-toggle" type="button" disabled aria-disabled="true">
        <span aria-hidden="true"></span>
      </button>
      <strong>${label}</strong>
    </div>
  `;
}

function renderLockSettings() {
  return `
    <div class="settings-title-row lock-title-row">
      <h1>자동 잠금 해제</h1>
    </div>
    <div class="lock-panel">
      <div class="segmented-control lock-control disabled-control" aria-disabled="true">
        <button class="active" type="button" disabled>운전자 접근</button>
        <button type="button" disabled>손잡이 터치</button>
      </div>
      ${disabledToggle("스마트 트렁크")}
      ${disabledToggle("웰컴 사이드미러")}
      ${disabledToggle("웰컴 라이트")}
      <div class="settings-separator"></div>
      <section class="lock-section">
        <h2>자동 잠금</h2>
        <div class="segmented-control lock-control disabled-control" aria-disabled="true">
          <button class="active" type="button" disabled>운전자 이탈</button>
          <button type="button" disabled>손잡이 터치</button>
        </div>
        ${disabledToggle("이탈 시 라이트 끔")}
      </section>
    </div>
  `;
}

function lightSlider(label, extraButton = "") {
  const isCabin = label === "실내등";
  const stateKey = isCabin ? "cabinBrightness" : "moodBrightness";
  const value = lightSettingsState[stateKey] ?? 6;
  const fillWidth = value * 10;

  return `
    <section class="light-slider-section">
      <h2>${label}</h2>
      <div class="light-slider-row">
        <button class="light-arrow" type="button" data-light-slider="${stateKey}" data-light-action="down" aria-label="${label} 낮추기">‹</button>
        <div class="light-slider-track">
          <span class="light-slider-fill" style="width: ${fillWidth}%">${svgIcon("climate")}</span>
        </div>
        <button class="light-arrow" type="button" data-light-slider="${stateKey}" data-light-action="up" aria-label="${label} 높이기">›</button>
        ${extraButton}
      </div>
    </section>
  `;
}

function renderMoodColorModal() {
  if (!lightSettingsState.colorPickerOpen) return "";

  return `
    <div class="mood-modal" role="dialog" aria-label="무드 조명 색상 선택">
      <h2>무드 조명</h2>
      <div class="color-field"><span></span></div>
      <div class="hue-strip"><span></span></div>
      <div class="color-presets">
        <button class="add-color" type="button">+</button>
        <button class="preset red selected" type="button" aria-label="빨강"></button>
        <button class="preset pink" type="button" aria-label="분홍"></button>
        <button class="preset purple" type="button" aria-label="보라"></button>
        <button class="preset blue" type="button" aria-label="파랑"></button>
        <button class="preset mint" type="button" aria-label="민트"></button>
      </div>
      <div class="mood-actions">
        <button class="save" type="button" data-close-color-picker>저장</button>
        <button type="button" data-close-color-picker>취소</button>
      </div>
    </div>
  `;
}

function renderLightsSettings() {
  return `
    <div class="settings-title-row light-title-row">
      <h1>라이트</h1>
    </div>
    <div class="lights-panel">
      <div class="light-top-row">
        ${renderLightSegment()}
      </div>
      <div class="light-toggle-line">
        ${settingsToggle("steeringLight", "운전대 버튼 표시등", lightSettingsState.steeringLight)}
      </div>
      ${lightSlider("실내등")}
      ${lightSlider("실내 무드 조명", '<button class="mood-color-button" type="button" data-open-color-picker>색상 선택</button>')}
      <div class="settings-separator"></div>
      <section class="turn-signal-section">
        <h2>방향지시등</h2>
        <div class="light-toggle-line">
          ${settingsToggle("autoTurnSignal", "자동 방향지시등", lightSettingsState.autoTurnSignal)}
        </div>
        <div class="light-toggle-line">
          ${settingsToggle("autoEmergency", "자동 비상등", lightSettingsState.autoEmergency)}
        </div>
      </section>
    </div>
    ${renderMoodColorModal()}
  `;
}

function renderQuickSettings() {
  return `
    <div class="settings-title-row">
      <h1>빠른 설정</h1>
      <span class="settings-profile-badge">박</span>
    </div>
    <div class="quick-card-grid">
      ${QUICK_SETTING_TILES.map(
        (item) => {
          const active = Boolean(quickSettingState[item.id]);
          const disabled = active && item.disabledWhenOn;
          return `
          <button class="quick-card${active ? " active" : ""}${disabled ? " disabled-state" : ""}" type="button" data-quick-id="${item.id}">
            <strong>${item.title}</strong>
            <span>${active ? item.onStatus : item.offStatus}</span>
            <i aria-hidden="true">${svgIcon(item.icon)}</i>
          </button>
        `;
        }
      ).join("")}
    </div>
    <div class="settings-control-stack">
      <div class="settings-row">
        <div class="segmented-control wide">
          <button class="active" type="button">${svgIcon("climate")}<strong>Off</strong></button>
          <button type="button">Auto</button>
          <button type="button">${svgIcon("headlight")}</button>
          <button type="button">${svgIcon("headlight")}</button>
        </div>
        ${settingsButtonLabel(svgIcon("headlight"))}
        ${settingsButtonLabel(svgIcon("fog"))}
      </div>
      <div class="settings-row">
        <div class="segmented-control wider">
          <button class="active" type="button">${svgIcon("mirror")}<strong>Off</strong></button>
          <button type="button">Auto</button>
          <button type="button">I</button>
          <button type="button">II</button>
          <button type="button">III</button>
        </div>
        ${settingsButtonLabel(svgIcon("defrost"))}
      </div>
      <div class="sound-control">
        <strong>사운드</strong>
        <button type="button" aria-label="Previous">‹</button>
        <div class="volume-bar"><span></span></div>
        <button type="button" aria-label="Next">›</button>
        ${settingsButtonLabel(svgIcon("mute"))}
      </div>
      <div class="settings-row">
        <button class="disabled-wide" type="button" disabled>${svgIcon("mirror")} 사이드미러 각도</button>
        <button class="disabled-wide" type="button" disabled>${svgIcon("car")} 운전대 위치</button>
      </div>
    </div>
  `;
}

function attachQuickSettingsInteractions() {
  settingsDetail.querySelectorAll("[data-quick-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.quickId;
      quickSettingState[id] = !quickSettingState[id];
      settingsDetail.innerHTML = renderQuickSettings();
      attachQuickSettingsInteractions();
    });
  });

  attachSegmentedControlInteractions();
}

function attachLightsInteractions() {
  attachSegmentedControlInteractions();

  settingsDetail.querySelectorAll("[data-light-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.lightToggle;
      lightSettingsState[id] = !lightSettingsState[id];
      settingsDetail.innerHTML = renderLightsSettings();
      attachLightsInteractions();
    });
  });

  settingsDetail.querySelectorAll("[data-light-slider]").forEach((button) => {
    button.addEventListener("click", () => {
      const sliderId = button.dataset.lightSlider;
      const action = button.dataset.lightAction;
      const currentVal = lightSettingsState[sliderId] ?? 6;
      if (action === "down") {
        lightSettingsState[sliderId] = Math.max(0, currentVal - 1);
      } else if (action === "up") {
        lightSettingsState[sliderId] = Math.min(10, currentVal + 1);
      }
      settingsDetail.innerHTML = renderLightsSettings();
      attachLightsInteractions();
    });
  });

  settingsDetail.querySelector("[data-open-color-picker]")?.addEventListener("click", () => {
    lightSettingsState.colorPickerOpen = true;
    settingsDetail.innerHTML = renderLightsSettings();
    attachLightsInteractions();
  });

  settingsDetail.querySelectorAll("[data-close-color-picker]").forEach((button) => {
    button.addEventListener("click", () => {
      lightSettingsState.colorPickerOpen = false;
      settingsDetail.innerHTML = renderLightsSettings();
      attachLightsInteractions();
    });
  });
}

function attachAssistInteractions() {
  attachSegmentedControlInteractions();

  settingsDetail.querySelectorAll("[data-assist-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.assistToggle;
      assistSettingsState[id] = !assistSettingsState[id];
      settingsDetail.innerHTML = renderAssistSettings();
      attachAssistInteractions();
    });
  });
}

function attachSeatInteractions() {
  attachSegmentedControlInteractions();

  settingsDetail.querySelector("[data-assist-toggle='easyAccess']")?.addEventListener("click", () => {
    seatSettingsState.easyAccess = !seatSettingsState.easyAccess;
    settingsDetail.innerHTML = renderSeatSettings();
    attachSeatInteractions();
  });

  settingsDetail.querySelectorAll("[data-open-seat-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      seatSettingsState.modalOpen = true;
      settingsDetail.innerHTML = renderSeatSettings();
      attachSeatInteractions();
    });
  });

  settingsDetail.querySelectorAll("[data-close-seat-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      seatSettingsState.modalOpen = false;
      settingsDetail.innerHTML = renderSeatSettings();
      attachSeatInteractions();
    });
  });
}

function attachClimateInteractions() {
  settingsDetail.querySelectorAll("[data-climate-toggle]:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.climateToggle;
      climateSettingsState[id] = !climateSettingsState[id];
      settingsDetail.innerHTML = renderClimateSettings();
      attachClimateInteractions();
    });
  });
}

function chargeLimitFromPointer(event, slider) {
  const rect = slider.getBoundingClientRect();
  const rawPercent = ((event.clientX - rect.left) / rect.width) * 100;
  const stepped = Math.round(rawPercent / 20) * 20;
  return Math.min(100, Math.max(20, stepped));
}

function updateChargeLimitFromPointer(event, slider) {
  chargingSettingsState.limit = chargeLimitFromPointer(event, slider);
  settingsDetail.innerHTML = renderChargingSettings();
  attachChargingInteractions();
}

function handleChargePointerMove(event) {
  if (!isDraggingChargeLimit) return;
  const slider = settingsDetail.querySelector(".charge-limit-slider");
  if (!slider) return;
  updateChargeLimitFromPointer(event, slider);
}

function handleChargePointerEnd() {
  isDraggingChargeLimit = false;
  document.removeEventListener("pointermove", handleChargePointerMove);
  document.removeEventListener("pointerup", handleChargePointerEnd);
  document.removeEventListener("pointercancel", handleChargePointerEnd);
}

function attachChargingInteractions() {
  const slider = settingsDetail.querySelector(".charge-limit-slider");

  slider?.addEventListener("pointerdown", (event) => {
    isDraggingChargeLimit = true;
    updateChargeLimitFromPointer(event, slider);
    document.addEventListener("pointermove", handleChargePointerMove);
    document.addEventListener("pointerup", handleChargePointerEnd);
    document.addEventListener("pointercancel", handleChargePointerEnd);
  });

  slider?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    chargingSettingsState.limit = Math.min(
      100,
      Math.max(20, chargingSettingsState.limit + (event.key === "ArrowRight" ? 20 : -20))
    );
    settingsDetail.innerHTML = renderChargingSettings();
    attachChargingInteractions();
  });

  settingsDetail.querySelectorAll("[data-charge-current]").forEach((button) => {
    button.addEventListener("click", () => {
      const delta = Number(button.dataset.chargeCurrent);
      chargingSettingsState.current = Math.min(48, Math.max(24, chargingSettingsState.current + delta));
      settingsDetail.innerHTML = renderChargingSettings();
      attachChargingInteractions();
    });
  });

  settingsDetail.querySelectorAll("[data-charge-display]").forEach((button) => {
    button.addEventListener("click", () => {
      chargingSettingsState.display = button.dataset.chargeDisplay;
      settingsDetail.innerHTML = renderChargingSettings();
      attachChargingInteractions();
    });
  });
}

function attachNavigationInteractions() {
  settingsDetail.querySelectorAll("[data-navigation-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.navigationToggle;
      navigationSettingsState[id] = !navigationSettingsState[id];
      settingsDetail.innerHTML = renderNavigationSettings();
      attachNavigationInteractions();
    });
  });

  settingsDetail.querySelectorAll("[data-charger-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.chargerId;
      if (navigationSettingsState.chargers.has(id)) {
        navigationSettingsState.chargers.delete(id);
      } else {
        navigationSettingsState.chargers.add(id);
      }
      settingsDetail.innerHTML = renderNavigationSettings();
      attachNavigationInteractions();
    });
  });
}

function attachGleoInteractions() {
  settingsDetail.querySelectorAll("[data-gleo-voice]").forEach((button) => {
    button.addEventListener("click", () => {
      gleoSettingsState.voice = Number(button.dataset.gleoVoice);
      settingsDetail.innerHTML = renderGleoSettings();
      attachGleoInteractions();
    });
  });

  settingsDetail.querySelectorAll("[data-gleo-style]").forEach((button) => {
    button.addEventListener("click", () => {
      gleoSettingsState.style = button.dataset.gleoStyle;
      settingsDetail.innerHTML = renderGleoSettings();
      attachGleoInteractions();
    });
  });

  settingsDetail.querySelector("[data-gleo-toggle='wakeWord']")?.addEventListener("click", () => {
    gleoSettingsState.wakeWord = !gleoSettingsState.wakeWord;
    settingsDetail.innerHTML = renderGleoSettings();
    attachGleoInteractions();
  });
}

function attachDisplayInteractions() {
  settingsDetail.querySelectorAll("[data-display-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.displayToggle;
      displaySettingsState[id] = !displaySettingsState[id];
      settingsDetail.innerHTML = renderDisplaySettings();
      attachDisplayInteractions();
    });
  });

  settingsDetail.querySelectorAll("[data-theme-choice]:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      displaySettingsState.theme = button.dataset.themeChoice;
      settingsDetail.innerHTML = renderDisplaySettings();
      attachDisplayInteractions();
    });
  });

  settingsDetail.querySelectorAll("[data-display-brightness]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.displayBrightness;
      const currentVal = displaySettingsState.brightness ?? 6;
      if (action === "down") {
        displaySettingsState.brightness = Math.max(0, currentVal - 1);
      } else if (action === "up") {
        displaySettingsState.brightness = Math.min(10, currentVal + 1);
      }
      settingsDetail.innerHTML = renderDisplaySettings();
      attachDisplayInteractions();
    });
  });
}

function attachSoundInteractions() {
  settingsDetail.querySelectorAll("[data-drive-sound]").forEach((button) => {
    button.addEventListener("click", () => {
      soundSettingsState.driveSound = button.dataset.driveSound;
      settingsDetail.innerHTML = renderSoundSettings();
      attachSoundInteractions();
    });
  });

  settingsDetail.querySelectorAll("[data-sound-balance]").forEach((button) => {
    button.addEventListener("click", () => {
      soundSettingsState.balance = button.dataset.soundBalance;
      settingsDetail.innerHTML = renderSoundSettings();
      attachSoundInteractions();
    });
  });

  settingsDetail.querySelector("[data-open-gleo]")?.addEventListener("click", () => {
    activeSettingsId = "gleo-ai";
    renderVehicleSettings();
  });
}

function attachProfileInteractions() {
  settingsDetail.querySelectorAll("[data-profile-view]").forEach((button) => {
    button.addEventListener("click", () => {
      profileSettingsState.view = button.dataset.profileView;
      profileSettingsState.manageOpen = false;
      settingsDetail.innerHTML = renderProfileSettings();
      settingsDetail.scrollTop = 0;
      attachProfileInteractions();
    });
  });

  settingsDetail.querySelector("[data-profile-manage]")?.addEventListener("click", () => {
    profileSettingsState.manageOpen = true;
    settingsDetail.innerHTML = renderProfileSettings();
    settingsDetail.scrollTop = 0;
    attachProfileInteractions();
  });

  settingsDetail.querySelectorAll("[data-close-profile-manage]").forEach((button) => {
    button.addEventListener("click", () => {
      profileSettingsState.manageOpen = false;
      settingsDetail.innerHTML = renderProfileSettings();
      attachProfileInteractions();
    });
  });

  const input = settingsDetail.querySelector(".profile-name-input");
  input?.addEventListener("input", (event) => {
    profileSettingsState.addName = event.target.value;
  });
}

function renderSecuritySettings() {
  return `
    <div class="settings-title-row">
      <h1>블랙박스</h1>
    </div>
    <div class="security-panel">
      <div class="settings-row security-mode-row">
        <div class="segmented-control blackbox disabled-control" aria-disabled="true">
          <button class="active" type="button" disabled>끄기</button>
          <button type="button" disabled>수동</button>
          <button type="button" disabled>자동</button>
        </div>
        <button class="settings-soft-button blackbox-hook security-disabled-button" type="button" disabled>온후크</button>
      </div>
      <div class="settings-row security-actions">
        <button class="disabled-wide security-action-button" type="button" disabled>${svgIcon("trash")} 클립 삭제</button>
        <button class="disabled-wide security-action-button" type="button" disabled>${svgIcon("usb")} USB 포맷</button>
      </div>
    </div>
  `;
}

function renderProfileAvatar(extraClass = "") {
  return `<span class="profile-avatar ${extraClass}" aria-hidden="true">박</span>`;
}

function renderProfileBackTitle(title) {
  return `
    <div class="profile-subpage-title">
      <button class="profile-back-button" type="button" data-profile-view="main" aria-label="뒤로">‹</button>
      <h1>${title}</h1>
    </div>
  `;
}

function renderProfileInfoBanner() {
  return `
    <div class="profile-info-banner">
      <span class="profile-info-icon" aria-hidden="true">i</span>
      <p>현재 게스트 모드이며, 일부 기능이 제한될 수 있습니다. 운전자 프로필을 등록하면 모든 기능을 사용할 수 있습니다.</p>
      <button class="profile-dark-button" type="button" data-profile-view="connect">운전자 프로필 등록</button>
    </div>
  `;
}

function renderProfileKeyCard(compact = false) {
  const keys = compact ? ["Card Key [001]"] : ["Card Key [001]", "Card Key [002]", "Forty’s iPhone 15 pro"];
  return `
    <div class="profile-key-card">
      ${keys
        .map(
          (key, index) => `
            <div class="profile-key-row">
              <strong>${key}</strong>
              ${index > 0 ? `<button type="button" aria-label="${key} 삭제">${svgIcon("trash")}</button>` : ""}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderProfileManageModal() {
  if (!profileSettingsState.manageOpen) return "";

  return `
    <div class="profile-manage-modal" role="dialog" aria-label="프로필 관리">
      <div class="profile-manage-title">
        <h2>프로필 관리</h2>
        <button class="settings-soft-button profile-key-add" type="button">키 추가</button>
      </div>
      <p>하나의 키에 여러 프로필이 연결된 경우, 가장 상단의 프로필이 우선적으로 선택됩니다. 우선순위를 변경하려면, 프로필의 순서를 변경하세요.</p>
      <div class="profile-manage-list">
        <div><span aria-hidden="true">≡</span><strong>운전자</strong><button type="button" aria-label="운전자 삭제">${svgIcon("trash")}</button></div>
        <div><span aria-hidden="true">≡</span><strong>박준영</strong></div>
      </div>
      <div class="profile-modal-actions">
        <button class="profile-dark-button" type="button" data-close-profile-manage>저장</button>
        <button class="settings-soft-button" type="button" data-close-profile-manage>취소</button>
      </div>
    </div>
  `;
}

function renderProfileMainSettings() {
  return `
    <div class="profile-panel">
      <section class="profile-header-section">
        <h1>프로필 설정</h1>
        <div class="profile-identity">
          ${renderProfileAvatar()}
          <div class="profile-name-row">
            <button class="profile-name-pill" type="button">박준영 <span aria-hidden="true">×</span></button>
            <button class="settings-soft-button profile-add-button" type="button" data-profile-view="add">프로필 추가</button>
          </div>
        </div>
      </section>
      ${renderProfileInfoBanner()}
      <div class="settings-separator"></div>
      <section class="profile-section">
        <h2>제어</h2>
        <div class="profile-control-grid">
          <button class="disabled-wide" type="button" disabled>${svgIcon("mirror")} 사이드미러 각도</button>
          <button class="disabled-wide" type="button" disabled>${svgIcon("car")} 운전대 위치</button>
        </div>
      </section>
      <div class="settings-separator"></div>
      <section class="profile-section">
        <div class="profile-section-title-row">
          <h2>키</h2>
          <button class="settings-soft-button profile-key-add" type="button" data-profile-view="link-key">키 추가</button>
        </div>
        ${renderProfileKeyCard(false)}
      </section>
      <div class="settings-separator"></div>
      <section class="profile-section profile-lock-section">
        <div class="profile-setting-line disabled">
          <button class="settings-toggle" type="button" disabled><span aria-hidden="true"></span></button>
          <strong>프로필 잠금</strong>
          <button class="settings-soft-button" type="button" disabled>변경</button>
        </div>
      </section>
      <div class="settings-separator"></div>
      <section class="profile-section">
        <div class="profile-section-title-row">
          <h2>프로필 관리</h2>
          <button class="settings-soft-button profile-key-add" type="button" data-profile-manage>변경</button>
        </div>
        <div class="profile-management-card">
          <strong>운전자</strong>
          <strong>박준영</strong>
          <button type="button" aria-label="프로필 삭제">${svgIcon("trash")}</button>
        </div>
      </section>
      ${renderProfileManageModal()}
    </div>
  `;
}

function renderConnectMobileScreen() {
  return `
    <div class="profile-connect-screen">
      <h1>Connect Mobile 연동하기</h1>
      <p>Connect Mobile 앱과 연동해<br>모든 차량 서비스를 원격으로 쉽고 편리하게 이용해보세요.</p>
      <div class="qr-box" aria-label="QR 코드" role="img"></div>
      <p>스마트폰에서 Connect Mobile 앱을 실행합니다.<br>화면 우측 상단의 스캔 아이콘을 누릅니다.<br>QR코드를 스캔하여 차량과 연결을 시작합니다.</p>
      <button class="profile-dark-button connect-close" type="button" data-profile-view="main">닫기</button>
    </div>
  `;
}

function renderProfileAddScreen() {
  return `
    <div class="profile-add-screen">
      ${renderProfileBackTitle("프로필 추가")}
      <div class="profile-add-form">
        <span class="profile-avatar empty" aria-hidden="true">${svgIcon("profile")}</span>
        <div class="profile-input-row">
          <input class="profile-name-input" type="text" placeholder="이름 입력" value="${profileSettingsState.addName}" />
          <button class="settings-soft-button profile-save-button" type="button" ${profileSettingsState.addName ? "" : "disabled"}>저장</button>
        </div>
      </div>
    </div>
  `;
}

function renderProfileKeyLinkScreen() {
  return `
    <div class="profile-link-screen">
      ${renderProfileBackTitle("프로필에 키 연동")}
      <button class="profile-link-row" type="button">
        <span><strong>모바일 키</strong><small>Connect Mobile 앱에서 차량을 선택하세요.</small></span>
        <i aria-hidden="true">›</i>
      </button>
      <button class="profile-link-row" type="button">
        <span><strong>카드 키</strong><small>Connect Mobile 앱에서 차량을 선택하세요.</small></span>
        <i aria-hidden="true">›</i>
      </button>
    </div>
  `;
}

function renderProfileSettings() {
  if (profileSettingsState.view === "connect") return renderConnectMobileScreen();
  if (profileSettingsState.view === "add") return renderProfileAddScreen();
  if (profileSettingsState.view === "link-key") return renderProfileKeyLinkScreen();
  return renderProfileMainSettings();
}

const CONVENIENCE_CARDS = [
  {
    id: "wash",
    title: "세차 모드",
    icon: "star",
    description: "세차 시 차량 손상을 방지하기 위해 일부 기능을 자동으로 제어합니다."
  },
  {
    id: "utility",
    title: "유틸리티 모드",
    icon: "star",
    description: "주차 중에도 오디오나 조명 등 전기 장치를 계속 사용할 수 있습니다."
  },
  {
    id: "pet",
    title: "펫 케어 모드",
    icon: "paw",
    description: "반려 동물이 차 안에서 안전하게 있을 수 있도록 실내 온도를 유지하고 도어와 창문을 잠급니다.",
    disabled: true
  },
  {
    id: "valet",
    title: "발레 모드",
    icon: "valet",
    description: "주행에 필요한 기능은 그대로 작동하며, 개인정보 보호를 위해 일부 기능이 제한됩니다."
  }
];

const WASH_MODE_STEPS = [
  ["전좌석 창문", "닫힘·잠김"],
  ["사이드미러", "접힘"],
  ["와이퍼", "자동 모드 꺼짐"],
  ["충전구", "잠김"],
  ["주차 센서 경고음", "꺼짐"]
];

function renderConvenienceCard(item) {
  const isActive = convenienceSettingsState.activeMode === item.id;
  const isOtherModeActive = convenienceSettingsState.activeMode && !isActive;
  const isDisabled = item.disabled || isOtherModeActive;
  return `
    <article class="convenience-card${isOtherModeActive ? " muted" : ""}${item.disabled ? " disabled" : ""}">
      <div class="convenience-card-title">
        <h2>${item.title}</h2>
        <span class="convenience-card-icon" aria-hidden="true">${svgIcon(item.icon)}</span>
      </div>
      <p>${item.description}</p>
      <button
        class="convenience-card-button${isActive ? " active" : ""}"
        type="button"
        data-convenience-mode="${item.id}"
        ${isDisabled ? "disabled" : ""}
      >${isActive ? "끄기" : "켜기"}</button>
    </article>
  `;
}

function renderWashModeModal() {
  return `
    <div class="convenience-modal-layer">
      <section class="convenience-modal wash-modal" role="dialog" aria-modal="true" aria-label="세차 모드 시작">
        <h2>세차 모드 시작</h2>
        <p>세차 시 차량 손상을 방지하기 위해 다음 기능을 자동으로 조정합니다.</p>
        <div class="wash-check-list">
          ${WASH_MODE_STEPS.map(([label, status]) => `
            <div class="wash-check-item">
              <span class="wash-check" aria-hidden="true">✓</span>
              <div>
                <strong>${label}</strong>
                <span>${status}</span>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="convenience-modal-actions">
          <button class="convenience-dark-button" type="button" data-convenience-action="wash-end">세차 모드 종료</button>
          <button class="convenience-light-button" type="button" data-convenience-action="close-modal">닫기</button>
        </div>
      </section>
    </div>
  `;
}

function renderConfirmModeModal(mode) {
  const isUtility = mode === "utility";
  return `
    <div class="convenience-modal-layer">
      <section class="convenience-modal confirm-mode-modal" role="dialog" aria-modal="true" aria-label="${isUtility ? "유틸리티" : "발레"} 모드 시작">
        <h2>${isUtility ? "유틸리티" : "발레"} 모드 시작</h2>
        <p>${isUtility
          ? "유틸리티 모드를 사용하면 주차 중에도 차량의 전기 장치를 오래 사용할 수 있습니다. 기어를 바꾸거나 브레이크를 밟으면 모드가 자동으로 꺼집니다."
          : "발레 모드는 개인 정보를 보호하기 위해 일부 기능의 사용을 제한합니다. 주행에 필요한 기능만 사용할 수 있습니다."
        }</p>
        <p class="confirm-question">${isUtility ? "유틸리티" : "발레"} 모드를 시작하시겠어요?</p>
        <div class="convenience-modal-actions">
          <button class="convenience-dark-button" type="button" data-convenience-action="${isUtility ? "utility-start" : "valet-start"}">시작</button>
          <button class="convenience-light-button" type="button" data-convenience-action="close-modal">취소</button>
        </div>
      </section>
    </div>
  `;
}

function renderPinModeModal() {
  const focusedIndex = Math.min(convenienceSettingsState.pin.length, 3);
  const boxes = [0, 1, 2, 3].map((index) => `
    <span class="${index === focusedIndex ? "focused" : ""}">${convenienceSettingsState.pin[index] ? "•" : ""}</span>
  `).join("");
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => `
    <button type="button" data-pin-key="${key}">${key}</button>
  `).join("");
  return `
    <div class="convenience-modal-layer">
      <section class="convenience-modal pin-modal" role="dialog" aria-modal="true" aria-label="PIN 입력">
        <h2>PIN 입력</h2>
        <div class="pin-boxes" aria-label="PIN 네 자리">${boxes}</div>
        <div class="pin-keypad">
          ${keys}
          <button class="pin-muted-key" type="button" data-pin-action="backspace">⌫</button>
          <button type="button" data-pin-key="0">0</button>
          <button class="pin-muted-key" type="button" data-pin-action="clear">Clear</button>
        </div>
        <button class="pin-cancel" type="button" data-convenience-action="close-modal">취소</button>
      </section>
    </div>
  `;
}

function renderConvenienceModeModal() {
  if (convenienceSettingsState.modal === "wash") return renderWashModeModal();
  if (convenienceSettingsState.modal === "utility") return renderConfirmModeModal("utility");
  if (convenienceSettingsState.modal === "valet") return renderConfirmModeModal("valet");
  if (convenienceSettingsState.modal === "pin") return renderPinModeModal();
  return "";
}

function renderConvenienceSettings() {
  return `
    <div class="convenience-panel">
      <div class="settings-title-row">
        <h1>편의 기능</h1>
      </div>
      <div class="convenience-grid">
        ${CONVENIENCE_CARDS.map(renderConvenienceCard).join("")}
      </div>
      ${convenienceSettingsState.toast ? `<div class="convenience-toast">${convenienceSettingsState.toast}</div>` : ""}
      ${renderConvenienceModeModal()}
    </div>
  `;
}

function rerenderConvenienceSettings() {
  settingsDetail.innerHTML = renderConvenienceSettings();
  attachConvenienceInteractions();
}

function attachConvenienceInteractions() {
  settingsDetail.querySelectorAll("[data-convenience-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.convenienceMode;
      convenienceSettingsState.toast = "";

      if (mode === "wash") {
        if (convenienceSettingsState.activeMode === "wash") {
          convenienceSettingsState.activeMode = null;
          convenienceSettingsState.modal = null;
        } else {
          convenienceSettingsState.activeMode = "wash";
          convenienceSettingsState.modal = "wash";
        }
      }

      if (mode === "utility") {
        if (convenienceSettingsState.activeMode === "utility") {
          convenienceSettingsState.activeMode = null;
          convenienceSettingsState.modal = null;
        } else {
          convenienceSettingsState.modal = "utility";
        }
      }

      if (mode === "valet") {
        convenienceSettingsState.modal = "valet";
      }

      rerenderConvenienceSettings();
    });
  });

  settingsDetail.querySelectorAll("[data-convenience-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.convenienceAction;
      if (action === "close-modal") {
        convenienceSettingsState.modal = null;
        convenienceSettingsState.pin = "";
      }
      if (action === "wash-end") {
        convenienceSettingsState.activeMode = null;
        convenienceSettingsState.modal = null;
      }
      if (action === "utility-start") {
        convenienceSettingsState.activeMode = "utility";
        convenienceSettingsState.modal = null;
        convenienceSettingsState.toast = "유틸리티 모드 켜짐. 주차 중에도 전기 장치를 장시간 사용할 수 있습니다.";
      }
      if (action === "valet-start") {
        convenienceSettingsState.modal = "pin";
        convenienceSettingsState.pin = "";
      }
      rerenderConvenienceSettings();
    });
  });

  settingsDetail.querySelectorAll("[data-pin-key]").forEach((button) => {
    button.addEventListener("click", () => {
      if (convenienceSettingsState.pin.length < 4) {
        convenienceSettingsState.pin += button.dataset.pinKey;
        rerenderConvenienceSettings();
      }
    });
  });

  settingsDetail.querySelectorAll("[data-pin-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.pinAction === "backspace") {
        convenienceSettingsState.pin = convenienceSettingsState.pin.slice(0, -1);
      }
      if (button.dataset.pinAction === "clear") {
        convenienceSettingsState.pin = "";
      }
      rerenderConvenienceSettings();
    });
  });
}

function connectionToggle(id, label) {
  const checked = Boolean(connectionSettingsState.toggles[id]);
  return `
    <button
      class="settings-toggle connection-toggle${checked ? " checked" : ""}"
      type="button"
      data-connection-toggle="${id}"
      aria-label="${label} ${checked ? "끄기" : "켜기"}"
      aria-pressed="${checked}"
    >
      <span aria-hidden="true"></span>
    </button>
  `;
}

function renderConnectionHeader(title, backTarget = "") {
  return `
    <div class="connection-title-row">
      ${backTarget ? `<button class="connection-back" type="button" data-connection-view="${backTarget}" aria-label="뒤로">‹</button>` : ""}
      <h1>${title}</h1>
    </div>
  `;
}

function renderConnectionMainRow(id, label) {
  return `
    <div class="connection-list-row">
      ${connectionToggle(id, label)}
      <button class="connection-row-main" type="button" data-connection-view="${id}" aria-label="${label} 상세 설정">
        <strong>${label}</strong>
        <span aria-hidden="true">›</span>
      </button>
    </div>
  `;
}

function renderConnectionMainSettings() {
  return `
    <div class="connection-panel">
      ${renderConnectionHeader("연결")}
      <div class="connection-list">
        ${renderConnectionMainRow("bluetooth", "블루투스")}
        ${renderConnectionMainRow("wifi", "Wi-Fi")}
        ${renderConnectionMainRow("hotspot", "Wi-Fi 핫스팟")}
        ${renderConnectionMainRow("mobile", "모바일 데이터")}
      </div>
    </div>
  `;
}

function renderConnectionEmptyDeviceCard(message) {
  return `<div class="connection-empty-card">${message}</div>`;
}

function renderConnectionSpinner() {
  return `<div class="lottie-loader" aria-label="검색 중" role="status"></div>`;
}

function renderBluetoothSettings() {
  const scanning = connectionSettingsState.scanning;
  return `
    <div class="connection-panel connection-detail-panel">
      ${renderConnectionHeader("블루투스", "main")}
      <section class="connection-identity">
        <h2>Car on x86_64 emulator</h2>
        <p>주변 기기에서 내 차량(Car on x86_64 emulator)을 찾을 수 있습니다.</p>
      </section>
      <section class="connection-section">
        <div class="connection-section-title">
          <h2>연결 가능한 기기</h2>
          <button class="connection-pill-button" type="button" data-connection-scan>${scanning ? "중지" : "스캔"}</button>
        </div>
        ${scanning ? `<div class="connection-empty-card scanning">${renderConnectionSpinner()}</div>` : renderConnectionEmptyDeviceCard("페어링된 기기가 없습니다. 블루투스 기기를 찾으려면 ‘스캔’을 누르세요.")}
      </section>
      <div class="connection-divider"></div>
      <section class="connection-section projection-section">
        <h2>폰 프로젝션</h2>
        <div class="connection-list projection-list">
          <div class="connection-list-row">
            ${connectionToggle("androidAuto", "Android Auto 사용")}
            <strong>Android Auto 사용</strong>
          </div>
          <div class="connection-list-row">
            ${connectionToggle("carplay", "Apple CarPlay 사용")}
            <strong>Apple CarPlay 사용</strong>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderWifiNetworkList() {
  if (!connectionSettingsState.toggles.wifi) return "";
  if (connectionSettingsState.scanning) return renderConnectionSpinner();

  return `
    <button class="wifi-network-card" type="button" data-connection-view="wifi-password" aria-label="AndroidWifi 네트워크 선택">
      <span class="wifi-network-icon" aria-hidden="true">${svgIcon("wifi")}</span>
      <strong>AndroidWifi</strong>
    </button>
  `;
}

function renderWifiSettings() {
  return `
    <div class="connection-panel connection-detail-panel">
      ${renderConnectionHeader("Wi-Fi", "main")}
      <div class="connection-list-row connection-primary-toggle">
        ${connectionToggle("wifi", "Wi-Fi")}
        <strong>Wi-Fi</strong>
      </div>
      <div class="connection-divider"></div>
      <section class="connection-section wifi-network-section">
        <div class="connection-section-title">
          <h2>연결 가능한 네트워크</h2>
          <button class="connection-pill-button" type="button" data-connection-view="add-network">네트워크 추가</button>
        </div>
        <div class="wifi-network-list">
          ${renderWifiNetworkList()}
        </div>
      </section>
    </div>
  `;
}

function renderWifiPasswordSettings() {
  return `
    <div class="connection-panel connection-detail-panel">
      ${renderConnectionHeader("Wi-Fi", "wifi")}
      <div class="connection-list-row connection-primary-toggle">
        ${connectionToggle("hotspot", "Wi-Fi 핫스팟")}
        <strong>Wi-Fi 핫스팟</strong>
      </div>
      <label class="connection-input-block">
        <strong>비밀번호</strong>
        <input class="connection-text-input" type="password" placeholder="비밀번호 입력" data-connection-input="hotspotPassword" />
      </label>
    </div>
  `;
}

function renderSecurityDropdown() {
  const options = ["개방", "WEP", "WPA/WPA2-개인", "WPA/WPA3-개인"];
  if (!connectionSettingsState.securityOpen) {
    return `
      <button class="security-select" type="button" data-security-toggle>
        <strong>${connectionSettingsState.security}</strong>
        <span aria-hidden="true">⌄</span>
      </button>
    `;
  }

  return `
    <div class="security-select expanded">
      <button type="button" data-security-toggle>
        <strong>${connectionSettingsState.security}</strong>
        <span aria-hidden="true">⌃</span>
      </button>
      ${options.map((option) => `
        <button class="${connectionSettingsState.security === option ? "selected" : ""}" type="button" data-security-option="${option}">
          <strong>${option}</strong>
          ${connectionSettingsState.security === option ? `<span aria-hidden="true">✓</span>` : ""}
        </button>
      `).join("")}
    </div>
  `;
}

function renderAddNetworkSettings() {
  return `
    <div class="connection-panel connection-detail-panel">
      ${renderConnectionHeader("네트워크 추가", "wifi")}
      <label class="connection-input-block">
        <strong>보안</strong>
        ${renderSecurityDropdown()}
      </label>
      ${connectionSettingsState.securityOpen ? "" : `
        <label class="connection-input-block">
          <strong>네트워크 이름</strong>
          <input class="connection-text-input" type="text" placeholder="이름 입력" value="${connectionSettingsState.networkName}" data-connection-input="networkName" />
        </label>
        <label class="connection-input-block">
          <strong>비밀번호</strong>
          <input class="connection-text-input" type="password" placeholder="비밀번호 입력" value="${connectionSettingsState.wifiPassword}" data-connection-input="wifiPassword" />
        </label>
      `}
      <div class="connection-action-row">
        <button class="connection-action primary" type="button" data-connection-view="wifi">연결</button>
        <button class="connection-action secondary" type="button" data-connection-view="wifi">취소</button>
      </div>
    </div>
  `;
}

function renderHotspotSettings() {
  const type = connectionSettingsState.hotspotPasswordVisible ? "text" : "password";
  return `
    <div class="connection-panel connection-detail-panel">
      ${renderConnectionHeader("Wi-Fi 핫스팟", "main")}
      <div class="connection-list-row connection-primary-toggle">
        ${connectionToggle("hotspot", "Wi-Fi 핫스팟")}
        <strong>Wi-Fi 핫스팟</strong>
      </div>
      <label class="connection-input-block">
        <strong>비밀번호</strong>
        <span class="connection-password-field">
          <input class="connection-text-input" type="${type}" placeholder="비밀번호 입력" value="${connectionSettingsState.hotspotPassword}" data-connection-input="hotspotPassword" />
          <button type="button" data-clear-hotspot-password aria-label="비밀번호 지우기">×</button>
          <button type="button" data-toggle-hotspot-password aria-label="비밀번호 보기">${svgIcon("eye")}</button>
        </span>
      </label>
    </div>
  `;
}

function renderMobileDataSettings() {
  return `
    <div class="connection-panel connection-detail-panel">
      ${renderConnectionHeader("모바일 데이터", "main")}
      <div class="connection-list-row connection-primary-toggle">
        ${connectionToggle("mobile", "모바일 데이터")}
        <strong>모바일 데이터</strong>
      </div>
      <div class="mobile-data-list">
        <div><strong>데이터 사용량</strong><span>미지원</span></div>
        <div><strong>모바일 요금제</strong><span>미지원</span></div>
        <div><strong>통신사</strong><span>T-Mobile - US</span></div>
      </div>
    </div>
  `;
}

function renderConnectionSettings() {
  if (connectionSettingsState.view === "bluetooth") return renderBluetoothSettings();
  if (connectionSettingsState.view === "wifi") return renderWifiSettings();
  if (connectionSettingsState.view === "wifi-password") return renderWifiPasswordSettings();
  if (connectionSettingsState.view === "add-network") return renderAddNetworkSettings();
  if (connectionSettingsState.view === "hotspot") return renderHotspotSettings();
  if (connectionSettingsState.view === "mobile") return renderMobileDataSettings();
  return renderConnectionMainSettings();
}

function rerenderConnectionSettings() {
  settingsDetail.innerHTML = renderConnectionSettings();
  attachConnectionInteractions();
  mountLottieLoaders(settingsDetail);
}

function attachConnectionInteractions() {
  settingsDetail.querySelectorAll("[data-connection-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.connectionToggle;
      connectionSettingsState.toggles[id] = !connectionSettingsState.toggles[id];
      if (id === "wifi" && connectionSettingsState.toggles.wifi) {
        connectionSettingsState.scanning = true;
        window.setTimeout(() => {
          if (activeSettingsId === "connection" && connectionSettingsState.view === "wifi") {
            connectionSettingsState.scanning = false;
            rerenderConnectionSettings();
          }
        }, 900);
      }
      rerenderConnectionSettings();
    });
  });

  settingsDetail.querySelectorAll("[data-connection-view]").forEach((button) => {
    button.addEventListener("click", () => {
      connectionSettingsState.view = button.dataset.connectionView;
      connectionSettingsState.scanning = false;
      connectionSettingsState.securityOpen = false;
      rerenderConnectionSettings();
    });
  });

  settingsDetail.querySelector("[data-connection-scan]")?.addEventListener("click", () => {
    connectionSettingsState.scanning = !connectionSettingsState.scanning;
    rerenderConnectionSettings();
  });

  settingsDetail.querySelector("[data-security-toggle]")?.addEventListener("click", () => {
    connectionSettingsState.securityOpen = !connectionSettingsState.securityOpen;
    rerenderConnectionSettings();
  });

  settingsDetail.querySelectorAll("[data-security-option]").forEach((button) => {
    button.addEventListener("click", () => {
      connectionSettingsState.security = button.dataset.securityOption;
      connectionSettingsState.securityOpen = false;
      rerenderConnectionSettings();
    });
  });

  settingsDetail.querySelectorAll("[data-connection-input]").forEach((input) => {
    input.addEventListener("input", (event) => {
      connectionSettingsState[event.target.dataset.connectionInput] = event.target.value;
    });
  });

  settingsDetail.querySelector("[data-clear-hotspot-password]")?.addEventListener("click", () => {
    connectionSettingsState.hotspotPassword = "";
    rerenderConnectionSettings();
  });

  settingsDetail.querySelector("[data-toggle-hotspot-password]")?.addEventListener("click", () => {
    connectionSettingsState.hotspotPasswordVisible = !connectionSettingsState.hotspotPasswordVisible;
    rerenderConnectionSettings();
  });
}

function renderAppSettingsIcon(app) {
  return `
    <span class="app-settings-icon app-settings-icon-${app.icon}" aria-hidden="true">
      ${svgIcon(app.icon)}
    </span>
  `;
}

function renderAppPermissionToggle(appId, permission) {
  const checked = Boolean(appSettingsState.permissions[appId]?.[permission.id]);
  return `
    <div class="app-permission-line">
      <button
        class="settings-toggle app-permission-toggle${checked ? " checked" : ""}"
        type="button"
        data-app-permission="${permission.id}"
        aria-label="${permission.label} ${checked ? "끄기" : "켜기"}"
        aria-pressed="${checked}"
      >
        <span aria-hidden="true"></span>
      </button>
      <strong>${permission.label}</strong>
    </div>
  `;
}

function renderAppsSettingsList() {
  return `
    <div class="app-settings-panel">
      <h1>기본 앱</h1>
      <div class="app-settings-list">
        ${APP_SETTING_APPS.map((app) => `
          <button class="app-settings-row" type="button" data-app-settings-view="${app.id}" aria-label="${app.title} 설정">
            ${renderAppSettingsIcon(app)}
            <strong>${app.title}</strong>
            <span aria-hidden="true">›</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderAppsSettingsDetail() {
  const app = getAppSettingDetail(APP_SETTING_APPS, appSettingsState.view);
  if (!app) {
    appSettingsState.view = "main";
    return renderAppsSettingsList();
  }

  return `
    <div class="app-settings-panel app-settings-detail-panel">
      <div class="app-settings-title-row">
        <button class="app-settings-back" type="button" data-app-settings-view="main" aria-label="뒤로">‹</button>
        <h1>${app.title}</h1>
      </div>
      <div class="app-permission-list">
        ${app.permissions.map((permission) => renderAppPermissionToggle(app.id, permission)).join("")}
      </div>
    </div>
  `;
}

function renderAppsSettings() {
  return appSettingsState.view === "main" ? renderAppsSettingsList() : renderAppsSettingsDetail();
}

function rerenderAppsSettings() {
  settingsDetail.innerHTML = renderAppsSettings();
  attachAppsSettingsInteractions();
}

function attachAppsSettingsInteractions() {
  settingsDetail.querySelectorAll("[data-app-settings-view]").forEach((button) => {
    button.addEventListener("click", () => {
      appSettingsState.view = button.dataset.appSettingsView;
      rerenderAppsSettings();
    });
  });

  settingsDetail.querySelectorAll("[data-app-permission]").forEach((button) => {
    button.addEventListener("click", () => {
      appSettingsState.permissions = toggleAppPermission(
        appSettingsState.permissions,
        appSettingsState.view,
        button.dataset.appPermission
      );
      rerenderAppsSettings();
    });
  });
}

function generalToggle(id, label) {
  const checked = Boolean(generalSettingsState[id]);
  return `
    <div class="general-toggle-row">
      <button
        class="settings-toggle general-toggle${checked ? " checked" : ""}"
        type="button"
        data-general-toggle="${id}"
        aria-label="${label} ${checked ? "끄기" : "켜기"}"
        aria-pressed="${checked}"
      >
        <span aria-hidden="true"></span>
      </button>
      <strong>${label}</strong>
    </div>
  `;
}

function renderGeneralSegment(key) {
  return `
    <div class="segmented-control general-segment general-segment-${key}">
      ${GENERAL_SEGMENTS[key].map((option) => `
        <button
          class="${generalSettingsState[key] === option ? "active" : ""}"
          type="button"
          data-general-segment="${key}"
          data-general-value="${option}"
          aria-pressed="${generalSettingsState[key] === option}"
        >
          ${option}
        </button>
      `).join("")}
    </div>
  `;
}

function renderGeneralSelect(key) {
  const open = generalSettingsState.dropdown === key;
  const selected = generalSettingsState[key];
  return `
    <div class="general-select-wrap${open ? " open" : ""}">
      <button class="general-select" type="button" data-general-dropdown="${key}" aria-expanded="${open}">
        <strong>${selected}</strong>
        <span aria-hidden="true">${open ? "⌃" : "⌄"}</span>
      </button>
      ${open ? `
        <div class="general-select-menu">
          ${GENERAL_DROPDOWNS[key].map((option) => `
            <button class="${option === selected ? "selected" : ""}" type="button" data-general-select="${key}" data-general-value="${option}">
              <strong>${option}</strong>
              ${option === selected ? `<span aria-hidden="true">✓</span>` : ""}
            </button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderDateTimePickerModal() {
  if (!generalSettingsState.dateTimeModalOpen) return "";
  return `
    <div class="general-floating-card date-time-card" role="dialog" aria-label="날짜 및 시간 설정">
      <h2>날짜 및 시간 설정</h2>
      <section>
        <h3>날짜</h3>
        <div class="wheel-picker date-picker" aria-hidden="true">
          <span>2025</span><span>04</span><span>26</span>
          <strong>2026</strong><strong>05</strong><strong>27</strong>
          <span>2027</span><span>06</span><span>28</span>
        </div>
      </section>
      <section>
        <h3>시간</h3>
        <div class="wheel-picker time-picker" aria-hidden="true">
          <span></span><span>11</span><span>29</span>
          <strong>오전 12</strong><strong>30</strong>
          <span></span><span>오후 1</span><span>31</span>
        </div>
      </section>
      <div class="general-modal-actions">
        <button class="primary" type="button" data-general-modal-action="close">저장</button>
        <button type="button" data-general-modal-action="close">취소</button>
      </div>
    </div>
  `;
}

function renderFontConfirmModal() {
  if (!generalSettingsState.fontConfirmOpen) return "";
  return `
    <div class="general-confirm-card" role="dialog" aria-label="글꼴 적용 확인">
      <h2>선택한 시스템 글꼴을 적용할까요?</h2>
      <p>변경한 글꼴은 앱을 다시 시작하거나 다음 주행 시 확인할 수 있습니다.</p>
      <button type="button" data-general-modal-action="close">확인</button>
    </div>
  `;
}

function renderLanguageModal() {
  if (!generalSettingsState.languageModalOpen) return "";
  return `
    <div class="general-floating-card language-card" role="dialog" aria-label="언어 선택">
      <h2>언어 선택</h2>
      <div class="language-options">
        ${GENERAL_DROPDOWNS.language.map((option) => `
          <button class="${generalSettingsState.language === option ? "selected" : ""}" type="button" data-general-select="language" data-general-value="${option}">
            <strong>${option}</strong>
          </button>
        `).join("")}
      </div>
      <div class="general-modal-actions">
        <button class="primary" type="button" data-general-modal-action="close">저장</button>
        <button type="button" data-general-modal-action="close">취소</button>
      </div>
    </div>
  `;
}

function renderGeneralSettings() {
  const autoTime = generalSettingsState.autoTime;
  return `
    <div class="general-settings-panel">
      <section class="general-section date-section">
        <h1>날짜 및 시간</h1>
        ${generalToggle("autoTime", "자동 시간 설정")}
        <div class="general-setting-row">
          <strong>날짜 및 시간 설정</strong>
          <button class="general-pill-button" type="button" data-open-date-time ${autoTime ? "disabled" : ""}>설정</button>
        </div>
        <label>시간 형식</label>
        ${renderGeneralSegment("timeFormat")}
      </section>
      <div class="general-divider"></div>
      <section class="general-section units-section">
        <h2>단위</h2>
        ${generalToggle("showAuxSpeed", "보조 속도 표시")}
        <label>거리</label>
        ${renderGeneralSegment("distanceUnit")}
        <label>온도</label>
        ${renderGeneralSegment("temperatureUnit")}
        <label>연비</label>
        ${renderGeneralSegment("efficiencyUnit")}
        <label>타이어 공기압</label>
        ${renderGeneralSegment("tirePressureUnit")}
      </section>
      <div class="general-divider"></div>
      <section class="general-section appearance-section">
        <div class="general-select-row">
          <h2>글꼴</h2>
          ${renderGeneralSelect("font")}
        </div>
        <div class="font-preview-card">
          <p>선택한 시스템 글꼴은 다음과 같이 적용됩니다:</p>
          <strong>1234567890~!@#$%^&amp;*()_-+=</strong>
        </div>
        <button class="general-apply-button" type="button" data-open-font-confirm>적용</button>
      </section>
      <div class="general-divider"></div>
      <section class="general-section language-section">
        <div class="general-select-row">
          <h2>언어</h2>
          ${renderGeneralSelect("language")}
        </div>
      </section>
      ${renderDateTimePickerModal()}
      ${renderFontConfirmModal()}
      ${renderLanguageModal()}
    </div>
  `;
}

function rerenderGeneralSettings({ keepScroll = true } = {}) {
  const scrollTop = keepScroll ? settingsDetail.scrollTop : 0;
  settingsDetail.innerHTML = renderGeneralSettings();
  settingsDetail.scrollTop = scrollTop;
  attachGeneralSettingsInteractions();
}

function attachGeneralSettingsInteractions() {
  settingsDetail.querySelectorAll("[data-general-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      generalSettingsState = toggleGeneralBoolean(generalSettingsState, button.dataset.generalToggle);
      rerenderGeneralSettings();
    });
  });

  settingsDetail.querySelectorAll("[data-general-segment]").forEach((button) => {
    button.addEventListener("click", () => {
      generalSettingsState = selectGeneralOption(
        generalSettingsState,
        button.dataset.generalSegment,
        button.dataset.generalValue
      );
      rerenderGeneralSettings();
    });
  });

  settingsDetail.querySelectorAll("[data-general-dropdown]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.generalDropdown;
      if (key === "language") {
        generalSettingsState = { ...generalSettingsState, languageModalOpen: true, dropdown: null };
        rerenderGeneralSettings();
        return;
      }
      generalSettingsState = {
        ...generalSettingsState,
        dropdown: generalSettingsState.dropdown === key ? null : key
      };
      rerenderGeneralSettings();
    });
  });

  settingsDetail.querySelectorAll("[data-general-select]").forEach((button) => {
    button.addEventListener("click", () => {
      generalSettingsState = selectGeneralOption(
        generalSettingsState,
        button.dataset.generalSelect,
        button.dataset.generalValue
      );
      rerenderGeneralSettings();
    });
  });

  settingsDetail.querySelector("[data-open-date-time]")?.addEventListener("click", () => {
    generalSettingsState = { ...generalSettingsState, dateTimeModalOpen: true, dropdown: null };
    rerenderGeneralSettings();
  });

  settingsDetail.querySelector("[data-open-font-confirm]")?.addEventListener("click", () => {
    generalSettingsState = { ...generalSettingsState, fontConfirmOpen: true, dropdown: null };
    rerenderGeneralSettings();
  });

  settingsDetail.querySelectorAll("[data-general-modal-action='close']").forEach((button) => {
    button.addEventListener("click", () => {
      generalSettingsState = closeGeneralDropdowns(generalSettingsState);
      rerenderGeneralSettings();
    });
  });
}

function vehicleInfoToggle(id, label) {
  const checked = Boolean(vehicleInfoState[id]);
  return `
    <div class="vehicle-info-toggle-line">
      <button
        class="settings-toggle vehicle-info-toggle${checked ? " checked" : ""}"
        type="button"
        data-vehicle-info-toggle="${id}"
        aria-label="${label} ${checked ? "끄기" : "켜기"}"
        aria-pressed="${checked}"
      >
        <span aria-hidden="true"></span>
      </button>
      <div>
        <strong>${label}</strong>
        <p>네트워크가 연결되어 있으면 신규 업데이트가 자동으로 다운로드됩니다.</p>
      </div>
    </div>
  `;
}

function renderReleaseFeature(title, description, icons) {
  return `
    <article class="release-feature">
      <h3>${title}</h3>
      <p>${description}</p>
      <div class="release-feature-visual" aria-hidden="true">
        ${icons.map((icon) => `<span>${svgIcon(icon)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderReleaseNoteModal() {
  if (!vehicleInfoState.releaseNoteOpen) return "";

  return `
    <div class="vehicle-info-modal" role="dialog" aria-modal="true" aria-label="업데이트 정보">
      <h2>업데이트 정보</h2>
      <div class="release-note-scroll">
        <h3>Connect.v2.0.5</h3>
        ${renderReleaseFeature(
          "왕복 시 배터리 잔량 표시",
          "경로 탐색 시, 추천 경로에서 왕복 주행 시 예상 잔여 배터리 정보를 함께 표시합니다.",
          ["battery", "pin"]
        )}
        ${renderReleaseFeature(
          "EV Route Planning 옵션 고도화",
          "차량과 사용자 선호에 맞는 충전소를 경로 내 자동으로 추가합니다. 추가된 충전소가 표시될 때, 충전이 필요한 시간을 함께 표시합니다.",
          ["route", "charge-pin"]
        )}
        ${renderReleaseFeature(
          "지역에 맞는 라디오 주파수 자동 전환",
          "라디오 앱의 옵션 설정에서 주파수 자동 전환을 설정합니다. 지역 이동으로 인해 듣고 있던 라디오 방송의 주파수가 변경될 시, 자동으로 주파수를 전환하여 동일한 방송을 이어서 들을 수 있습니다.",
          ["radio-wave", "map-refresh"]
        )}
        ${renderReleaseFeature(
          "지도 개선",
          "한 화면에서 더 많은 정보를 확인할 수 있도록 지도 배율을 개선하고, 아이콘/글꼴/도로 스타일을 개선하여 가독성을 한층 높였습니다. 서울의 주요 랜드마크 디자인이 업그레이드 되었습니다.",
          ["globe", "bridge"]
        )}
      </div>
      <button class="vehicle-info-modal-confirm" type="button" data-vehicle-info-modal-close>확인</button>
    </div>
  `;
}

function renderVehicleInfoSettings() {
  return `
    <div class="vehicle-info-panel">
      <h1>Connect</h1>
      <section class="software-section">
        <h2>소프트웨어 정보 <span aria-hidden="true">ⓘ</span></h2>
        <div class="software-version-card">
          <strong>RELEASE.Connect.v2.0.5</strong>
          <span>최신 버전 설치 일자 2025-03-26</span>
          <button type="button" data-open-release-note>릴리즈 노트</button>
        </div>
        ${vehicleInfoToggle("autoDownload", "업데이트 자동 다운로드")}
      </section>
      <div class="vehicle-info-divider"></div>
      <section class="vehicle-identity-section">
        <div class="vehicle-info-copy">
          <strong>차대 번호</strong>
          <span>invalid</span>
        </div>
        <div class="factory-reset-row">
          <div class="vehicle-info-copy">
            <strong>공장 초기화</strong>
            <span>저장된 데이터, 설정 및 추가 콘텐츠가 삭제되고, 차량이 제조 시 초기 상태로 복원됩니다.</span>
          </div>
          <button type="button">초기화</button>
        </div>
      </section>
      ${renderReleaseNoteModal()}
    </div>
  `;
}

function rerenderVehicleInfoSettings() {
  settingsDetail.innerHTML = renderVehicleInfoSettings();
  attachVehicleInfoInteractions();
}

function attachVehicleInfoInteractions() {
  settingsDetail.querySelectorAll("[data-vehicle-info-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      vehicleInfoState = toggleVehicleInfoFlag(vehicleInfoState, button.dataset.vehicleInfoToggle);
      rerenderVehicleInfoSettings();
    });
  });

  settingsDetail.querySelector("[data-open-release-note]")?.addEventListener("click", () => {
    vehicleInfoState = { ...vehicleInfoState, releaseNoteOpen: true };
    rerenderVehicleInfoSettings();
  });

  settingsDetail.querySelector("[data-vehicle-info-modal-close]")?.addEventListener("click", () => {
    vehicleInfoState = closeVehicleInfoModal(vehicleInfoState);
    rerenderVehicleInfoSettings();
  });
}

function renderGenericSettings(category) {
  const rows = GENERIC_SETTING_ROWS[category.id] || ["상태", "옵션", "자동 설정", "초기화"];
  const categoryState = genericSettingsState[category.id] || {};
  return `
    <div class="settings-title-row">
      <h1>${category.title}</h1>
    </div>
    <div class="generic-settings-grid">
      ${rows.map(
        (label, index) => `
          <button
            class="generic-setting-card${categoryState[label] ? " active" : ""}"
            type="button"
            data-generic-setting="${label}"
            aria-pressed="${Boolean(categoryState[label])}"
          >
            <span aria-hidden="true">${svgIcon(index % 2 ? category.icon : "settings")}</span>
            <strong>${label}</strong>
            <small>${categoryState[label] ? "켜짐" : "꺼짐"}</small>
          </button>
        `
      ).join("")}
    </div>
  `;
}

function attachGenericSettingsInteractions(category) {
  if (!genericSettingsState[category.id]) {
    genericSettingsState[category.id] = {};
  }

  settingsDetail.querySelectorAll("[data-generic-setting]").forEach((button) => {
    button.addEventListener("click", () => {
      const label = button.dataset.genericSetting;
      genericSettingsState[category.id][label] = !genericSettingsState[category.id][label];
      settingsDetail.innerHTML = renderGenericSettings(category);
      attachGenericSettingsInteractions(category);
    });
  });
}

function renderVehicleSettings() {
  const category = VEHICLE_SETTINGS.find((item) => item.id === activeSettingsId) || VEHICLE_SETTINGS[0];
  renderSettingsNav();

  if (category.id === "quick") {
    settingsDetail.innerHTML = renderQuickSettings();
    attachQuickSettingsInteractions();
    return;
  }

  if (category.id === "lights") {
    settingsDetail.innerHTML = renderLightsSettings();
    attachLightsInteractions();
    return;
  }

  if (category.id === "assist") {
    settingsDetail.innerHTML = renderAssistSettings();
    attachAssistInteractions();
    return;
  }

  if (category.id === "lock") {
    settingsDetail.innerHTML = renderLockSettings();
    return;
  }

  if (category.id === "seat-position") {
    settingsDetail.innerHTML = renderSeatSettings();
    attachSeatInteractions();
    return;
  }

  if (category.id === "climate-settings") {
    settingsDetail.innerHTML = renderClimateSettings();
    attachClimateInteractions();
    return;
  }

  if (category.id === "charging") {
    settingsDetail.innerHTML = renderChargingSettings();
    attachChargingInteractions();
    return;
  }

  if (category.id === "navigation-settings") {
    settingsDetail.innerHTML = renderNavigationSettings();
    attachNavigationInteractions();
    return;
  }

  if (category.id === "gleo-ai") {
    settingsDetail.innerHTML = renderGleoSettings();
    attachGleoInteractions();
    return;
  }

  if (category.id === "display") {
    settingsDetail.innerHTML = renderDisplaySettings();
    attachDisplayInteractions();
    return;
  }

  if (category.id === "sound") {
    settingsDetail.innerHTML = renderSoundSettings();
    attachSoundInteractions();
    return;
  }

  if (category.id === "security") {
    settingsDetail.innerHTML = renderSecuritySettings();
    return;
  }

  if (category.id === "profile") {
    settingsDetail.innerHTML = renderProfileSettings();
    attachProfileInteractions();
    return;
  }

  if (category.id === "convenience") {
    settingsDetail.innerHTML = renderConvenienceSettings();
    attachConvenienceInteractions();
    return;
  }

  if (category.id === "connection") {
    settingsDetail.innerHTML = renderConnectionSettings();
    attachConnectionInteractions();
    mountLottieLoaders(settingsDetail);
    return;
  }

  if (category.id === "apps-settings") {
    settingsDetail.innerHTML = renderAppsSettings();
    attachAppsSettingsInteractions();
    return;
  }

  if (category.id === "general") {
    settingsDetail.innerHTML = renderGeneralSettings();
    attachGeneralSettingsInteractions();
    return;
  }

  if (category.id === "vehicle-info") {
    settingsDetail.innerHTML = renderVehicleInfoSettings();
    attachVehicleInfoInteractions();
    return;
  }

  settingsDetail.innerHTML = renderGenericSettings(category);
  attachGenericSettingsInteractions(category);
}

function setActiveSurface(surface) {
  const showingApps = surface === "apps";
  const showingVehicle = surface === "vehicle";
  appsLayer.hidden = !showingApps;
  vehicleSettingsLayer.hidden = !showingVehicle;
  workspace.hidden = showingVehicle;
  mapEdgeResizer.hidden = showingApps || showingVehicle;
  enterEdit.disabled = showingApps || showingVehicle;
  dockHome?.classList.toggle("dock-active", surface === "home");
  document.querySelectorAll(".gnb-action[data-dock-action]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.dockAction === surface);
  });

  if ((showingApps || showingVehicle) && !editLayer.hidden) {
    editLayer.hidden = true;
    document.querySelector(".screen").classList.remove("is-editing");
  }
}

function toggleAppsSurface() {
  const isLauncherVisible = !appsLayer.hidden && !appsLayer.classList.contains("media-app-open");
  if (isLauncherVisible) {
    setActiveSurface("home");
    return;
  }

  renderApps();
  setActiveSurface("apps");
}

function toggleVehicleSettingsSurface() {
  openLandscapeSettingsApp("quick");
}

function openHomeSurface() {
  closeLandscapeApp();
}

function getNaverMapKeyId() {
  return isValidNaverMapKey(naverMapConfig.ncpKeyId) ? naverMapConfig.ncpKeyId : "";
}

function setMapStatus(message) {
  mapStatus.hidden = !message;
  mapStatus.textContent = message || "";
}

function loadNaverSdk() {
  if (window.naver?.maps?.Map) return Promise.resolve(window.naver);
  if (naverSdkPromise) return naverSdkPromise;

  const ncpKeyId = getNaverMapKeyId();
  if (!ncpKeyId) {
    return Promise.reject(new Error("Missing Naver Maps ncpKeyId"));
  }

  naverSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector("#naverMapsSdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.naver));
      existingScript.addEventListener("error", () => reject(new Error("Naver Maps SDK failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.id = "naverMapsSdk";
    script.src = toNaverMapsSdkUrl(ncpKeyId);
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps?.Map) {
        resolve(window.naver);
        return;
      }
      reject(new Error("Naver Maps SDK loaded without maps namespace"));
    };
    script.onerror = () => reject(new Error("Naver Maps SDK failed to load"));
    document.head.appendChild(script);
  });

  return naverSdkPromise;
}

function refreshNaverMap() {
  if (!naverMap || !window.naver?.maps) return;
  const center = naverMap.getCenter();

  requestAnimationFrame(() => {
    naver.maps.Event.trigger(naverMap, "resize");
    naverMap.setCenter(center);
  });
}

function createMarkerImage(className) {
  if (className === "vehicle-map-marker") {
    // Premium navigation chevron pointer (white outer circle, blue inner circle, white directional arrow)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="17" fill="white" stroke="#b0bec5" stroke-width="1.5" />
      <circle cx="20" cy="20" r="13" fill="#0068ff" />
      <path d="M20 9 L26 24 L20 20 L14 24 Z" fill="white" />
    </svg>`;
    return {
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      size: new naver.maps.Size(40, 40),
      anchor: new naver.maps.Point(20, 20)
    };
  } else {
    // Beautiful purple destination pin
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <path d="M18 0C8.1 0 0 8.1 0 18C0 29.7 16.5 42.9 17.2 43.5C17.4 43.7 17.7 43.8 18 43.8C18.3 43.8 18.6 43.7 18.8 43.5C19.5 42.9 36 29.7 36 18C36 8.1 27.9 0 18 0Z" fill="#7c4dff"/>
      <circle cx="18" cy="17" r="7" fill="white"/>
    </svg>`;
    return {
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      size: new naver.maps.Size(36, 44),
      anchor: new naver.maps.Point(18, 44)
    };
  }
}

function initNaverMap() {
  if (!mapCanvas) return;

  if (!getNaverMapKeyId()) {
    mapCanvas.classList.add("map-placeholder");
    setMapStatus(getNaverMapFailureMessage("missing-key"));
    return;
  }

  setMapStatus("Loading Naver map...");

  loadNaverSdk()
    .then(() => {
      let attempts = 0;
      
      function tryInitMap() {
        console.log("[Map Debug] Instant Canvas Size at Init:", mapCanvas.offsetWidth, "x", mapCanvas.offsetHeight);
        
        // Wait for container to have physical dimensions (non-zero) before rendering vector GL map
        if ((mapCanvas.offsetWidth === 0 || mapCanvas.offsetHeight === 0) && attempts < 15) {
          attempts++;
          setTimeout(tryInitMap, 100);
          return;
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              currentPosition.lat = lat;
              currentPosition.lng = lng;
              naverMapConfig.center = { lat, lng };
              proceedWithMapInit(lat, lng);
            },
            (error) => {
              console.warn("[Map Debug] Geolocation failed or denied, using default position:", error);
              proceedWithMapInit(naverMapConfig.center.lat, naverMapConfig.center.lng);
            },
            { timeout: 5000, enableHighAccuracy: true }
          );
        } else {
          proceedWithMapInit(naverMapConfig.center.lat, naverMapConfig.center.lng);
        }
      }

      function proceedWithMapInit(lat, lng) {
        const center = new naver.maps.LatLng(lat, lng);
        naverMap = new naver.maps.Map(mapCanvas, {
          center,
          zoom: naverMapConfig.zoom,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          locationControl: false,
          logoControlOptions: {
            position: naver.maps.Position.BOTTOM_LEFT
          },
          gl: true,
          customStyleId: "45c2abdd-a09b-4a64-a15a-9edb302e42a8"
        });

        window.mapInstance = naverMap;

        // Real-time traffic layer initialization is disabled due to custom map style rules

        vehicleMarker = new naver.maps.Marker({
          position: center,
          map: naverMap,
          icon: createMarkerImage("vehicle-map-marker")
        });

        searchMarker = new naver.maps.Marker({
          position: center,
          map: null,
          title: currentDestinationLabel,
          icon: createMarkerImage("search-map-marker")
        });

        naverMapReady = true;
        setMapStatus("");

        naver.maps.Event.addListener(naverMap, "dragstart", () => {
          isCameraTracking = false;
        });

        naver.maps.Event.addListener(naverMap, "zoom_changed", () => {
          if (currentRoutes && currentRoutes.length > 0) {
            redrawRoutesOnMap();
          }
        });
        
        setTimeout(() => {
          refreshNaverMap();
          // ── GL 권한 핵심 진단 ──────────────────────────────────────
          console.log("[Map Debug] naver.maps.glEnabled:", window.naver?.maps?.glEnabled);
          console.log("[Map Debug] gl 옵션:", naverMap._mapOptions?.gl);
          console.log("[Map Debug] 지도 타입:", naverMap.getMapTypeId());
          const testCanvas = document.createElement("canvas");
          const webgl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
          console.log("[Map Debug] 브라우저 WebGL 지원:", !!webgl);
          // ────────────────────────────────────────────────────────────
        }, 1000);
      }

      tryInitMap();
    })
    .catch(() => {
      mapCanvas.classList.add("map-placeholder");
      setMapStatus(getNaverMapFailureMessage("sdk-load"));
    });
}

function clearSearchResults() {
  searchResults.hidden = true;
  searchResults.innerHTML = "";
}

function renderSearchResults(results) {
  searchResults.innerHTML = "";
  results.slice(0, 5).forEach((place) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.innerHTML = `
      <strong>${place.name}</strong>
      <span>${place.roadAddress || place.address || place.category}</span>
    `;
    button.addEventListener("click", () => selectDestination(place));
    searchResults.appendChild(button);
  });
  searchResults.hidden = results.length === 0;
}

async function searchNaverPlaces(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    setMapStatus(getNaverMapFailureMessage("search-empty"));
    return;
  }

  if (!naverMapReady) {
    setMapStatus("Naver map is not ready.");
    return;
  }

  setMapStatus("Searching places...");

  try {
    const url = new URL("/api/local-search", window.location.href);
    url.searchParams.set("query", trimmedQuery);
    const response = await fetch(url);
    const payload = await response.json();

    if (!response.ok) {
      clearSearchResults();
      setMapStatus(payload.message || getNaverMapFailureMessage("search-failed"));
      return;
    }

    const results = (payload.items || [])
      .map(normalizeNaverLocalSearchItem)
      .filter((item) => Number.isFinite(item.lng) && Number.isFinite(item.lat));

    if (!results.length) {
      clearSearchResults();
      setMapStatus(getNaverMapFailureMessage("search-empty-result"));
      return;
    }

    setMapStatus("");
    renderSearchResults(results);
    selectDestination(results[0], false);
  } catch (error) {
    clearSearchResults();
    setMapStatus(error.message || getNaverMapFailureMessage("search-failed"));
  }
}

function selectDestination(place, requestRoute = true) {
  selectedDestination = {
    lng: Number(place.lng),
    lat: Number(place.lat),
    name: place.name
  };
  const position = new naver.maps.LatLng(selectedDestination.lat, selectedDestination.lng);
  searchMarker.setPosition(position);
  searchMarker.setTitle(selectedDestination.name);
  searchMarker.setMap(naverMap);
  naverMap.panTo(position);
  currentDestinationLabel = selectedDestination.name;
  if (destinationInput) destinationInput.value = selectedDestination.name;

  if (requestRoute) {
    requestRouteToDestination();
  }
}

async function requestRouteToDestination() {
  if (!selectedDestination) return;
  clearAutoGuideTimer();
  isRouteExpanded = false;
  setMapStatus("Calculating route...");

  const url = new URL("/api/directions", window.location.href);
  url.searchParams.set("origin", JSON.stringify(currentPosition));
  url.searchParams.set("destination", JSON.stringify(selectedDestination));
  url.searchParams.set("option", "traoptimal:trafast:tracomfort");

  try {
    const response = await fetch(url);
    const payload = await response.json();

    if (!response.ok) {
      setMapStatus(payload.message || "Route calculation failed.");
      return;
    }

    const routes = extractMultipleNaverRoutes(payload);
    renderRouteOptions(routes);
    setMapStatus("");
  } catch (error) {
    setMapStatus(error.message || "Route calculation failed.");
  }
}

function clearRouteOverlays() {
  routePolylinesList.forEach((p) => p.setMap(null));
  routePolylinesList = [];

  routeArrowMarkers.forEach((m) => m.setMap(null));
  routeArrowMarkers = [];

  routeDurationBubbles.forEach((b) => b.setMap(null));
  routeDurationBubbles = [];

  if (routePolyline) {
    routePolyline.setMap(null);
    routePolyline = null;
  }
}

function selectRoute(index) {
  selectedRouteIndex = index;
  const badge = document.getElementById("routeStartBadge");
  if (badge) badge.textContent = String(index + 1);

  // Update active style on options card list
  const items = document.querySelectorAll(".route-option-item");
  items.forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });

  redrawRoutes();
}

function redrawRoutes() {
  // Clear map path lines and markers
  routePolylinesList.forEach((p) => p.setMap(null));
  routePolylinesList = [];

  routeArrowMarkers.forEach((m) => m.setMap(null));
  routeArrowMarkers = [];

  routeDurationBubbles.forEach((b) => b.setMap(null));
  routeDurationBubbles = [];

  // Re-draw routes
  currentRoutes.forEach((route, i) => {
    const isSelected = i === selectedRouteIndex;
    drawRouteOnMap(route, i, isSelected);
  });
}

function calculateBearing(p1, p2) {
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function drawRouteOnMap(route, index, isSelected) {
  const pathPoints = route.path;
  if (pathPoints.length < 2) return;

  if (isSelected) {
    // 1. Draw outline (dark solid border for high contrast)
    const latLngPath = pathPoints.map((p) => new naver.maps.LatLng(p.lat, p.lng));
    const outlinePoly = new naver.maps.Polyline({
      map: naverMap,
      path: latLngPath,
      strokeColor: "#0f172a",
      strokeWeight: 11.0, // Increased thickness to show border clearly
      strokeOpacity: 0.95, // High contrast border opacity
      strokeLineCap: "round",
      strokeLineJoin: "round"
    });
    routePolylinesList.push(outlinePoly);

    // 2. Draw traffic colored segments on top (vibrant colors)
    if (route.sections && route.sections.length > 0) {
      // Draw a base color line for the entire path first to avoid gaps in sections
      const baseColorPoly = new naver.maps.Polyline({
        map: naverMap,
        path: latLngPath,
        strokeColor: "#00c73c", // Default to Vibrant Green (원활)
        strokeWeight: 6.5,
        strokeOpacity: 1.0,
        strokeLineCap: "round",
        strokeLineJoin: "round"
      });
      routePolylinesList.push(baseColorPoly);

      route.sections.forEach((sec) => {
        const startIdx = sec.pointIndex;
        const count = sec.pointCount;
        const endIdx = Math.min(startIdx + count, pathPoints.length);
        const segmentPoints = pathPoints.slice(startIdx, endIdx);
        if (segmentPoints.length < 2) return;

        let color = "#00c73c"; // 원활 (Vibrant Green)
        if (sec.congestion === 2) color = "#f59e0b"; // 서행 (Vibrant Orange)
        else if (sec.congestion === 3) color = "#ef4444"; // 정체 (Vibrant Red)

        const segmentPath = segmentPoints.map((p) => new naver.maps.LatLng(p.lat, p.lng));
        const colorPoly = new naver.maps.Polyline({
          map: naverMap,
          path: segmentPath,
          strokeColor: color,
          strokeWeight: 6.5,
          strokeOpacity: 1.0,
          strokeLineCap: "round",
          strokeLineJoin: "round"
        });
        routePolylinesList.push(colorPoly);
      });
    } else {
      // Mock segments division: Vibrant Green / Orange / Red
      const divide1 = Math.floor(pathPoints.length * 0.6);
      const divide2 = Math.floor(pathPoints.length * 0.8);

      const segments = [
        { start: 0, end: divide1, color: "#00c73c" },
        { start: Math.max(0, divide1 - 1), end: divide2, color: "#f59e0b" },
        { start: Math.max(0, divide2 - 1), end: pathPoints.length, color: "#ef4444" }
      ];

      segments.forEach((seg) => {
        const segmentPoints = pathPoints.slice(seg.start, seg.end);
        if (segmentPoints.length < 2) return;

        const segmentPath = segmentPoints.map((p) => new naver.maps.LatLng(p.lat, p.lng));
        const colorPoly = new naver.maps.Polyline({
          map: naverMap,
          path: segmentPath,
          strokeColor: seg.color,
          strokeWeight: 6.5,
          strokeOpacity: 1.0,
          strokeLineCap: "round",
          strokeLineJoin: "round"
        });
        routePolylinesList.push(colorPoly);
      });
    }

    // 3. Draw direction chevron arrows
    drawChevronsOnPath(pathPoints);
  } else {
    // Unselected path: thin, transparent gray/light-blue line
    const latLngPath = pathPoints.map((p) => new naver.maps.LatLng(p.lat, p.lng));
    const baseColor = index === 1 ? "#78909c" : "#90a4ae";
    const unselectedPoly = new naver.maps.Polyline({
      map: naverMap,
      path: latLngPath,
      strokeColor: baseColor,
      strokeWeight: 5.5,
      strokeOpacity: 0.6,
      strokeLineCap: "round",
      strokeLineJoin: "round"
    });
    routePolylinesList.push(unselectedPoly);
  }

  // 4. Draw route duration bubble marker
  // Avoid bubbles overlapping by offsetting midpoint indexes
  let bubbleIndex = Math.floor(pathPoints.length * 0.5);
  if (index === 0) bubbleIndex = Math.floor(pathPoints.length * 0.42);
  else if (index === 1) bubbleIndex = Math.floor(pathPoints.length * 0.54);
  else if (index === 2) bubbleIndex = Math.floor(pathPoints.length * 0.66);

  const bubblePoint = pathPoints[bubbleIndex];
  if (bubblePoint) {
    const bubbleMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(bubblePoint.lat, bubblePoint.lng),
      map: naverMap,
      icon: {
        content: `
          <div class="route-duration-bubble ${isSelected ? "active" : ""}">
            <span class="bubble-opt-num">${index + 1}</span>
            <span>${route.durationText}</span>
          </div>
        `,
        anchor: new naver.maps.Point(32, 34)
      }
    });

    naver.maps.Event.addListener(bubbleMarker, "click", () => {
      selectRoute(index);
    });

    routeDurationBubbles.push(bubbleMarker);
  }
}

function getHaversineDistance(p1, p2) {
  const R = 6378137; // Earth's radius in meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function drawChevronsOnPath(pathPoints) {
  if (pathPoints.length < 2) return;

  const zoom = naverMap ? naverMap.getZoom() : 15;
  
  // Spacing dynamically scales with zoom level to prevent crowding when zoomed out
  let targetInterval;
  if (zoom >= 17) {
    targetInterval = 80;
  } else if (zoom === 16) {
    targetInterval = 120;
  } else if (zoom === 15) {
    targetInterval = 250;
  } else if (zoom === 14) {
    targetInterval = 500;
  } else if (zoom === 13) {
    targetInterval = 1000;
  } else {
    // Zoom < 13: Do not draw any chevrons to avoid cluttering and visual issues
    return;
  }

  let accumulatedDistance = 0;

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];
    if (!p1 || !p2) continue;

    let segmentDist = getHaversineDistance(p1, p2);
    if (segmentDist === 0) continue;

    let currentLat = p1.lat;
    let currentLng = p1.lng;

    while (accumulatedDistance + segmentDist >= targetInterval) {
      const neededDist = targetInterval - accumulatedDistance;
      const ratio = neededDist / segmentDist;

      // Interpolate coordinates
      const interpLat = currentLat + (p2.lat - currentLat) * ratio;
      const interpLng = currentLng + (p2.lng - currentLng) * ratio;

      const angle = calculateBearing({ lat: currentLat, lng: currentLng }, p2);

      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(interpLat, interpLng),
        map: naverMap,
        icon: {
          content: `
            <div style="transform: rotate(${angle}deg); width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; transform-origin: center center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 12 12" style="display: block;">
                <path d="M2 9 L6 4 L10 9" fill="none" stroke="#000000" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"/>
                <path d="M2 9 L6 4 L10 9" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          `,
          anchor: new naver.maps.Point(7, 7)
        }
      });

      marker.setClickable(false);
      routeArrowMarkers.push(marker);

      // Advance starting point of remaining segment
      currentLat = interpLat;
      currentLng = interpLng;
      accumulatedDistance = 0;
      segmentDist = getHaversineDistance({ lat: currentLat, lng: currentLng }, p2);

      if (segmentDist < 0.1) {
        break;
      }
    }

    accumulatedDistance += segmentDist;
  }
}

function renderRouteOptions(routes) {
  currentRoutes = routes;

  const container = document.getElementById("routeOptionsList");
  if (!container) return;

  routeDestination.textContent = selectedDestination.name;

  // Render 3 routes initially, expand to 5 if isRouteExpanded is true
  const routesToRender = isRouteExpanded ? routes : routes.slice(0, 3);

  // If we just rendered the initial state (3 routes), start the 5s auto-guidance timer
  if (!isRouteExpanded) {
    selectedRouteIndex = 0;
    startAutoGuideTimer();
  }

  // Update card footer (More button) visibility
  if (routeCardFooter) {
    routeCardFooter.style.display = (!isRouteExpanded && routes.length > 3) ? "flex" : "none";
  }

  // Build items HTML
  container.innerHTML = routesToRender.map((route, i) => {
    const isActive = i === selectedRouteIndex ? "active" : "";
    const num = i + 1;

    // Arrival ETA calculation
    const now = new Date();
    now.setMilliseconds(now.getMilliseconds() + route.duration);
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampmEn = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 || 12;
    const formattedHourStr = String(formattedHour).padStart(2, "0");
    const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
    const etaTextEn = `${formattedHourStr}:${formattedMin} ${ampmEn}`;

    // Battery estimations based on route distance
    const batteryLeft = Math.max(0, 95 - Math.round(route.distance / 3500));
    const batteryRound = Math.max(0, 95 - Math.round((route.distance * 2) / 3500));

    // Distance and Duration localization
    const durationMin = Math.round(route.duration / 60000);
    const distanceKm = Math.round(route.distance / 1000);

    return `
      <button class="route-option-item ${isActive}" type="button" data-route-opt-index="${i}">
        <div class="route-opt-header">
          <span class="route-opt-num">${num}</span>
          <span class="route-opt-name">${route.name}</span>
          <span class="route-opt-sub">자율주행 가능 구간 ${route.autonomousPct}%</span>
        </div>
        <div class="route-opt-body-grid">
          <!-- Row 1: Time (Left), ETA (Center), Distance (Right) -->
          <div class="route-opt-time">${durationMin}분</div>
          <div class="route-opt-eta">${etaTextEn}</div>
          <div class="route-opt-meta route-opt-dist">${distanceKm}km</div>
          
          <!-- Row 2: Fare (Left), Blank (Center), Battery (Right) -->
          <div class="route-opt-fare">${(route.taxiFare || 0).toLocaleString("ko-KR")}원</div>
          <div></div>
          <div class="route-opt-battery">
            <svg class="battery-icon filled" viewBox="0 0 24 24" aria-hidden="true" style="vertical-align: middle; width: 16px; height: 10px;">
              <rect x="1" y="4" width="18" height="14" rx="2" fill="currentColor"/>
              <rect x="20" y="8" width="3" height="6" rx="1" fill="currentColor"/>
            </svg>
            <span class="battery-text">${batteryLeft}%</span>
          </div>
        </div>
        ${isActive ? `
        <div class="route-opt-footer">
          왕복 주행 후 예상 ${batteryRound}%
        </div>
        ` : ""}
      </button>
    `;
  }).join("");

  // Attach click listeners to route list items
  container.querySelectorAll("[data-route-opt-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      clearAutoGuideTimer(); // Stop timer when user manually selects a route
      const idx = Number(btn.dataset.routeOptIndex);
      selectRoute(idx);
    });
  });

  // Fit bounds to show all options
  const bounds = new naver.maps.LatLngBounds();
  routesToRender.forEach((r) => {
    r.path.forEach((pt) => bounds.extend(new naver.maps.LatLng(pt.lat, pt.lng)));
  });
  bounds.extend(new naver.maps.LatLng(currentPosition.lat, currentPosition.lng));
  bounds.extend(new naver.maps.LatLng(selectedDestination.lat, selectedDestination.lng));
  naverMap.fitBounds(bounds);

  redrawRoutes();

  routeCard.hidden = false;
  routeCard.classList.remove("route-card-enter");
  void routeCard.offsetWidth; // force reflow
  routeCard.classList.add("route-card-enter");
}

/* ===== Navigation Simulation and Controls ===== */

function startAutoGuideTimer() {
  clearAutoGuideTimer();
  
  const badgeContainer = document.querySelector("#routeTimerBadge");
  if (badgeContainer) {
    badgeContainer.style.display = "flex";
  }
  
  routeStartRemainingSeconds = 5;
  updateTimerBadgeUI();
  
  routeStartTimerId = window.setInterval(() => {
    routeStartRemainingSeconds--;
    updateTimerBadgeUI();
    
    if (routeStartRemainingSeconds <= 0) {
      clearAutoGuideTimer();
      startNavigation();
    }
  }, 1000);
}

function updateTimerBadgeUI() {
  const badge = document.querySelector("#routeStartBadge");
  const progress = document.querySelector("#timerProgress");
  
  if (badge) {
    badge.textContent = routeStartRemainingSeconds;
  }
  if (progress) {
    const pct = (routeStartRemainingSeconds / 5) * 100;
    progress.setAttribute("stroke-dasharray", `${pct}, 100`);
  }
}

function clearAutoGuideTimer() {
  if (routeStartTimerId) {
    window.clearInterval(routeStartTimerId);
    routeStartTimerId = null;
  }
  const badgeContainer = document.querySelector("#routeTimerBadge");
  if (badgeContainer) {
    badgeContainer.style.display = "none";
  }
}

function startNavigation() {
  clearAutoGuideTimer();
  const selectedRoute = currentRoutes[selectedRouteIndex];
  if (!selectedRoute) return;

  navState.isNavigating = true;
  navState.currentRoute = selectedRoute;

  // Hide settings/search layouts and route card
  routeCard.hidden = true;
  if (searchMarker) searchMarker.setMap(null); // Hide destination pin since we are starting navigation

  // Setup Guidance HUD and ETA Bar values
  navGuidanceHud.hidden = false;
  navEtaBar.hidden = false;

  navEtaDest.textContent = selectedDestination.name;

  // Initialize simulation variables
  navSimState.guideIndex = 0;
  navSimState.remainingMeters = selectedRoute.distance;
  navSimState.vehiclePath = selectedRoute.path;
  navSimState.vehiclePathIndex = 0;

  // Set vehicle initial position and heading
  if (naverMapReady && vehicleMarker) {
    const firstPoint = selectedRoute.path[0];
    if (firstPoint) {
      const pos = new naver.maps.LatLng(firstPoint.lat, firstPoint.lng);
      vehicleMarker.setPosition(pos);
      naverMap.panTo(pos);
      naverMap.setZoom(16); // Zoom in closer for navigation view
    }
  }

  // Clear unselected route lines and bubbles from map
  redrawRoutesForNavigation();

  // Update HUD and ETA bar immediately before starting the interval
  updateNavigationSimulation();

  // Start tick simulation
  navSimState.intervalId = window.setInterval(updateNavigationSimulation, 1000);
  navSimState.vehicleMoveIntervalId = window.setInterval(moveVehicleMarkerSimulation, 250);
}

function stopNavigation() {
  navState.isNavigating = false;
  navState.currentRoute = null;

  // Stop active intervals
  if (navSimState.intervalId) {
    window.clearInterval(navSimState.intervalId);
    navSimState.intervalId = null;
  }
  if (navSimState.vehicleMoveIntervalId) {
    window.clearInterval(navSimState.vehicleMoveIntervalId);
    navSimState.vehicleMoveIntervalId = null;
  }

  // Hide active navigation HUDs
  navGuidanceHud.hidden = true;
  navEtaBar.hidden = true;

  // Reset markers
  if (naverMapReady && vehicleMarker) {
    const defaultCenter = new naver.maps.LatLng(naverMapConfig.center.lat, naverMapConfig.center.lng);
    vehicleMarker.setPosition(defaultCenter);
    vehicleMarker.setAngle(0);
    naverMap.panTo(defaultCenter);
    naverMap.setZoom(naverMapConfig.zoom);
  }

  // Clear route polylines & arrows
  clearRouteOverlays();
  if (searchMarker) searchMarker.setMap(null);
  selectedDestination = null;
  currentDestinationLabel = "Current position";

  if (destinationInput) destinationInput.value = "";
  setMapStatus("");
}

function redrawRoutesForNavigation() {
  // During navigation, we only draw the active selected route
  routePolylinesList.forEach((p) => p.setMap(null));
  routePolylinesList = [];
  routeArrowMarkers.forEach((m) => m.setMap(null));
  routeArrowMarkers = [];
  routeDurationBubbles.forEach((b) => b.setMap(null));
  routeDurationBubbles = [];

  // Draw ONLY the selected route
  const activeRoute = currentRoutes[selectedRouteIndex];
  if (activeRoute) {
    drawRouteOnMap(activeRoute, selectedRouteIndex, true);
  }
}

function getTurnArrowSvg(type) {
  const svgStyle = `xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;
  switch (type) {
    case 1: // 직진
      return `<svg ${svgStyle}><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
    case 2: // 좌회전
    case 7: // 좌측 도로
    case 14:
      return `<svg ${svgStyle}><path d="M12 19V11a4 4 0 0 0-4-4H5"></path><polyline points="9 3 5 7 9 11"></polyline></svg>`;
    case 3: // 우회전
    case 8: // 우측 도로
    case 15:
      return `<svg ${svgStyle}><path d="M12 19V11a4 4 0 0 1 4-4h3"></path><polyline points="15 3 19 7 15 11"></polyline></svg>`;
    case 4: // 완만한 좌회전
      return `<svg ${svgStyle}><path d="M12 19V13a5 5 0 0 0-2-4L5 5"></path><polyline points="5 10 5 5 10 5"></polyline></svg>`;
    case 5: // 완만한 우회전
      return `<svg ${svgStyle}><path d="M12 19V13a5 5 0 0 1 2-4L19 5"></path><polyline points="14 5 19 5 19 10"></polyline></svg>`;
    case 6: // 유턴
      return `<svg ${svgStyle}><path d="M8 19V9a4 4 0 0 1 8 0v10"></path><polyline points="12 15 8 19 4 15"></polyline></svg>`;
    case 24: // 목적지
      return `<svg ${svgStyle}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    default:
      // 기본 직진 화살표
      return `<svg ${svgStyle}><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
  }
}

function updateNavigationSimulation() {
  const route = navState.currentRoute;
  if (!route) return;

  const totalPoints = navSimState.vehiclePath ? navSimState.vehiclePath.length : 0;
  const progressRatio = navSimState.vehiclePathIndex / (totalPoints || 1);

  // Update remaining distance and time
  const remainingMeters = Math.max(0, Math.round(route.distance * (1 - progressRatio)));
  const remainingSeconds = Math.max(0, Math.round((route.duration / 1000) * (1 - progressRatio)));

  // Update ETA bar metrics
  navEtaDist.textContent = formatRouteDistance(remainingMeters);

  const minText = Math.max(1, Math.round(remainingSeconds / 60));
  navEtaTime.textContent = minText < 60 ? `${minText}분` : `${Math.floor(minText / 60)}시간 ${minText % 60}분`;

  // Calculate arrival time
  const arrival = new Date();
  arrival.setSeconds(arrival.getSeconds() + remainingSeconds);
  const hours = arrival.getHours();
  const minutes = arrival.getMinutes();
  const formattedHour = String(hours).padStart(2, "0");
  const formattedMin = String(minutes).padStart(2, "0");
  navEtaArrival.textContent = `${formattedHour}:${formattedMin}`;

  // Update Guidance HUD instructions based on guides array
  const totalGuides = route.guides ? route.guides.length : 0;
  if (totalGuides > 0) {
    const currentGuide = route.guides[navSimState.guideIndex];
    if (currentGuide) {
      navHudRoad.textContent = currentGuide.name;

      if (navHudArrow) {
        navHudArrow.innerHTML = getTurnArrowSvg(currentGuide.type);
      }

      // Interpolate remaining guide distance
      const guideDistanceFraction = Math.max(0, Math.round(currentGuide.distance * (1 - progressRatio * 2)));
      navHudDistance.textContent = `${guideDistanceFraction} m`;

      const nextGuide = route.guides[navSimState.guideIndex + 1];
      if (nextGuide) {
        navHudNextRoad.textContent = nextGuide.name;
      } else {
        navHudNextRoad.textContent = "목적지";
      }

      // Advance guide index when getting close
      if (progressRatio > (navSimState.guideIndex + 1) / totalGuides && navSimState.guideIndex < totalGuides - 1) {
        navSimState.guideIndex++;
      }
    }
  }

  // Check if we arrived at destination
  if (navSimState.vehiclePathIndex >= totalPoints - 1) {
    stopNavigation();
    setMapStatus("목적지에 도착했습니다.");
    setTimeout(() => {
      setMapStatus("");
    }, 4000);
  }
}

function moveVehicleMarkerSimulation() {
  const path = navSimState.vehiclePath;
  if (!path || path.length === 0) return;

  if (navSimState.vehiclePathIndex < path.length) {
    const pCurrent = path[navSimState.vehiclePathIndex];
    const pNext = path[navSimState.vehiclePathIndex + 1] || pCurrent;

    if (pCurrent && naverMapReady && vehicleMarker) {
      const position = new naver.maps.LatLng(pCurrent.lat, pCurrent.lng);
      vehicleMarker.setPosition(position);
      if (isCameraTracking) {
        naverMap.panTo(position);
      }

      // Rotate vehicle heading
      if (pNext !== pCurrent) {
        const heading = calculateBearing(pCurrent, pNext);
        vehicleMarker.setAngle(heading);
      }
    }

    navSimState.vehiclePathIndex++;
  }
}

function toggleTrafficLayer() {
  setMapStatus("커스텀 스타일 적용 중에는 실시간 교통정보를 사용할 수 없습니다.");
  setTimeout(() => {
    setMapStatus("");
  }, 3000);
}

/* ===== Pleos Connect Navigation Flow ===== */

function openNavSearch() {
  navState.view = "search";
  navState.query = "";
  navState.results = [];
  navState.selectedPlace = null;
  navSearchOverlay.hidden = false;
  navDetailCard.hidden = true;
  routeCard.hidden = true;
  navSearchInput.value = "";
  navClearBtn.hidden = true;
  renderNavSearchBody();
  requestAnimationFrame(() => navSearchInput.focus());
}

function closeNavSearch() {
  navState.view = "closed";
  navState.query = "";
  navState.results = [];
  navState.selectedPlace = null;
  navSearchOverlay.hidden = true;
  navDetailCard.hidden = true;
  clearNavResultMarkers();
  clearSearchResults();
}

function closeNavDetail() {
  navState.view = navState.results.length ? "results" : "closed";
  navState.selectedPlace = null;
  navDetailCard.hidden = true;
  if (navState.view === "closed") {
    closeNavSearch();
  }
}

function renderNavSearchBody() {
  const query = navState.query.trim();

  if (!query) {
    navSearchBody.innerHTML = `<p class="nav-empty-state">최근 검색한 기록이 없습니다.</p>`;
    navSearchTabs.hidden = false;
    return;
  }

  if (navState.results.length > 0) {
    navSearchTabs.hidden = true;
    renderNavResults(navState.results);
    return;
  }

  // Show suggestions based on query
  navSearchTabs.hidden = true;
  const initialSuggestions = [query];
  renderSuggestionList(initialSuggestions, query);
  fetchSearchSuggestions(query);
}

let suggestionAbortController = null;

async function fetchSearchSuggestions(query) {
  if (suggestionAbortController) {
    suggestionAbortController.abort();
  }
  suggestionAbortController = new AbortController();

  try {
    const url = new URL("/api/local-search", window.location.href);
    url.searchParams.set("query", query);
    const response = await fetch(url, { signal: suggestionAbortController.signal });
    if (response.ok) {
      const payload = await response.json();
      const items = payload.items || [];
      
      if (navSearchInput.value.trim() === query) {
        const suggestions = items.map(item => item.title.replace(/<[^>]*>/g, "")).slice(0, 5);
        if (suggestions.length === 0) {
          suggestions.push(query);
        }
        renderSuggestionList(suggestions, query);
      }
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Failed to fetch suggestions:", error);
    }
  }
}

function renderSuggestionList(suggestions, query) {
  navSearchBody.innerHTML = suggestions.map((s) => `
    <button class="nav-suggestion" type="button" data-suggestion="${escapeAttr(s)}">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
      <span>${highlightMatch(s, query)}</span>
    </button>
  `).join("");

  navSearchBody.querySelectorAll("[data-suggestion]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navSearchInput.value = btn.dataset.suggestion;
      navState.query = btn.dataset.suggestion;
      navClearBtn.hidden = false;
      performNavSearch(btn.dataset.suggestion);
    });
  });
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightMatch(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), `<mark>$1</mark>`);
}

function renderNavResults(results) {
  navSearchTabs.hidden = true;
  clearNavResultMarkers();

  navSearchBody.innerHTML = results.slice(0, 8).map((place, index) => {
    const num = index + 1;
    const colorClass = num <= 3 ? "primary" : "secondary";
    const distance = place.distance ? `${place.distance}` : "";
    const addressLine = place.roadAddress || place.address || place.category || "";
    const infoLine = [distance, addressLine].filter(Boolean).join(" · ");

    return `
      <button class="nav-result-item" type="button" data-result-index="${index}">
        <span class="nav-result-number ${colorClass}"><span>${num}</span></span>
        <div class="nav-result-info">
          <strong>${place.name}</strong>
          <span>${infoLine}</span>
        </div>
        <span class="nav-result-route-btn" data-route-index="${index}" aria-label="바로 안내">
          <svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </span>
      </button>
    `;
  }).join("");

  // Add numbered markers to map
  addNavResultMarkers(results);

  // Click on result item → show detail
  navSearchBody.querySelectorAll("[data-result-index]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const idx = Number(btn.dataset.resultIndex);
      const place = navState.results[idx];
      if (!place) return;

      // If user clicked the route button, go directly to route
      if (event.target.closest("[data-route-index]")) {
        setNavDestination(place);
        return;
      }

      openNavDetail(place);
    });
  });
}

function openNavDetail(place) {
  navState.view = "detail";
  navState.selectedPlace = place;

  navSearchOverlay.hidden = true;
  navDetailCard.hidden = false;
  navDetailName.textContent = place.name || "장소";
  navDetailAddress.textContent = place.roadAddress || place.address || "주소 정보 없음";
  navDetailPhone.textContent = place.telephone || "전화번호 없음";

  // Pan map to the selected place
  if (naverMapReady && place.lat && place.lng) {
    const position = new naver.maps.LatLng(place.lat, place.lng);
    searchMarker.setPosition(position);
    searchMarker.setTitle(place.name || "");
    searchMarker.setMap(naverMap);
    naverMap.panTo(position);
    naverMap.setZoom(14);
  }
}

function setNavDestination(place) {
  closeNavSearch();
  navDetailCard.hidden = true;
  clearNavResultMarkers();

  selectedDestination = {
    lng: Number(place.lng),
    lat: Number(place.lat),
    name: place.name
  };

  const position = new naver.maps.LatLng(selectedDestination.lat, selectedDestination.lng);
  searchMarker.setPosition(position);
  searchMarker.setTitle(selectedDestination.name);
  searchMarker.setMap(naverMap);
  naverMap.panTo(position);
  currentDestinationLabel = selectedDestination.name;

  requestRouteToDestination();
}

async function performNavSearch(query) {
  const trimmed = query.trim();
  if (!trimmed) return;

  if (!naverMapReady) {
    setMapStatus("Naver map is not ready.");
    return;
  }

  navSearchBody.innerHTML = `<p class="nav-empty-state">검색 중...</p>`;

  try {
    const url = new URL("/api/local-search", window.location.href);
    url.searchParams.set("query", trimmed);
    const response = await fetch(url);
    const payload = await response.json();

    if (!response.ok) {
      navSearchBody.innerHTML = `<p class="nav-empty-state">${payload.message || "검색에 실패했습니다."}</p>`;
      return;
    }

    const results = (payload.items || [])
      .map(normalizeNaverLocalSearchItem)
      .filter((item) => Number.isFinite(item.lng) && Number.isFinite(item.lat));

    if (!results.length) {
      navSearchBody.innerHTML = `<p class="nav-empty-state">검색 결과가 없습니다.</p>`;
      return;
    }

    // Calculate rough distance from current position
    results.forEach((place) => {
      const dLat = place.lat - currentPosition.lat;
      const dLng = place.lng - currentPosition.lng;
      const km = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      place.distance = `${Math.round(km)}km`;
    });

    navState.results = results;
    navState.view = "results";
    renderNavResults(results);

    // Fit map to show all results
    if (naverMapReady && results.length > 0) {
      const bounds = new naver.maps.LatLngBounds();
      results.forEach((p) => bounds.extend(new naver.maps.LatLng(p.lat, p.lng)));
      bounds.extend(new naver.maps.LatLng(currentPosition.lat, currentPosition.lng));
      naverMap.fitBounds(bounds);
    }
  } catch (error) {
    navSearchBody.innerHTML = `<p class="nav-empty-state">${error.message || "검색에 실패했습니다."}</p>`;
  }
}

function addNavResultMarkers(results) {
  clearNavResultMarkers();
  if (!naverMapReady) return;

  results.slice(0, 8).forEach((place, index) => {
    const num = index + 1;
    const colorClass = num <= 3 ? "primary" : "secondary";
    const bgColor = colorClass === "primary" ? "#5137f3" : "#696b74";

    const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <path d="M18 0C8 0 0 8 0 18s18 26 18 26 18-16 18-26S28 0 18 0z" fill="${bgColor}"/>
      <circle cx="18" cy="18" r="12" fill="${bgColor}"/>
      <text x="18" y="23" text-anchor="middle" fill="#fff" font-size="14" font-weight="800" font-family="Asta Sans">${num}</text>
    </svg>`;

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(place.lat, place.lng),
      map: naverMap,
      icon: {
        url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
        size: new naver.maps.Size(36, 44),
        anchor: new naver.maps.Point(18, 44)
      },
      title: place.name
    });

    naver.maps.Event.addListener(marker, "click", () => {
      openNavDetail(place);
    });

    navResultMarkers.push(marker);
  });
}

function clearNavResultMarkers() {
  navResultMarkers.forEach((m) => m.setMap(null));
  navResultMarkers = [];
}

function panToCurrentPosition() {
  if (!naverMapReady) return;
  isCameraTracking = true;
  const center = new naver.maps.LatLng(currentPosition.lat, currentPosition.lng);
  naverMap.panTo(center);
  naverMap.setZoom(naverMapConfig.zoom);
}

function zoomNaverMap(direction) {
  if (!naverMapReady) return;
  const delta = direction === "in" ? -1 : 1;
  
  const canvasEl = document.querySelector(".map-canvas");
  if (canvasEl) {
    const animClass = direction === "in" ? "map-zoom-in" : "map-zoom-out";
    canvasEl.classList.remove("map-zoom-in", "map-zoom-out");
    void canvasEl.offsetWidth; // force reflow
    canvasEl.classList.add(animClass);
    setTimeout(() => {
      canvasEl.classList.remove(animClass);
    }, 260);
  }
  
  naverMap.setZoom(Math.max(1, naverMap.getZoom() - delta));
}

function visibleCardLimit() {
  return 4;
}

function renderHome() {
  if (activeMediaHost === "landscape" && activeMediaApp) {
    if (activeMediaApp === "radio") renderRadioApp();
    else if (activeMediaApp === "phone") renderPhoneApp();
    else renderMediaApp();
    return;
  }

  const meta = MODE_META[activeMode];
  const limit = visibleCardLimit();
  const isNarrow = false;
  const visibleEntries = state[activeMode].slice(0, 4).map((id, index) => [id, index]);

  homeTitle.textContent = meta.title;
  if (destinationInput) destinationInput.value = currentDestinationLabel;
  playlist.textContent = meta.playlist;
  
  if (trackTitle) {
    if (isPlaying) {
      trackTitle.innerHTML = `${escapeHtml(meta.trackTitle)}<span class="eq-container" aria-hidden="true"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></span>`;
    } else {
      trackTitle.textContent = meta.trackTitle;
    }
  }
  
  artist.textContent = meta.artist;
  albumArt.textContent = meta.album;
  if (albumArt) {
    albumArt.classList.toggle("album-art-playing", isPlaying);
  }
  
  cardLimit.textContent = isNarrow ? "Expanded map" : "Up to 4 cards";
  workspace.classList.toggle("compact-cards", isNarrow);
  workspace.classList.toggle("narrow-workspace", isNarrow);

  shortcutGrid.innerHTML = "";
  visibleEntries.forEach(([id, index]) => {
    const card = document.createElement("button");
    card.type = "button";
    card.dataset.index = index;

    if (!id) {
      card.className = "shortcut-card empty-card";
      card.setAttribute("aria-label", "비어 있는 카드, long press to edit");
      card.innerHTML = `
        <span class="card-icon empty-card-icon" aria-hidden="true"></span>
        <span class="card-copy">
          <strong>비어 있음</strong>
          <span>설정된 앱이 없습니다.</span>
        </span>
      `;
    } else {
      const item = functionById(id);
      card.className = "shortcut-card";
      if (item.id === "energy") {
        card.classList.add("energy-card-charging");
      }
      card.classList.toggle("favorite-card", Boolean(FAVORITE_TILE_ITEMS[item.id]));
      card.setAttribute("aria-label", `${item.title} card, long press to edit`);
      card.innerHTML = `
        ${cardIcon(item)}
        <span class="card-copy">
          <strong>${item.title}</strong>
          <span>${item.desc}</span>
        </span>
        ${favoriteTileGrid(item.id)}
      `;
    }

    card.addEventListener("pointerdown", startLongPress);
    card.addEventListener("pointerup", cancelLongPress);
    card.addEventListener("pointerleave", cancelLongPress);
    card.addEventListener("pointercancel", cancelLongPress);
    card.addEventListener("click", handleCardClick);
    shortcutGrid.appendChild(card);
  });
}

function startLongPress(event) {
  longPressTriggered = false;
  longPressTimer = window.setTimeout(() => {
    longPressTriggered = true;
    openEditor();
  }, 1000);
}

function cancelLongPress() {
  window.clearTimeout(longPressTimer);
}

function launchAppOrWidget(id) {
  const settingsCategoryMap = {
    settings: "quick",
    vehicle: "quick",
    climate: "climate-settings",
    seat: "seat-position",
    energy: "charging",
    charging: "charging",
    ambience: "lights",
    "tire-pressure": "vehicle-info",
    "trip-meter": "vehicle-info",
    dashcam: "security",
    blackbox: "security",
    "parking-camera": "security",
    "journey-log": "general",
    "apps-settings": "apps-settings",
    bluetooth: "connection",
    carplay: "connection",
    mirroring: "connection"
  };

  if (id === "spotify" || id === "youtube" || id === "netflix") {
    rememberRecentApp(id);
    openLandscapeMediaApp(id);
    return;
  }

  if (id === "radio") {
    rememberRecentApp(id);
    openRadioApp();
    return;
  }

  if (id === "call" || id === "phone") {
    rememberRecentApp(id);
    openPhoneApp();
    return;
  }

  if (id === "music" || id === "media-player" || id === "app-market") {
    const title = functionById(id).title;
    alert(`${title} 앱은 현재 데모 모드로 실행할 수 없습니다.`);
    return;
  }

  if (id === "navigation" || id === "google-maps" || id === "nav-home") {
    rememberRecentApp(id);
    openHomeSurface();
    openNavSearch();
    return;
  }

  if (id === "android-auto") {
    rememberRecentApp(id);
    openLandscapeSettingsApp("apps-settings", { appSettingsView: "android-auto" });
    return;
  }

  if (id === "driving") {
    rememberRecentApp(id);
    openLandscapeSettingsApp("assist");
    return;
  }

  if (id === "gleo-ai") {
    rememberRecentApp(id);
    openLandscapeSettingsApp("gleo-ai");
    return;
  }

  if (id === "favorite-shortcuts" || id === "favorite-apps") {
    openLandscapeSettingsApp("convenience");
    return;
  }

  const targetSettingsCategory = settingsCategoryMap[id];
  if (targetSettingsCategory) {
    rememberRecentApp(id);
    openLandscapeSettingsApp(targetSettingsCategory);
    return;
  }

  const title = functionById(id).title;
  alert(`${title} 앱은 현재 데모 모드로 실행할 수 없습니다.`);
}

function handleCardClick(event) {
  if (longPressTriggered) {
    event.preventDefault();
    longPressTriggered = false;
    return;
  }

  const index = Number(event.currentTarget.dataset.index);
  const cardId = state[activeMode][index];
  if (!cardId) return;

  launchAppOrWidget(cardId);
}

function setDragGhost(event, el) {
  const rect = el.getBoundingClientRect();
  const ghost = el.cloneNode(true);
  ghost.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${rect.width}px;height:${rect.height}px;pointer-events:none;opacity:0.9;border-radius:12px;overflow:hidden;`;
  document.body.appendChild(ghost);
  event.dataTransfer.setDragImage(ghost, rect.width / 2, rect.height / 2);
  requestAnimationFrame(() => ghost.remove());
}

function renderPalette() {
  appPalette.innerHTML = "";

  EDIT_APPS.map(functionById).forEach((item) => {
    const app = document.createElement("button");
    app.className = "palette-app";
    app.type = "button";
    app.draggable = true;
    app.dataset.appId = item.id;
    app.innerHTML = `
      ${cardIcon(item)}
      <strong>${item.title}</strong>
    `;
    app.addEventListener("click", () => {
      selectedAppId = item.id;
      renderPalette();
    });
    app.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", item.id);
      event.dataTransfer.effectAllowed = "copy";
      setDragGhost(event, app);
    });
    app.classList.toggle("selected", selectedAppId === item.id);
    appPalette.appendChild(app);
  });
}

function renderEditSlots() {
  editSlots.forEach((slot) => {
    const index = Number(slot.dataset.widgetIndex);
    const appId = draftCards[index];
    if (!appId) {
      slot.className = "edit-slot widget-slot empty-slot";
      slot.draggable = true;
      slot.innerHTML = `
        <span class="empty-slot-icon" aria-hidden="true"></span>
        <strong class="empty-slot-label">비어 있음</strong>
      `;
      return;
    }
    const item = functionById(appId);
    slot.className = "edit-slot widget-slot";
    slot.draggable = true;
    slot.innerHTML = `
      ${cardIcon(item)}
      <strong>${item.title}</strong>
    `;
  });
}

function markDraftChanged() {
  const changed = draftCards.join("|") !== state[activeMode].join("|");
  saveEdit.disabled = !changed;
}

function applyAppToSlot(slotIndex, appId) {
  if (!appId) return;
  // Dedup: if this app is already in another slot, clear it from there first
  const existingIndex = draftCards.indexOf(appId);
  if (existingIndex !== -1 && existingIndex !== slotIndex) {
    draftCards[existingIndex] = null;
  }
  draftCards[slotIndex] = appId;
  selectedAppId = null;
  renderPalette();
  renderEditSlots();
  markDraftChanged();

  // Trigger double flash animation for the newly placed slot
  const targetSlot = Array.from(editSlots).find(
    (slot) => Number(slot.dataset.widgetIndex) === slotIndex
  );
  if (targetSlot) {
    targetSlot.classList.remove("slot-flash");
    void targetSlot.offsetWidth; // Reflow to restart animation
    targetSlot.classList.add("slot-flash");
    targetSlot.addEventListener("animationend", () => {
      targetSlot.classList.remove("slot-flash");
    }, { once: true });
  }
}

function moveWidget(fromIndex, toIndex) {
  if (fromIndex === null || fromIndex === toIndex) return;
  const next = [...draftCards];
  const [picked] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, picked);
  draftCards = next.slice(0, 4);
  draggedWidgetIndex = null;
  renderEditSlots();
  markDraftChanged();
}

function openEditor() {
  closeAllStatusOverlays();
  draftCards = [...state[activeMode]];
  while (draftCards.length < 4) {
    const fallback = EDIT_APPS.find((id) => !draftCards.includes(id));
    if (!fallback) break;
    draftCards.push(fallback);
  }
  selectedAppId = null;
  draggedWidgetIndex = null;
  renderPalette();
  renderEditSlots();
  markDraftChanged();
  editLayer.hidden = false;
  document.querySelector(".screen").classList.add("is-editing");
}

let modeToastTimer = null;

function showModeToast(mode) {
  if (!modeToast) return;
  modeToast.textContent = mode === "auto"
    ? "자율 주행 홈 화면으로 변경되었습니다"
    : "수동 운전 홈 화면으로 변경되었습니다";
  modeToast.classList.toggle("mode-auto", mode === "auto");
  modeToast.classList.toggle("mode-manual", mode === "manual");
  modeToast.hidden = false;
  modeToast.classList.add("show");
  window.clearTimeout(modeToastTimer);
  modeToastTimer = window.setTimeout(() => {
    modeToast.classList.remove("show");
    window.setTimeout(() => {
      if (!modeToast.classList.contains("show")) modeToast.hidden = true;
    }, 200);
  }, 3000);
}

function setMode(mode, options = {}) {
  if (!editLayer.hidden) return;
  const shouldAnnounce = Boolean(options.announce);
  if (activeMediaHost === "landscape" || !vehicleSettingsLayer.hidden || !appsLayer.hidden) {
    closeLandscapeApp({ renderHomeScreen: false });
  }
  modeTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  if (shouldAnnounce) {
    const panel = document.getElementById("panelLandscape");
    panel.classList.remove("mode-in");
    void panel.offsetWidth;
    panel.classList.add("mode-out");
    panel.addEventListener("animationend", function handler() {
      panel.removeEventListener("animationend", handler);
      activeMode = mode;
      currentDestinationLabel = MODE_META[mode].destination;
      renderHome();
      panel.classList.remove("mode-out");
      panel.classList.add("mode-in");
      triggerModeGlow();
      panel.addEventListener("animationend", () => panel.classList.remove("mode-in"), { once: true });
    }, { once: true });
    showModeToast(mode);
    return;
  }
  activeMode = mode;
  currentDestinationLabel = MODE_META[mode].destination;
  renderHome();
}

function triggerModeGlow() {
  const container = document.getElementById("homePanelContainer");
  if (!container) return;
  const old = container.querySelector(".mode-glow-ring");
  if (old) old.remove();
  const ring = document.createElement("div");
  ring.className = "mode-glow-ring";
  container.appendChild(ring);
  window.setTimeout(() => { if (ring.parentNode) ring.remove(); }, 3700);
}

function setMapWidth(value) {
  const nextWidth = FIXED_DRIVING_VIEW_WIDTH;
  const expansion = 0;
  const tileGridWidth = 100;
  workspace.style.setProperty("--map-width", `${nextWidth}%`);
  workspace.style.setProperty("--resize-left", `${nextWidth}%`);
  workspace.style.setProperty("--map-expansion", String(expansion));
  workspace.style.setProperty("--tile-grid-width", `${tileGridWidth}%`);
  if (mapEdgeResizer) {
    mapEdgeResizer.setAttribute("aria-valuenow", String(Math.round(nextWidth)));
  }
  state.mapWidth = nextWidth;
  saveState();
  renderHome();
  refreshNaverMap();
}

function previewMapResize(value) {
  const snappedValue = FIXED_DRIVING_VIEW_WIDTH;
  previewMapWidth = snappedValue;
  const expansion = 0;
  const tileGridWidth = 100;
  workspace.style.setProperty("--map-width", `${snappedValue}%`);
  workspace.style.setProperty("--resize-left", `${snappedValue}%`);
  workspace.style.setProperty("--map-expansion", String(expansion.toFixed(3)));
  workspace.style.setProperty("--tile-grid-width", `${tileGridWidth}%`);
  if (mapEdgeResizer) {
    mapEdgeResizer.setAttribute("aria-valuenow", String(Math.round(snappedValue)));
  }
  refreshNaverMap();
}

function resizeMapFromPointer(event) {
  const rect = workspace.getBoundingClientRect();
  previewMapResize(rawMapWidthFromPointer(event.clientX, rect));
}

function startMapResize(event) {
  isResizingMap = true;
  document.body.classList.add("is-map-resizing");
  resizeMapFromPointer(event);
  event.preventDefault();
}

function stopMapResize() {
  if (!isResizingMap) return;
  isResizingMap = false;
  document.body.classList.remove("is-map-resizing");
  setMapWidth(previewMapWidth ?? state.mapWidth);
  previewMapWidth = null;
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "오후" : "오전";
  hours = hours % 12;
  hours = hours ? hours : 12;
  clock.textContent = `${ampm} ${hours}:${minutes}`;
}

function triggerGnbBounce(element) {
  if (!element) return;
  element.classList.remove("gnb-icon-bounce");
  void element.offsetWidth; // Force reflow
  element.classList.add("gnb-icon-bounce");
  element.addEventListener("animationend", () => {
    element.classList.remove("gnb-icon-bounce");
  }, { once: true });
}

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode, { announce: true }));
});

dockHome?.addEventListener("click", openHomeSurface);
dock?.addEventListener("click", (event) => {
  const dockActionButton = event.target.closest("[data-dock-action]");
  if (dockActionButton) {
    const action = dockActionButton.dataset.dockAction;
    if (action === "home") {
      openHomeSurface();
      return;
    }

    if (action === "vehicle") {
      toggleVehicleSettingsSurface();
      return;
    }

    if (action === "apps") {
      toggleAppsSurface();
      return;
    }
  }

  const climateButton = event.target.closest("[data-gnb-climate-action]");
  if (climateButton) {
    const action = climateButton.dataset.gnbClimateAction;
    launcherClimateState[action] = !launcherClimateState[action];
    renderGnbClimateControls();
    if (!appsLayer.hidden) {
      renderApps();
    }
  }
});
gnbRecentApps?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  event.stopPropagation();

  if (button.dataset.dockAction === "home") {
    openHomeSurface();
    return;
  }

  if (button.dataset.appId) {
    launchAppOrWidget(button.dataset.appId);
  }
});
climateTempButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    adjustClimateTemperature(button.dataset.climateZone, Number(button.dataset.climateStep));
  });
});

climateKnobButtons.forEach((button) => {
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openClimateKnob(button.dataset.climateKnobZone, button);
  });
});

document.addEventListener("pointerdown", (event) => {
  if (!activeClimateKnobZone) return;
  if (event.target.closest(".gnb-climate-popover, [data-climate-knob-zone]")) return;
  closeClimateKnob();
});

renderClimateTemperatures();

mapEdgeResizer.addEventListener("pointerdown", (event) => {
  startMapResize(event);
  if (event.pointerId !== undefined) {
    mapEdgeResizer.setPointerCapture(event.pointerId);
  }
});

window.addEventListener("pointermove", (event) => {
  if (!isResizingMap) return;
  resizeMapFromPointer(event);
});

window.addEventListener("pointerup", stopMapResize);
window.addEventListener("pointercancel", stopMapResize);
mapEdgeResizer.addEventListener("lostpointercapture", stopMapResize);

mapEdgeResizer.addEventListener("mousedown", startMapResize);
window.addEventListener("mousemove", (event) => {
  if (!isResizingMap) return;
  resizeMapFromPointer(event);
});
window.addEventListener("mouseup", stopMapResize);

mapEdgeResizer.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  setMapWidth(FIXED_DRIVING_VIEW_WIDTH);
});

enterEdit.addEventListener("click", openEditor);
mapSearch?.addEventListener("submit", (event) => {
  event.preventDefault();
  searchNaverPlaces(destinationInput?.value || currentDestinationLabel);
});

/* ===== Navigation Event Listeners ===== */

navSearchTrigger?.addEventListener("click", () => {
  openNavSearch();
});

/* ===== Status Bar Event Listeners ===== */

navSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = navSearchInput?.value.trim();
  if (query) {
    navState.query = query;
    performNavSearch(query);
  }
});

navSearchInput?.addEventListener("input", () => {
  const value = navSearchInput.value;
  navState.query = value;
  navClearBtn.hidden = !value;

  if (!value.trim()) {
    navState.results = [];
    renderNavSearchBody();
    return;
  }

  // Show suggestions while typing (don't trigger API search yet)
  if (navState.results.length === 0) {
    renderNavSearchBody();
  }
});

navClearBtn?.addEventListener("click", () => {
  navSearchInput.value = "";
  navState.query = "";
  navState.results = [];
  navClearBtn.hidden = true;
  clearNavResultMarkers();
  renderNavSearchBody();
  navSearchInput.focus();
});

navCloseBtn?.addEventListener("click", closeNavSearch);

navBackBtn?.addEventListener("click", () => {
  if (navState.results.length > 0) {
    navState.view = "results";
    navState.selectedPlace = null;
    navDetailCard.hidden = true;
    navSearchOverlay.hidden = false;
    navSearchInput.value = navState.query;
    navClearBtn.hidden = !navState.query;
    renderNavResults(navState.results);
  } else {
    closeNavDetail();
  }
});

navDetailCloseBtn?.addEventListener("click", () => {
  closeNavSearch();
  navDetailCard.hidden = true;
  clearNavResultMarkers();
  if (searchMarker) searchMarker.setMap(null);
});

navSetDestBtn?.addEventListener("click", () => {
  if (navState.selectedPlace) {
    setNavDestination(navState.selectedPlace);
  }
});

navMyLocationBtn?.addEventListener("click", panToCurrentPosition);

routeStartBtn?.addEventListener("click", () => {
  startNavigation();
});

navStopBtn?.addEventListener("click", () => {
  stopNavigation();
});

routeCardCloseBtn?.addEventListener("click", () => {
  clearAutoGuideTimer();
  isRouteExpanded = false;
  routeCard.hidden = true;
  clearRouteOverlays();
  if (searchMarker) searchMarker.setMap(null);
  selectedDestination = null;
});

routeMoreBtn?.addEventListener("click", () => {
  clearAutoGuideTimer();
  isRouteExpanded = true;
  renderRouteOptions(currentRoutes);
});

navMapSettingsBtn?.addEventListener("click", () => {
  toggleTrafficLayer();
});

document.querySelectorAll("[data-map-zoom]").forEach((button) => {
  button.addEventListener("click", () => {
    zoomNaverMap(button.dataset.mapZoom);
  });
});

editSlots.forEach((slot) => {
  slot.addEventListener("click", () => {
    applyAppToSlot(Number(slot.dataset.widgetIndex), selectedAppId);
  });
  slot.addEventListener("dragstart", (event) => {
    draggedWidgetIndex = Number(slot.dataset.widgetIndex);
    event.dataTransfer.setData("application/x-widget-index", String(draggedWidgetIndex));
    event.dataTransfer.effectAllowed = "move";
    setDragGhost(event, slot);
  });
  slot.addEventListener("dragover", (event) => {
    event.preventDefault();
    slot.classList.add("drag-over");
  });
  slot.addEventListener("dragleave", () => {
    slot.classList.remove("drag-over");
  });
  slot.addEventListener("drop", (event) => {
    event.preventDefault();
    slot.classList.remove("drag-over");
    const slotIndex = Number(slot.dataset.widgetIndex);
    const appId = event.dataTransfer.getData("text/plain");
    const widgetIndex = event.dataTransfer.getData("application/x-widget-index");

    if (appId) {
      applyAppToSlot(slotIndex, appId);
      return;
    }

    if (widgetIndex !== "") {
      moveWidget(Number(widgetIndex), slotIndex);
    }
  });
});

// ── Touch Drag-and-Drop emulation (Android / Samsung Browser) ──────────────
// HTML5 DnD API is not fired on Android touch events.
// We emulate it using touchstart / touchmove / touchend on the editLayer.
(function initTouchDnD() {
  if (navigator.maxTouchPoints === 0 && !("ontouchstart" in window)) return;

  let drag = null; // active drag state

  function findSlot(x, y) {
    // Temporarily hide the ghost so elementFromPoint sees what's underneath
    if (drag?.ghost) drag.ghost.style.visibility = "hidden";
    const el = document.elementFromPoint(x, y);
    if (drag?.ghost) drag.ghost.style.visibility = "";
    return el ? el.closest("[data-widget-index]") : null;
  }

  function clearHighlights() {
    editLayer.querySelectorAll(".edit-slot.drag-over").forEach((s) =>
      s.classList.remove("drag-over")
    );
  }

  editLayer.addEventListener("touchstart", (e) => {
    const origin = e.target.closest(".palette-app, .edit-slot");
    if (!origin) return;
    const t = e.touches[0];
    drag = {
      origin,
      appId: origin.classList.contains("palette-app") ? origin.dataset.appId : null,
      widgetIndex: origin.hasAttribute("data-widget-index")
        ? Number(origin.dataset.widgetIndex)
        : null,
      startX: t.clientX,
      startY: t.clientY,
      ghost: null,
      started: false,
    };
  }, { passive: true });

  editLayer.addEventListener("touchmove", (e) => {
    if (!drag) return;
    const t = e.touches[0];
    const dx = t.clientX - drag.startX;
    const dy = t.clientY - drag.startY;

    // Start drag only after moving 8 px (distinguishes tap from drag)
    if (!drag.started) {
      if (Math.sqrt(dx * dx + dy * dy) < 8) return;
      drag.started = true;

      // Create ghost element
      const rect = drag.origin.getBoundingClientRect();
      const g = drag.origin.cloneNode(true);
      g.style.cssText = [
        "position:fixed",
        `width:${rect.width}px`,
        `height:${rect.height}px`,
        "pointer-events:none",
        "opacity:0.88",
        "border-radius:12px",
        "z-index:9999",
        "transform:scale(1.06)",
        "box-shadow:0 8px 28px rgba(0,0,0,0.28)",
        "transition:transform 100ms ease",
        `left:${rect.left}px`,
        `top:${rect.top}px`,
      ].join(";");
      document.body.appendChild(g);
      drag.ghost = g;
    }

    e.preventDefault(); // Prevent page scroll during drag

    // Move ghost centered on finger
    const gw = parseFloat(drag.ghost.style.width);
    const gh = parseFloat(drag.ghost.style.height);
    drag.ghost.style.left = `${t.clientX - gw / 2}px`;
    drag.ghost.style.top  = `${t.clientY - gh / 2}px`;

    // Highlight slot under finger
    const slot = findSlot(t.clientX, t.clientY);
    clearHighlights();
    if (slot) slot.classList.add("drag-over");
  }, { passive: false });

  function onTouchEnd(e) {
    if (!drag) return;
    clearHighlights();

    if (drag.started) {
      const t = e.changedTouches[0];
      drag.ghost?.remove();
      const slot = findSlot(t.clientX, t.clientY);
      if (slot) {
        const slotIndex = Number(slot.dataset.widgetIndex);
        if (drag.appId) {
          applyAppToSlot(slotIndex, drag.appId);
        } else if (drag.widgetIndex !== null) {
          moveWidget(drag.widgetIndex, slotIndex);
        }
      }
    }
    drag = null;
  }

  editLayer.addEventListener("touchend",    onTouchEnd);
  editLayer.addEventListener("touchcancel", onTouchEnd);
}());
// ────────────────────────────────────────────────────────────────────────────

cancelEdit.addEventListener("click", () => {
  editLayer.hidden = true;
  document.querySelector(".screen").classList.remove("is-editing");
  selectedAppId = null;
  draggedWidgetIndex = null;
});

saveEdit.addEventListener("click", () => {
  state[activeMode] = [...draftCards];
  saveState();
  editLayer.hidden = true;
  document.querySelector(".screen").classList.remove("is-editing");
  renderHome();
});

// 미디어 시뮬레이션 데이터 및 제어 로직
const SIMULATED_PLAYLIST = [
  { trackTitle: "Drive Mix", artist: "Elysia Biro", album: "flow", playlist: "Manual focus" },
  { trackTitle: "City lights", artist: "Retro Synth", album: "neon", playlist: "Night Cruise" },
  { trackTitle: "Retro Groove", artist: "Da Funk", album: "groove", playlist: "Retro Funk" }
];
let currentPlaylistIndex = 0;
let isPlaying = false;

function updateMediaUI() {
  let trackName, artistName, playlistName, albumName;
  if (activeMediaItem) {
    const meta = MEDIA_APP_META[activeMediaApp];
    trackName = activeMediaItem.title;
    artistName = activeMediaItem.creator;
    playlistName = meta?.title || "Media";
    albumName = activeMediaApp === "spotify" ? "sp" : "yt";
  } else {
    const meta = SIMULATED_PLAYLIST[currentPlaylistIndex];
    trackName = meta.trackTitle;
    artistName = meta.artist;
    playlistName = meta.playlist;
    albumName = meta.album;
  }
  
  // Landscape
  if (trackTitle) {
    if (isPlaying) {
      trackTitle.innerHTML = `${escapeHtml(trackName)}<span class="eq-container" aria-hidden="true"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></span>`;
    } else {
      trackTitle.textContent = trackName;
    }
  }
  if (artist) artist.textContent = artistName;
  if (playlist) playlist.textContent = playlistName;
  if (albumArt) {
    albumArt.textContent = albumName;
    albumArt.classList.toggle("album-art-playing", isPlaying);
  }
  
  // Play button state update
  const playBtn = document.getElementById("playBtn");
  if (isPlaying) {
    playBtn?.classList.add("playing");
  } else {
    playBtn?.classList.remove("playing");
  }
}

function handlePlayToggle() {
  isPlaying = !isPlaying;
  updateMediaUI();
}

function handleNextTrack() {
  if (activeMediaItem && activeMediaApp) {
    const meta = MEDIA_APP_META[activeMediaApp];
    if (meta) {
      const results = mediaResultsForActiveApp().filter((item) => item.type === meta.type);
      const idx = results.findIndex((item) => item.id === activeMediaItem.id);
      if (idx !== -1) {
        activeMediaItem = results[(idx + 1) % results.length];
        selectedMediaId = activeMediaItem.id;
        isPlaying = true;
        updateMediaUI();
        if (activeMediaApp) renderMediaApp();
        return;
      }
    }
  }
  activeMediaItem = null;
  currentPlaylistIndex = (currentPlaylistIndex + 1) % SIMULATED_PLAYLIST.length;
  isPlaying = true;
  updateMediaUI();
}

function handlePrevTrack() {
  if (activeMediaItem && activeMediaApp) {
    const meta = MEDIA_APP_META[activeMediaApp];
    if (meta) {
      const results = mediaResultsForActiveApp().filter((item) => item.type === meta.type);
      const idx = results.findIndex((item) => item.id === activeMediaItem.id);
      if (idx !== -1) {
        activeMediaItem = results[(idx - 1 + results.length) % results.length];
        selectedMediaId = activeMediaItem.id;
        isPlaying = true;
        updateMediaUI();
        if (activeMediaApp) renderMediaApp();
        return;
      }
    }
  }
  activeMediaItem = null;
  currentPlaylistIndex = (currentPlaylistIndex - 1 + SIMULATED_PLAYLIST.length) % SIMULATED_PLAYLIST.length;
  isPlaying = true;
  updateMediaUI();
}

// 미디어 컨트롤 리스너 바인딩
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");

prevBtn?.addEventListener("click", handlePrevTrack);
playBtn?.addEventListener("click", handlePlayToggle);
nextBtn?.addEventListener("click", handleNextTrack);

setMapWidth(FIXED_DRIVING_VIEW_WIDTH);
setMode(activeMode);
renderRecentDockApps();
renderApps();
renderVehicleSettings();
setActiveSurface("home");
initNaverMap();
updateClock();
window.setInterval(updateClock, 30_000);

document.querySelectorAll("[data-static-icon]").forEach((icon) => {
  icon.innerHTML = svgIcon(icon.dataset.staticIcon);
});

document.querySelectorAll(".ui-icon").forEach((icon) => {
  const iconClass = [...icon.classList].find((name) => name.endsWith("-icon") && name !== "ui-icon");
  if (!iconClass) return;
  icon.innerHTML = svgIcon(iconClass.replace("-icon", ""));
});

/* ===== 상태바 팝업 카드 및 글로벌 검색 인터랙션 ===== */

// DOM 요소 취득
const statusBarVolumeBtn = document.getElementById("statusBarVolumeBtn");
const statusBarProfileBtn = document.getElementById("statusBarProfileBtn");
const statusBarSearchBtn = document.getElementById("statusBarSearchBtn");
const statusBarNotificationBtn = document.getElementById("statusBarNotificationBtn");
const statusBarBluetoothBtn = document.getElementById("statusBarBluetoothBtn");
const statusBarWifiBtn = document.getElementById("statusBarWifiBtn");

const statusFullscreenBtn = document.getElementById("statusFullscreenBtn");
if (statusFullscreenBtn) {
  const updateFullscreenIcon = () => {
    const isFs = !!document.fullscreenElement;
    const iconEl = statusFullscreenBtn.querySelector(".status-icon");
    if (iconEl) iconEl.innerHTML = svgIcon(isFs ? "fullscreen-exit" : "fullscreen");
  };
  statusFullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
  document.addEventListener("fullscreenchange", updateFullscreenIcon);
}

const statusBarVolumeCard = document.getElementById("statusBarVolumeCard");
const statusBarProfileCard = document.getElementById("statusBarProfileCard");
const statusBarNotificationCard = document.getElementById("statusBarNotificationCard");
const globalSearchOverlay = document.getElementById("globalSearchOverlay");

const volumeCardSlider = document.getElementById("volumeCardSlider");
const volumeCardMuteBtn = document.getElementById("volumeCardMuteBtn");
const volumeCardDecBtn = document.getElementById("volumeCardDecBtn");
const volumeCardIncBtn = document.getElementById("volumeCardIncBtn");
const volumeCardSettingsBtn = document.getElementById("volumeCardSettingsBtn");

const profileDriverBtn = document.getElementById("profileDriverBtn");
const profileValetBtn = document.getElementById("profileValetBtn");
const profileSettingsBtn = document.getElementById("profileSettingsBtn");

const globalSearchInput = document.getElementById("globalSearchInput");
const globalSearchCloseBtn = document.getElementById("globalSearchCloseBtn");

// 상태 보관
let lastVolume = 70;
let isMuted = false;

// 공통: 모든 상태바 팝업 닫기
function closeAllStatusPopovers() {
  statusBarVolumeCard?.setAttribute("hidden", "");
  statusBarProfileCard?.setAttribute("hidden", "");
  statusBarNotificationCard?.setAttribute("hidden", "");
}

function closeGlobalSearch() {
  globalSearchOverlay?.setAttribute("hidden", "");
}

function closeAllStatusOverlays() {
  closeAllStatusPopovers();
  closeGlobalSearch();
}

function toggleStatusPopover(card) {
  if (!card) return;
  const shouldOpen = card.hasAttribute("hidden");
  closeAllStatusOverlays();
  if (shouldOpen) {
    card.removeAttribute("hidden");
    card.classList.remove("dropdown-enter");
    void card.offsetWidth; // force reflow
    card.classList.add("dropdown-enter");
  }
}

function toggleGlobalSearch() {
  const shouldOpen = globalSearchOverlay?.hasAttribute("hidden");
  closeAllStatusOverlays();
  if (!shouldOpen) return;
  globalSearchOverlay?.removeAttribute("hidden");
  if (globalSearchInput) {
    globalSearchInput.value = "";
    globalSearchInput.focus();
  }
}

// 1. 볼륨 오버레이 인터랙션
statusBarVolumeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleStatusPopover(statusBarVolumeCard);
});

function updateVolume(val, updateSlider = true) {
  val = Math.max(0, Math.min(100, val));
  if (updateSlider && volumeCardSlider) {
    volumeCardSlider.value = val;
  }
  
  if (val === 0) {
    isMuted = true;
    volumeCardSlider?.classList.add("muted");
    if (volumeCardMuteBtn) volumeCardMuteBtn.innerHTML = svgIcon("mute");
    if (statusBarVolumeBtn) statusBarVolumeBtn.innerHTML = svgIcon("mute");
  } else {
    isMuted = false;
    lastVolume = val;
    volumeCardSlider?.classList.remove("muted");
    if (volumeCardMuteBtn) volumeCardMuteBtn.innerHTML = svgIcon("volume-status");
    if (statusBarVolumeBtn) statusBarVolumeBtn.innerHTML = svgIcon("volume-status");
  }
  
  // 실제 HTML5 오디오/비디오 소리가 있다면 볼륨 조절
  const audios = document.querySelectorAll("audio, video");
  audios.forEach(audio => {
    audio.volume = isMuted ? 0 : val / 100;
  });
}

volumeCardSlider?.addEventListener("input", (e) => {
  updateVolume(Number(e.target.value), false);
});

volumeCardMuteBtn?.addEventListener("click", () => {
  if (isMuted) {
    updateVolume(lastVolume);
  } else {
    updateVolume(0);
  }
});

volumeCardDecBtn?.addEventListener("click", () => {
  const current = isMuted ? 0 : Number(volumeCardSlider.value);
  updateVolume(current - 10);
});

volumeCardIncBtn?.addEventListener("click", () => {
  const current = isMuted ? 0 : Number(volumeCardSlider.value);
  updateVolume(current + 10);
});

volumeCardSettingsBtn?.addEventListener("click", () => {
  closeAllStatusOverlays();
  openLandscapeSettingsApp("sound");
});

// 2. 프로필 오버레이 인터랙션
statusBarProfileBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleStatusPopover(statusBarProfileCard);
});

profileDriverBtn?.addEventListener("click", () => {
  profileDriverBtn.classList.add("active");
  profileValetBtn.classList.remove("active");
  profileDriverBtn.querySelector(".check-mark").style.display = "block";
  profileValetBtn.querySelector(".check-mark").style.display = "none";
});

profileValetBtn?.addEventListener("click", () => {
  profileValetBtn.classList.add("active");
  profileDriverBtn.classList.remove("active");
  profileValetBtn.querySelector(".check-mark").style.display = "block";
  profileDriverBtn.querySelector(".check-mark").style.display = "none";
});

profileSettingsBtn?.addEventListener("click", () => {
  closeAllStatusOverlays();
  openLandscapeSettingsApp("profile");
});

// 3. 알림 오버레이 인터랙션
statusBarNotificationBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleStatusPopover(statusBarNotificationCard);
});

// Bluetooth / Wifi 클릭 인터랙션
statusBarBluetoothBtn?.addEventListener("click", () => {
  closeAllStatusOverlays();
  openLandscapeSettingsApp("connection");
});

statusBarWifiBtn?.addEventListener("click", () => {
  closeAllStatusOverlays();
  openLandscapeSettingsApp("connection");
});

// 4. 검색 인터랙션
statusBarSearchBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleGlobalSearch();
});

globalSearchCloseBtn?.addEventListener("click", () => {
  closeGlobalSearch();
});

globalSearchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const val = globalSearchInput.value.trim();
  closeGlobalSearch();
  if (!val) return;
  destinationInput.value = val;
  openNavSearch();
  navSearchInput.value = val;
  performNavSearch(val);
});

// 화면 외부(Click Outside) 터치 시 팝업 닫기
document.addEventListener("click", (e) => {
  if (!e.target.closest(".status-popover-card") &&
      !e.target.closest(".global-search-card") &&
      !e.target.closest("#statusBarVolumeBtn") &&
      !e.target.closest("#statusBarProfileBtn") &&
      !e.target.closest("#statusBarSearchBtn") &&
      !e.target.closest("#statusBarNotificationBtn")) {
    closeAllStatusOverlays();
  }

  // GNB 앱 목록(런처) 외부 터치 시 닫기
  const isLauncherVisible = !appsLayer.hidden && !appsLayer.classList.contains("media-app-open");
  if (isLauncherVisible && !appsLayer.contains(e.target) && !e.target.closest('[data-dock-action="apps"]')) {
    setActiveSurface("home");
  }
});

// GNB 앱 목록(런처) 및 차량 설정 화면 드래그 다운으로 닫기 (Swipe-down to Close)
let isDraggingApps = false;
let startY = 0;
let currentY = 0;
const dragThreshold = 120; // 120px 이상 아래로 내리면 닫힘

const appsDragHandle = document.querySelector("#appsDragHandle");

if (appsDragHandle && appsLayer) {
  let tickApps = false;

  appsDragHandle.addEventListener("pointerdown", (e) => {
    isDraggingApps = true;
    startY = e.clientY;
    appsDragHandle.setPointerCapture(e.pointerId);
    appsLayer.style.transition = "none";
  });

  appsDragHandle.addEventListener("pointermove", (e) => {
    if (!isDraggingApps) return;
    currentY = e.clientY - startY;
    if (currentY < 0) currentY = 0;

    if (!tickApps) {
      window.requestAnimationFrame(() => {
        if (isDraggingApps) {
          appsLayer.style.transform = `translate(-50%, calc(-50% + ${currentY}px))`;
        }
        tickApps = false;
      });
      tickApps = true;
    }
  });

  const handleAppsPointerUp = (e) => {
    if (!isDraggingApps) return;
    isDraggingApps = false;
    try {
      appsDragHandle.releasePointerCapture(e.pointerId);
    } catch (err) {}

    appsLayer.style.transition = "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease";

    if (currentY > dragThreshold) {
      appsLayer.style.transform = "translate(-50%, 100%)";
      appsLayer.style.opacity = "0";
      setTimeout(() => {
        setActiveSurface("home");
        appsLayer.style.transform = "";
        appsLayer.style.opacity = "";
        appsLayer.style.transition = "";
      }, 300);
    } else {
      appsLayer.style.transform = "translate(-50%, -50%)";
      setTimeout(() => {
        appsLayer.style.transition = "";
      }, 300);
    }
    currentY = 0;
  };

  appsDragHandle.addEventListener("pointerup", handleAppsPointerUp);
  appsDragHandle.addEventListener("pointercancel", handleAppsPointerUp);
}

let isDraggingSettings = false;
let startSettingsY = 0;
let currentSettingsY = 0;

const settingsDragHandle = document.querySelector("#settingsDragHandle");

if (settingsDragHandle && vehicleSettingsLayer) {
  let tickSettings = false;

  settingsDragHandle.addEventListener("pointerdown", (e) => {
    isDraggingSettings = true;
    startSettingsY = e.clientY;
    settingsDragHandle.setPointerCapture(e.pointerId);
    vehicleSettingsLayer.style.transition = "none";
  });

  settingsDragHandle.addEventListener("pointermove", (e) => {
    if (!isDraggingSettings) return;
    currentSettingsY = e.clientY - startSettingsY;
    if (currentSettingsY < 0) currentSettingsY = 0;

    if (!tickSettings) {
      window.requestAnimationFrame(() => {
        if (isDraggingSettings) {
          vehicleSettingsLayer.style.transform = `translateY(${currentSettingsY}px)`;
        }
        tickSettings = false;
      });
      tickSettings = true;
    }
  });

  const handleSettingsPointerUp = (e) => {
    if (!isDraggingSettings) return;
    isDraggingSettings = false;
    try {
      settingsDragHandle.releasePointerCapture(e.pointerId);
    } catch (err) {}

    vehicleSettingsLayer.style.transition = "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease";

    if (currentSettingsY > dragThreshold) {
      vehicleSettingsLayer.style.transform = "translateY(100%)";
      vehicleSettingsLayer.style.opacity = "0";
      setTimeout(() => {
        setActiveSurface("home");
        vehicleSettingsLayer.style.transform = "";
        vehicleSettingsLayer.style.opacity = "";
        vehicleSettingsLayer.style.transition = "";
      }, 300);
    } else {
      vehicleSettingsLayer.style.transform = "translateY(0)";
      setTimeout(() => {
        vehicleSettingsLayer.style.transition = "";
      }, 300);
    }
    currentSettingsY = 0;
  };

  settingsDragHandle.addEventListener("pointerup", handleSettingsPointerUp);
  settingsDragHandle.addEventListener("pointercancel", handleSettingsPointerUp);
}
