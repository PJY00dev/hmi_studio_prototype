# Selections

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/selections/checkbox` / `radio` / `switches`
- Figma 노드: `67:33563` (Selections 전체, Components 페이지)

---

## 공통 목적

> "차량 내 조작이 필요한 스위치 중 하나로 다중 선택을 위한 옵션을 제공합니다." (Checkbox)
> "차량 내 조작으로 독립적인 선택 옵션을 제공합니다." (Radio)
> "On/Off를 통해 상태 변경이 필요할 때 사용합니다." (Switch)

---

## 1. Checkbox

### 구조 (Anatomy)
| 요소 | 설명 |
|------|------|
| Root | 최소 컨테이너 |
| Control | 체크박스 현재 상태를 표시하는 시각 요소 |
| Icon | 체크박스에 대한 정보를 전달하는 아이콘 |

### 상태 (States)
| 상태 | 타입 | 설명 |
|------|------|------|
| Checked | Boolean | 선택 시 True |
| Pressed | Boolean | 터치 인터랙션 중 활성화 |
| Disabled | Boolean | True 시 사용자 상호작용 불가 |

### 크기
| 속성 | 값 |
|------|-----|
| 터치 컨테이너 | 64×64px (`selections/container_large`) |
| 체크박스 박스 | 48×48px |
| border-radius | 12px |
| border (미선택) | 4px `divider/tertiary` = `rgba(19,20,23,0.2)` |
| 체크 아이콘 | 44×44px |

### 상태별 스타일
| active | state | 배경 | 보더 |
|--------|-------|------|------|
| False | Enabled | 없음 | 4px `divider/tertiary` |
| False | Pressed | `dim/dark/secondary` 10% | 4px `divider/tertiary` |
| False | Disabled | `dim/dark/primary` 5% | 4px `divider/primary` 5% |
| True | Enabled | `switch/on` = `#02c265` | 없음 |
| True | Pressed | `#02c265` + 10% dark 오버레이 | 없음 |
| True | Disabled | `switch/disabled` 10% | 없음 |
| Indeterminate | Enabled | `switch/on` = `#02c265` | 없음 |
| Indeterminate | Pressed | `#02c265` + 10% dark 오버레이 | 없음 |
| Indeterminate | Disabled | `switch/disabled` 10% | 없음 |

---

## 2. Radio Button

### 크기
| 속성 | 값 |
|------|-----|
| 터치 컨테이너 | 64×64px |
| 라디오 원 | 48×48px |
| 테두리 (비활성) | `selections/border_small` = 4px |
| 테두리 (활성) | `selections/border_large` = 12px |

### 상태별 스타일
| active | state | 배경 | 테두리 색상 |
|--------|-------|------|-------------|
| false | Enabled | 없음 | `divider/tertiary` rgba(19,20,23,0.2) |
| false | Pressed | `dim/dark/secondary` 10% | `divider/tertiary` |
| false | Disabled | `dim/dark/primary` 5% | `divider/primary` 5% |
| true | Enabled | white | `informative/active` = `#02c265` |
| true | Pressed | white | `#04b15d` (어두운 green) |
| true | Disabled | white (`switch/knob_disabled`) | `switch/disabled` 10% |

---

## 3. Switch

### 크기
| 속성 | Medium | Small |
|------|--------|-------|
| 트랙 width | 80px | 64px |
| 트랙 radius | 16px | 12px |
| 트랙 padding | 8px | 6px |
| 노브 크기 | 32×32px | 28×28px |
| 노브 radius | 8px | 8px |
| 노브 shadow | Level1 | Level1 |

### 상태별 트랙 색상
| active | state | 트랙 색상 |
|--------|-------|-----------|
| true | Enabled | `switch/on` = `#02c265` |
| true | Pressed | `#02c265` + `rgba(19,20,23,0.1)` 오버레이 |
| true | Disabled | `switch/disabled` = `rgba(19,20,23,0.1)` |
| false | Enabled | `switch/off` = `rgba(19,20,23,0.3)` |
| false | Pressed | `rgba(19,20,23,0.3)` + 10% 오버레이 |
| false | Disabled | `switch/disabled` = `rgba(19,20,23,0.1)` |

노브 색상: 항상 white (`switch/knob_on/off/disabled` 모두 `#ffffff`)

---

## 사용 규칙
- Checkbox: 다중 선택 허용 (체크 목록)
- Radio: 단일 선택 (그룹 내 하나만)
- Switch: 즉시 적용되는 On/Off 설정
- 터치 컨테이너(64px)는 터치 영역만, 시각적으로는 내부 요소만
- Switch 노브 위치: Off = 트랙 시작점, On = 트랙 끝점
