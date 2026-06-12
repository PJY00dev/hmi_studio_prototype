# HMI Prototype

현대자동차 Pleos Connect 차량용 HMI 프로토타입. 1920×1080 캔버스를 브라우저에서 스케일링하여 표시.

---

## 작업 시작 시 필수 확인 순서

모든 작업 요청에 대해 아래 순서를 따른다.

1. `MEMORY.md` 확인 → 프로젝트 맥락(Figma ID, 가이드 위치 등) 파악
2. 관련 코드 파일 읽기 (styles.css, index.html, app.js 등)
3. UI/디자인 관련 작업이면 → 아래 "디자인 작업 흐름" 따를 것

---

## 디자인 작업 흐름

UI 컴포넌트 추가·수정·스타일 변경 작업 시 반드시 이 순서를 따른다.

1. `design_system/AGENTS.md` 열기 → 해당 컴포넌트의 웹 URL과 Figma 노드 ID 확인
2. `design_system/components/[해당파일].md` 확인
   - 내용이 있으면 → 해당 파일 기준으로 작업
   - 비어있으면 → 웹 가이드(WebFetch) + Figma MCP 두 소스 모두 참조해서 파일 먼저 채운 후 작업
3. 코드 수정
4. 프리뷰 스크린샷으로 결과 확인

---

## 소스별 역할

| 소스 | 담당 정보 |
|------|-----------|
| 웹 가이드 (WebFetch) | 구조·상태·속성·사용 규칙 |
| Figma MCP | 크기·간격·색상·radius 수치 |
| `design_system/` 파일 | 두 소스를 합친 완성 스펙 (채워진 경우) |

**수치의 최종 소스는 항상 Figma다.**

---

## Figma 파일

| 파일 | ID | 용도 |
|------|----|------|
| Pleos_Connect_display_guide_215 | `R7TzBekYmGHCIlcl6xAByc` | 레이아웃, 디스플레이 가이드 |
| Pleos_Connect_design_assets_215 | `FKNjhVLOqG2JarL1ksV5H0` | 컴포넌트 에셋 (페이지: Foundation / Components) |

컴포넌트별 Figma 노드 ID는 `design_system/AGENTS.md` 참조.

---

## 금지

- Design Guide에 정의되지 않은 컴포넌트 패턴 임의 추가 금지
- 가이드 외 스타일(색상, 폰트, 간격) 혼입 금지
- design_system 파일이 비어있다고 임의로 수치를 추정하지 말 것 — 반드시 Figma에서 확인
