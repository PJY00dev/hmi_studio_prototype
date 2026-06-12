# Design System 작성 가이드

이 폴더의 모든 파일은 두 소스를 **반드시 함께** 참조해서 채워야 한다.

| 소스 | 담당 정보 | 참조 방법 |
|------|-----------|-----------|
| Pleos Connect UI Design Guide (웹) | 구조·상태·속성·사용 규칙 | WebFetch로 URL 접근 |
| Figma design_assets 파일 (Components 페이지) | 크기·간격·색상·radius 수치 | Figma MCP — `get_design_context` 또는 `get_screenshot` |

웹 가이드만으로는 수치를 알 수 없고, Figma만으로는 사용 규칙을 알 수 없다.
두 소스를 합쳐야 완전한 스펙이다.

---

## Figma 파일 정보

| 파일 | ID | 용도 |
|------|----|------|
| Pleos_Connect_design_assets_215 | `FKNjhVLOqG2JarL1ksV5H0` | 컴포넌트 수치 스펙 |
| Pleos_Connect_display_guide_215 | `R7TzBekYmGHCIlcl6xAByc` | 레이아웃·디스플레이 가이드 |

---

## 파일별 작성 매핑

### Foundation

| 파일 | 웹 가이드 URL | Figma 노드 (Foundation 페이지 0:1) |
|------|--------------|-----------------------------------|
| `foundation/colors.md` | `/docs-design/foundations/colors` | Foundation 페이지에서 Color 섹션 조회 |
| `foundation/typography.md` | `/docs-design/foundations/typography` | Foundation 페이지에서 Typography 섹션 조회 |
| `foundation/iconography.md` | `/docs-design/foundations/iconography` | Foundation 페이지에서 Iconography 섹션 조회 |
| `foundation/app-cover.md` | `/docs-design/foundations/app-icon` | Foundation 페이지에서 App Icon 섹션 조회 |

> 참고: `typography.backup.md`, `colors_light.backup.md`는 이전에 수동으로 작성된 임시 파일. 내용 참고는 가능하나 공식 소스가 아님.

---

### Components (Figma: Components 페이지 `1:2`)

| 파일 | 웹 가이드 URL | Figma 노드 ID |
|------|--------------|---------------|
| `components/buttons.md` | `/docs-design/components/actions/basic-button`<br>`/docs-design/components/actions/toggle-button`<br>`/docs-design/components/actions/text-button`<br>`/docs-design/components/actions/icon-button` | `67:22479` (Buttons 전체 프레임)<br>Basic: `67:22525`<br>Toggle: `67:22600`<br>Text: `67:22681`<br>Icon: `67:22708` |
| `components/keypad.md` | `/docs-design/components/actions/keypad` | Numeric: `67:22917`<br>Keyboard Normal: `67:22936`<br>Keyboard Static: `67:22975` |
| `components/sliders.md` | `/docs-design/components/controllers` | `67:24477` (Sliders 전체) |
| `components/steppers.md` | `/docs-design/components/controllers` | `67:25154` (Steppers 전체) |
| `components/dropdown-menu.md` | `/docs-design/components/dropdown` | `67:25695` (Dropdown Menu 전체) |
| `components/fields.md` | `/docs-design/components/fields/text-field`<br>`/docs-design/components/fields/number-field` | `67:27012` (Fields 전체) |
| `components/page-navigation.md` | `/docs-design/components/page-navigation` | `67:27529` (Page Navigation 전체) |
| `components/popup.md` | `/docs-design/components/popups/system-popup`<br>`/docs-design/components/popups/toast-popup` | `67:29503` (Popup 전체) |
| `components/tabs.md` | `/docs-design/components/segmented-menu` | `67:32652` (Tabs 전체) |
| `components/selections.md` | `/docs-design/components/selections/checkbox`<br>`/docs-design/components/selections/radio`<br>`/docs-design/components/selections/switches` | `67:33563` (Selections 전체) |
| `components/spinner.md` | `/docs-design/components/spinner` | `67:33637` (Spinner 전체) |
| `components/system-notification.md` | `/docs-design/components/notification/system-notification` | `67:33989` (System Notification 전체) |
| `components/bar.md` | `/docs/connect/guide/docs-design/components/bar` | Figma 별도 섹션 없음 (웹 가이드 반영 완료) |
| `components/indicator.md` | `/docs/connect/guide/docs-design/components/indicator` | Figma 별도 섹션 없음 (웹 가이드 반영 완료) |
| `components/toast.md` | `/docs/connect/guide/docs-design/components/toast` | `67:32582` (Toast Popup 내부) |
| `components/widgets.md` | `/docs/connect/guide/docs-design/components/widgets` | Figma 별도 섹션 없음 (웹 가이드 반영 완료) |
| `components/gnb.md` | `/docs/connect/guide/docs-design/components/gnb` | Figma 별도 섹션 없음 |
| `components/status-bar.md` | `/docs/connect/guide/docs-design/components/status-bar` | `39690:11164` (SP1 Dynamic) |
| `components/app-library.md` | `/docs/connect/guide/docs-design/components/app-library` | Figma 별도 섹션 없음 |
| `components/vehicle-notification.md` | `/docs/connect/guide/docs-design/components/notification/vehicle-notification` | Figma 별도 섹션 없음 |

---

## 각 파일 작성 형식

```markdown
# [컴포넌트 이름]

## 소스
- 웹: [URL]
- Figma 노드: [ID]

## 구조 (Anatomy)
<!-- 웹 가이드에서 추출 -->

## 상태 (States)
<!-- 웹 가이드에서 추출 -->

## 속성 (Properties)
<!-- 웹 가이드에서 추출 -->

## 크기 및 수치 (Figma 기준)
<!-- Figma에서 추출: 너비·높이·padding·gap·border-radius·색상 -->

## 사용 규칙
<!-- 웹 가이드에서 추출 -->
```

---

## 작업 순서 권장

코드 구현에 영향이 큰 순서:

1. `buttons.md` — 가장 많이 쓰임
2. `typography.md` — 전체 텍스트에 영향
3. `colors.md` — 전체 색상에 영향
4. `sliders.md` / `steppers.md` — GNB 컨트롤러
5. 나머지

---

## 주의사항

- 웹 가이드 URL 실제 경로: `https://document.pleos.ai/docs/connect/guide/docs-design/...`
  - 예: `https://document.pleos.ai/docs/connect/guide/docs-design/components/actions/basic-button`
  - ⚠️ 기존 `/docs-design/...` 형태는 404 — 반드시 `/docs/connect/guide/` prefix 포함
- Figma 노드에서 수치를 읽을 때는 `get_design_context`를 사용 (`get_metadata`는 위치·크기만 반환)
- 파일 작성 후 `styles.css`의 CSS 변수와 실제 값이 일치하는지 교차 검증할 것
