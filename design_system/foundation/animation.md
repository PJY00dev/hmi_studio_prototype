# Pleos Connect Animation

## 소스
- 웹 가이드: `https://document.pleos.ai/docs/connect/guide/docs-design/foundations/animation`
- 파일 위치: `assets/lottie/`

---

## 개요

Pleos Connect 공식 제공 로딩 애니메이션. **모든 로딩 표시 상황에 사용**한다.
임의 CSS 스피너 또는 커스텀 로딩 애니메이션 사용 금지.

---

## 타입

| 타입 | 용도 |
|------|------|
| **Linear** | 정적 로딩, 간단한 시각적 피드백 (버튼 로딩 상태 등) |
| **Tension** | 긴 로딩 시간 (페이지 전환, 앱 실행 등) |

---

## 파일 스펙

| 파일명 | 타입 | 모드 | 크기 | FPS | 재생 시간 |
|--------|------|------|------|-----|-----------|
| `Loading_Linear_Light.json` | Linear | Light | 64×64px | 30 | 2.03초 루프 |
| `Loading_Linear_Dark.json` | Linear | Dark | 64×64px | 30 | 2.03초 루프 |
| `Loading_Tension_Light.json` | Tension | Light | 64×64px | 30 | 2.03초 루프 |
| `Loading_Tension_Dark.json` | Tension | Dark | 64×64px | 30 | 2.03초 루프 |

---

## 색상 구조

| 모드 | 전경색 | 전경 opacity | 배경 트랙 opacity |
|------|--------|--------------|-------------------|
| Light | `rgba(19, 20, 23)` — `#131417` | 84% | 10% |
| Dark | `rgba(255, 255, 255)` — `#ffffff` | 84% | 10% |

---

## 구현 방법

lottie-web 라이브러리 사용 (CDN):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
```

Light/Dark 모드에 따라 파일 자동 선택:
```javascript
function createLoader(container, type = 'linear') {
  const isDark = document.documentElement.classList.contains('dark');
  const mode = isDark ? 'Dark' : 'Light';
  const typeName = type === 'tension' ? 'Tension' : 'Linear';
  const path = `assets/lottie/Loading_${typeName}_${mode}.json`;

  return lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path,
  });
}
```

---

## 사용 위치

| 상황 | 타입 |
|------|------|
| 버튼 Loading 상태 | Linear |
| 앱 실행 중 | Tension |
| 페이지 전환 | Tension |
| 데이터 조회 중 | Linear |
