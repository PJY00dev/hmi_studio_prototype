# Bar

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/bar`
- Figma 노드: 미정의 (Components 및 Foundation 페이지에 별도 섹션 없음)

> "디스플레이 내 앱 화면의 사이즈나 위치 조정 또는 콘텐츠 조작을 위한 요소입니다."

---

## 타입

| 타입 | 설명 |
|------|------|
| Window Bar | 앱 윈도우의 크기/위치 조정용 |
| Scroll Bar | 앱 내 콘텐츠 스크롤 탐색용 |

---

## 구조 (Anatomy)

두 타입 공통:
| 요소 | 설명 |
|------|------|
| Root | 컴포넌트 전체를 감싸는 최상위 컨테이너 |
| Control | Handle과 최소 드래그 영역을 담는 컨테이너 |
| Handle | 실제 드래그 가능한 인터랙티브 요소 |

---

## 상태 (States)

| 상태 | 값 | 설명 |
|------|-----|------|
| Variant | Light / Dark | 앱 테마 설정에 따라 전환 |
| Dragging | True / False | 윈도우 드래그 중일 때 활성화 |
| Disabled | True / False | True일 때 Handle 숨김, 드래그 비활성화 |
| Pressed | True / False | Handle 드래그 중인 active 상태 |

---

## 동작 (Behaviors)

### Window Bar
- 앱 윈도우의 크기(가로/세로)를 조정
- 드래그 시 윈도우 크기 변경
- Light / Dark 두 가지 테마 변형 지원

### Scroll Bar
- 앱 내 콘텐츠 스크롤 탐색
- Light / Dark 두 가지 테마 변형 지원

---

## 인터랙션 규칙 (Interaction 가이드 연계)
- Drag Start: Window Bar가 수축(contraction) 시작
- Drag End: 수축 사라짐
- Y축 드래그 0~59%: 원래 위치로 복귀
- Y축 드래그 60% 이상: 윈도우 닫힘
