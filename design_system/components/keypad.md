# Keypad

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/actions/keypad`
- Figma 노드: Numeric `67:22917`, Keyboard Normal `67:22936`, Keyboard Static `67:22975`

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 버튼을 감싸는 최상위 컨테이너 |
| Label | 버튼 레이블 텍스트 |
| Icon (Prefix) | 레이블 좌측 아이콘 |
| Icon (Suffix) | 레이블 우측 아이콘 |

## 상태 (States)

| 상태 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| Pressed | Boolean | False | 터치 상태 시 True |
| Dragged | Boolean | False | 드래그 가능 윈도우일 때 True |
| Disabled | Boolean | — | 제어 불가능 상태 |

## 속성 (Properties)

| 속성 | 옵션 | 설명 |
|------|------|------|
| Keypad 타입 | Primary / Secondary / Special | 키보드 역할에 따라 선택 |
| 입력 방식 | Text / Voice | 키패드 또는 음성 입력 |

---

## 1. Numeric Keypad (숫자 키패드)

숫자 0–9, Delete(삭제), Clear(초기화)로 구성.

### 키 크기
| 속성 | 값 |
|------|-----|
| min-width | 200px |
| height | 108px |
| border-radius | 32px |
| border | 4px `divider/secondary` = `rgba(19,20,23,0.1)` |

### 타입별 배경색
| 타입 | Enabled | Pressed | Disabled |
|------|---------|---------|----------|
| Number | white | `keyboard/normal/primary_pressed` = `#edeef2` | — |
| Delete | `surface/accent` = `#e0e1e6` | `#e0e1e6` + 20% dark 오버레이 | `#e0e1e6` |
| Clear | `surface/accent` = `#e0e1e6` | `#e0e1e6` + 20% dark 오버레이 | `#e0e1e6` |

### 타이포그래피
| 타입 | 스펙 |
|------|------|
| Number (Enabled/Pressed) | 56px / 72px, ExtraBold, `text/dark/primary` |
| Clear (Enabled) | 40px / 52px, Bold, `text/dark/primary` |
| Clear (Disabled) | 동일, `text/dark/quaternary` = `rgba(19,20,23,0.32)` |
| Delete | 아이콘 48×48px |

---

## 2. Keyboard Normal / Static

전체 QWERTY 키보드.
- Normal: 일반 텍스트 입력, 언어 전환 가능
- Static: 고정 레이아웃

Figma 노드: `67:22936` (Normal), `67:22975` (Static)

---

## 사용 규칙
- Numeric Keypad: Number Field, PIN 입력에 사용
- Keyboard: Text Field 입력에 사용
- Delete: 마지막 문자 삭제 (값 있을 때만 Enabled)
- Clear: 전체 초기화 (값 없을 때 Disabled)
- 각 키는 독립 컴포넌트, 그리드 배치
