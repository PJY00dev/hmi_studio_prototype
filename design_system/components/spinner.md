# Spinner (Date/Time Picker Wheel)

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/spinner`
- Figma 노드: `67:33637` (Spinner 전체, Components 페이지)

> **주의**: 이 컴포넌트는 로딩 Spinner가 아닌 날짜/시간 선택용 Wheel Picker임.
> 로딩 애니메이션은 Lottie 파일 사용 (`assets/lottie/Loading_*.json`).

> "drag를 통해 여러 옵션 중 하나를 선택할 수 있는 기능입니다."

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 컴포넌트를 감싸는 최상위 컨테이너 |
| Selection Value | 현재 선택된 값 표시 |
| Contents | 선택 가능한 값 목록 |

## 속성 (Properties)

| 속성 | 옵션 | 설명 |
|------|------|------|
| Type | Date / Time | 날짜 또는 시간 기반 선택 |

## 사용 규칙
- 드래그로 여러 옵션 중 하나 선택
- Date: 날짜 값 기반 선택
- Time: 시간 값 기반 선택

---

## 타입

| 타입 | 너비 | 설명 |
|------|------|------|
| Date | 540px | 월/일/년 스크롤 |
| Time | 480px | 시/분/AM·PM 스크롤 |
| Date+Time | 1104px | 날짜 + 시간 병렬 |

---

## 크기 및 수치

### 휠 컨테이너
| 속성 | 값 |
|------|-----|
| height | 384px |
| background | `background/primary` = `#f7f8fa` |
| padding horizontal | `spinner/wheel/padding_horizontal` |

### 행 높이
| 행 종류 | 높이 |
|---------|------|
| 선택 행 (중앙) | 88px |
| 인접 행 (위/아래 1번째) | 88px |
| 페이드 행 (위/아래 2번째) | 60px |

**선택 행**: 배경 `dim/dark/primary` = `rgba(19,20,23,0.05)` 강조

### 마스크
- 상단/하단 각 60px (`spinner/list_mask_height`)
- Fade out 처리로 자연스러운 엣지

### 간격
| 속성 | 값 |
|------|-----|
| 열 내부 gap | 20px (`spinner/gap_medium`) |
| 섹션 간 gap (Date+Time) | 24px (`spinner/gap_large`) |
| 타이틀 상단 패딩 | 16px (`spinner/title_top_padding`) |

---

## 타이포그래피

| 요소 | 스펙 |
|------|------|
| 선택 행 텍스트 (Date) | 60px / 80px, Bold |
| 선택 행 텍스트 (Time) | 60px / 80px, ExtraBold |
| 인접/페이드 행 텍스트 | 60px / 80px, Bold |
| 타이틀 | 36px / 44px, Bold, `text/dark/secondary` |

---

## 크기 변형 (IviSpinner)

| 속성 | Large | Medium |
|------|-------|--------|
| 휠 크기 | 표준 (384px height) | 축소 버전 |

---

## 사용 규칙
- 날짜/시간 입력 팝업에서 사용
- 휠 스크롤로 값 선택 (드래그/플링)
- 날짜만 필요하면 Date 타입, 시간만이면 Time 타입
- Date+Time은 두 휠을 가로 배치
- 타이틀("Date", "Time")은 옵션 (팝업에서는 표시 권장)
