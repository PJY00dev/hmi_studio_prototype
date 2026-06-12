# Popup

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/popups/system-popup`
- Figma 노드: `67:29503` (Popup 전체, Components 페이지)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 팝업 전체를 감싸는 최상위 컨테이너 |
| Title | 팝업의 주요 텍스트 |
| Description | 사용자에게 주요 정보를 전달하는 선택적 부제목 |
| Confirm Action | 내용 확인 또는 다른 화면으로 이동하는 버튼 |
| Cancel Action | 팝업 닫기를 위한 선택적 버튼 |

> "앱 내에서 기본적으로 제공되는 팝업으로 서비스의 맥락에 맞게 Body 영역에 콘텐츠도 제공할 수 있습니다."

## 속성 (Properties)

| 속성 | 옵션 | 설명 |
|------|------|------|
| Header | Boolean | 아이콘, 부제목, 설명 표시 토글 |
| Body | Boolean | 헤더~버튼 사이 콘텐츠 영역 |
| Size | Large / Medium | 크기 변형 |
| Button Alignment | Single / Vertical / Horizontal | 버튼 배치 |

---

## 타입

| 타입 | 설명 |
|------|------|
| System Popup | 사용자 확인/선택 다이얼로그 |
| Toast Popup | 간단한 상태 알림 → `toast.md` 참조 |

---

## System Popup

### 크기 (Normal)
| 속성 | Medium | Large |
|------|--------|-------|
| width | 808px | 1200px |
| padding | 48px | 48px |
| border-radius | 48px | 48px |
| max-height | 1152px | 1152px |
| gap (섹션 간) | 40px | 40px |

### 크기 (Extended — 콘텐츠 포함)
| 속성 | Medium | Large |
|------|--------|-------|
| width | 720px | 1000px |
| padding | 40px | 40px |
| border-radius | 40px | 40px |
| gap | 33px | 33px |
| max-height | 1240px | 1240px |

### 공통 스타일
| 속성 | 값 |
|------|-----|
| border | 2px `divider/primary` = `rgba(19,20,23,0.05)` |
| background | white (`background/popup`) |

---

## Header

| 속성 | 값 |
|------|-----|
| 아이콘 크기 | 80×80px |
| 텍스트 그룹 gap | 24px |
| 제목 | 40px / 52px, ExtraBold, `text/dark/primary` |
| 제목 (Extended/scaled) | ~33px / 43px, ExtraBold |
| 부제목 | 36px / 44px, Bold, `text/dark/secondary` |
| 설명 | 30px / 38px, Regular, `text/dark/secondary` |
| header bottom padding | 16px |
| header horizontal padding (Large) | 32px |
| Close 버튼 | 48×48px, 좌상단 |

---

## 버튼 영역 (Large Button)

| 속성 | 값 |
|------|-----|
| height | 100px |
| border-radius | 32px |
| padding horizontal | 40px |
| padding vertical | 16px |
| gap (아이콘~텍스트) | 16px |
| 아이콘 크기 | 52px |
| 버튼 간격 | 24px |
| 텍스트 | 32px / 40px, Bold |

### 버튼 타입
| 타입 | 배경 | 텍스트 색상 |
|------|------|------------|
| Filled (주요) | `button/filled/enabled` = `#44464e` | white |
| Ghost (보조) | `button/basic/enabled` = `rgba(19,20,23,0.05)` | `text/dark/primary` |

### 버튼 배치
| 배치 | 구성 |
|------|------|
| Horizontal | Filled + Ghost, 각 flex-1 |
| Vertical | Filled + Ghost, 각 w-full |

---

## Extended Popup 콘텐츠 (프로필 목록 등)

| 속성 | 값 |
|------|-----|
| 리스트 bg | `dim/dark/primary` = `rgba(19,20,23,0.05)` |
| 리스트 padding horizontal | 20px |
| 리스트 padding vertical | 24px |
| 리스트 radius | 32px |
| 아이템 height | 112px (min 100px) |
| 아이템 padding horizontal | 20px |
| 아이템 padding vertical | 16px |
| 아이템 radius | 24px |
| 아이템 레이블 | 30px / 38px, Bold, `text/dark/primary` |
| 아이템 서브레이블 | 26px / 34px, Regular, `text/dark/tertiary` |
| prefix/suffix 버튼 | 80×80px, radius 20px |
| prefix/suffix 아이콘 | 56×56px |

---

## 사용 규칙
- Medium Normal: 짧은 확인 (예: "삭제하시겠습니까?")
- Large Normal: 상세 설명 필요 (약관, 권한)
- Extended: 목록/폼 포함 (프로필 선택 등)
- 버튼: 기본 Horizontal, 텍스트 길면 Vertical
- 아이콘: 선택 사항
- 딤 배경 필수: `overlay/default` = `rgba(19,20,23,0.2)`
