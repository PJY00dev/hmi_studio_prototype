# Dropdown Menu

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/dropdown`
- Figma 노드: `67:25695` (Dropdown Menu 전체, Components 페이지)

> "메뉴 이동 또는 속성 변경을 위한 UI 요소입니다."

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 최상위 컨테이너 |
| Label | 버튼 레이블 |
| Prefix | 메뉴 앞쪽 옵션 영역 |
| Suffix | 메뉴 뒷쪽 옵션 영역 |
| Container | Dropdown 요소를 담는 영역 |

## 상태 (States)

| 상태 | 타입 | 설명 |
|------|------|------|
| Opened | Boolean | 컨테이너 열림 상태 |
| Pressed | Boolean | 터치/클릭 중인 상태 |
| Disabled | Boolean | 제어 불가능 상태 |

## 속성 (Properties)

| 속성 | 옵션 | 설명 |
|------|------|------|
| Prefix | App Icon / Icon | 메뉴 앞쪽 옵션 |
| Suffix | Switch / Icon | 메뉴 뒷쪽 옵션 |
| Size | Medium / Small | 컴포넌트 및 아이템 크기 |

---

## 구성 요소

| 요소 | 설명 |
|------|------|
| Dropdown Button | 현재 선택값을 보여주는 트리거 버튼 |
| Dropdown Item | 리스트 내 선택 항목 |
| Dropdown List | Item들의 컨테이너 |

---

## Dropdown Button

### 크기
| 속성 | Medium | Small |
|------|--------|-------|
| prefix icon area | 56×56px | 56×56px |
| prefix icon 내부 패딩 | 12px | 12px |
| label padding horizontal | 16px | 12px |
| border | 2px `divider/secondary` | 2px |
| shadow | Level2 | Level2 |
| 텍스트 | 30px / 38px, Bold | 동일 |

### 상태
| 상태 | 스타일 |
|------|--------|
| Enabled | 기본 |
| Pressed | bg dim/dark/secondary |
| Disabled | 텍스트 tertiary |

---

## Dropdown Item

### 크기
| 속성 | Medium | Small |
|------|--------|-------|
| 아이템 너비 | 568px | 568px |
| prefix icon 패딩 | 12px | 12px |
| label padding horizontal | 12px | 12px |
| gap (세로, Footer) | 16px | 16px |
| gap (가로, Footer) | 20px | 20px |
| 앱 아이콘 radius (Medium) | 16px | 12px |
| 텍스트 | 30px / 38px, Bold | 동일 |

### 상태
| 상태 | 배경 | 텍스트 |
|------|------|--------|
| Enabled | 없음 | `text/dark/primary` |
| Selected | `dim/dark/primary` 5% | `text/dark/primary` |
| Disabled | 없음 | `text/dark/quaternary` |
| Footer | 별도 레이아웃 | `text/dark/primary` |

### 옵션 속성
| 속성 | 설명 |
|------|------|
| appIcon | 앱 아이콘 (48×48px) 표시 |
| prefixIcon | 좌측 심볼 아이콘 |
| propSwitch | 우측 Switch 토글 |
| newDot | 신규 알림 점 |

---

## Footer Item

리스트 하단에 위치하는 추가 액션 영역.
- 배경: `dim/dark/primary` 5% (별도 bg)
- 내부 버튼: 32px/38px Bold, radius 12px

---

## 사용 규칙
- 드롭다운은 트리거 버튼 하단에 위치
- 최대 높이 초과 시 스크롤
- Selected 아이템에는 check 아이콘 또는 배경 표시
- Footer는 "전체보기", "추가" 등 단일 액션에 사용
