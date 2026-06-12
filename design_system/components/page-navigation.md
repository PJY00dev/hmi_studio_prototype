# Page Navigation

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/page-navigation`
- Figma 노드: `67:27529` (Page Navigation 전체, Components 페이지)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 컴포넌트를 감싸는 최소 컨테이너 |
| App Icon | 애플리케이션을 나타내는 시각 요소 |
| Primary Menu | 페이지 첫 번째 카테고리를 그룹핑하는 Dropdown Menu |
| Secondary Menu | 페이지 두 번째 카테고리 선택용 선택적 Dropdown |
| Suffix | 앱 필요에 따라 교체 가능한 추가 내비게이션 아이콘 메뉴 |

## 상태 (States)

| 상태 | 설명 |
|------|------|
| Main | 기본 메뉴 구성 |
| Depth | 페이지 전환 중 뒤로가기 필요 시 활성화 |

## 속성 (Properties)

| 속성 | 타입 | 설명 |
|------|------|------|
| Primary | App Icon / Suffix | Depth 상태에 따라 조정 |
| Secondary | Boolean | 활성 터치/클릭 상태 반영 |
| Subtitle | Boolean | 보조 정보 표시 활성화 |

---

## 타입

| 타입 | 설명 |
|------|------|
| Default (Main) | 일반 페이지 헤더 (앱 아이콘 + 제목 + 액션 버튼) |
| Depth | 뒤로가기 버튼이 있는 서브 페이지 |
| Search | 검색 필드가 포함된 헤더 |

---

## 크기 및 수치

### 컨테이너
| 속성 | 값 |
|------|-----|
| padding left | 40px (`page_navigation/padding_extralarge`) |
| padding right | `page_navigation/padding_right` |
| gap (요소 간) | 24px (`page_navigation/gap_large`) |
| 세로 정렬 | center |

### 타이틀 영역 (Depth)
| 속성 | 값 |
|------|-----|
| 타이틀 gap horizontal | 24px (`page_navigation/title/depth_gap_horizontal`) |
| 서브타이틀 gap vertical | 4px (`page_navigation/sub_title_gap_vertical`) |

---

## 타이포그래피

| 요소 | 스펙 |
|------|------|
| 제목 | Title/Large 또는 Medium (40px or 36px), ExtraBold or Bold |
| 부제목 | 26px / 34px, Regular, `text/dark/secondary` |
| 설명 | 26px / 34px, Regular, `text/dark/secondary` |

---

## 구성 요소

### 앱 아이콘 영역
- 앱 아이콘 48×48px (Optional)
- Band 레이블 (라디오 주파수 등, Optional)

### 액션 버튼
- 우측 최대 3개 (btn1, btn2, btn3)
- 아이콘 버튼 형태

### Depth 뒤로가기
- 좌측 back 버튼 아이콘

### Search 타입
- 타이틀 영역 대신 Text Field 표시
- Text Field 크기: Medium (100px height)
- 필드 너비: flex-1 (가변)

---

## 사용 규칙
- 화면 최상단에 고정
- Default: 앱 메인 화면 (내비게이션, 미디어 등)
- Depth: 설정 서브 화면, 상세 화면
- Search: 검색이 주요 기능인 화면
- 액션 버튼은 최대 3개 이하 (오른쪽 정렬)
- Line Tabs (Large)와 함께 사용 시 탭이 하단에 위치
