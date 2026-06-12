# Tabs

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/segmented-menu`
- Figma 노드: `67:32652` (Tabs 전체, Components 페이지)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 전체를 감싸는 최상위 컨테이너 |
| Tab Item | 사용자가 전환할 수 있는 선택 가능한 콘텐츠 그룹 |
| Label | 각 탭을 식별하는 텍스트 |
| Selected Indicator | 현재 활성 탭을 강조하는 시각 요소 |
| Tab Container | 탭 아이템이 표시되는 영역 |

## 상태 (States)

| 상태 | 설명 |
|------|------|
| Enable | 기본 인터랙티브 상태 |
| Pressed | 사용자가 탭을 클릭 중일 때 |
| Selected | 현재 선택된 탭 값 반영 |

## 속성 (Properties)

| 속성 | 옵션 | 설명 |
|------|------|------|
| Type | Box (Solid) / Line | 스타일 변형 선택 |
| Fitted | Boolean | On: 가용 너비에 균등 분배 / Off: 좌측 정렬 |

> "2개 이상의 콘텐츠나 기능 옵션을 제공합니다."

---

## 타입

| 타입 | 설명 |
|------|------|
| Solid (Box) | 알약형 컨테이너, 선택 탭에 흰 배경 |
| Line | 하단 밑줄로 선택 표시 |

---

## Solid Tab

### 크기
| 속성 | Large | Medium |
|------|-------|--------|
| 컨테이너 height | 100px | 80px |
| 컨테이너 radius | 32px | 24px |
| 컨테이너 padding | 8px | 8px |
| 컨테이너 bg | `rgba(19,20,23,0.05)` | `rgba(19,20,23,0.05)` |
| 버튼 height | 84px | 64px |
| 버튼 width | 200px | 160px |
| 버튼 px | 28px | 18px |
| 버튼 py | 16px | 12px |
| 버튼 gap | 14px | 8px |
| 버튼 radius | 24px | 16px |
| 아이콘 크기 | 52px | 40px |
| 구분선 | 2px × 36px, `divider/secondary` | 동일 |

### 텍스트
| 상태 | Large | Medium |
|------|-------|--------|
| 선택 | 32px / 40px, Bold, `text/dark/primary` | 30px / 38px, Bold, `text/dark/primary` |
| 미선택 | 32px / 40px, Bold, `text/dark/secondary` | 30px / 38px, Bold, `text/dark/secondary` |
| 비활성 | 32px / 40px, Bold, `text/dark/quaternary` | 30px / 38px, Bold, `text/dark/quaternary` |

### 버튼 배경
| 상태 | bg | Shadow |
|------|-----|--------|
| 선택 (focused) | white — `button/switch/enabled` | Level2 |
| 미선택 | 없음 | 없음 |
| Pressed (미선택) | `rgba(19,20,23,0.1)` — `button/basic/pressed` | 없음 |

### 세그먼트 수별 너비
| 세그먼트 | Large | Medium |
|---------|-------|--------|
| 2 | 880px | 780px |
| 3 | 880px | 780px |
| 4 | (flex) | 960px |
| 5 | 1176px | 1176px |
| 6 | 1176px | — |

---

## Line Tab

### 크기
| 속성 | 일반 | Large (Page Nav Only) |
|------|------|-----------------------|
| 컨테이너 하단 선 | 1px `divider/secondary` | 없음 |
| padding horizontal | 28px | 0 |
| gap (탭 간격) | 24px | 24px |
| 선택 밑줄 두께 | 4px `text/dark/primary` | 4px |
| 버튼 wrap py | 12px | 26px |
| 버튼 inner px | 14px | 14px |
| 버튼 inner py | 18px | 18px |
| 버튼 gap | 8px | 8px |
| 버튼 inner radius (pressed) | 12px | 12px |

### 텍스트
| 상태 | 색상 |
|------|------|
| Selected | `text/dark/primary` |
| Enabled | `text/dark/secondary` |
| Pressed | `text/dark/secondary` |
| Disabled | `text/dark/quaternary` |

공통: 32px / 40px, Bold

---

## 사용 규칙
- Solid Large: 설정 화면 주요 탭
- Solid Medium: 서브 탭 (좁은 영역)
- Line Large (Page Nav Only): 페이지 내비게이션 탭에만 사용
- 탭 수 2–6개 범위 내 사용
