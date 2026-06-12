# Fields

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/fields/text-field` / `number-field`
- Figma 노드: `67:27012` (Fields 전체, Components 페이지)

---

## 구조 (Anatomy) — Text Field

| 요소 | 설명 |
|------|------|
| Root | 텍스트 필드 전체를 감싸는 최상위 컨테이너 |
| Field | 사용자가 정보를 입력하는 영역 |
| Cursor | 텍스트 입력 가능 상태를 나타내는 시각적 표시 |
| Placeholder | 입력해야 하는 텍스트 필드 정보 맥락을 제공하는 라벨 |
| Suffix | 텍스트나 아이콘으로 맥락을 전달하는 선택 요소 |

## 상태 (States) — Text Field

| 상태 | 타입 | 설명 |
|------|------|------|
| Value | String | 입력된 텍스트 정보 |
| Focused | Boolean | 터치 또는 음성 입력 시 활성화 |
| Disabled | Boolean | 입력 및 접근 완전 차단 |
| Read Only | Boolean | 값 확인만 가능, 수정 불가 |
| Invalid | Boolean | 입력값이 유효성 조건 미충족 |

## 속성 (Properties) — Text Field

| 속성 | 옵션 | 설명 |
|------|------|------|
| Type | Text / Tel / Url / Email / Password | 입력 타입 |
| Size | Medium / Small | 크기 변형 |

---

## 구조 (Anatomy) — Number Field

| 요소 | 설명 |
|------|------|
| Root | 최상위 컨테이너 |
| Label | 식별 텍스트 |
| Cursor | 입력 중 활성 표시 |
| Field | 숫자 입력 영역 |

## 상태 (States) — Number Field

| 상태 | 타입 | 설명 |
|------|------|------|
| Value | String | 입력된 숫자 텍스트 |
| Focused | Boolean | 활성 필드 선택 표시 |
| Disabled | Boolean | 상호작용 불가 |
| Read Only | Boolean | 보기만 가능 |
| Invalid | Boolean | 입력값 유효성 오류 |

## 속성 (Properties) — Number Field

| 속성 | 옵션 |
|------|------|
| Size | Large / Medium |

---

## 1. Text Field

### 크기
| 속성 | Small | Medium |
|------|-------|--------|
| height | 80px | 100px |
| border-radius | 24px | 24px |
| border (기본/entered) | 2px | 2px |
| border (focused/error) | 3px | 3px |
| padding horizontal | 24px | 32px |
| gap (아이콘~텍스트) | 12px | 16px |
| cursor | 3px × 32px | 3px × 32px |
| suffix icon 크기 | 40×40px | 48×48px |

### 상태별 스타일
| 상태 | 배경 | 보더 색상 |
|------|------|-----------|
| Enabled | white | `divider/secondary` rgba(19,20,23,0.1) |
| Focused | white | `field/focused` = `#313236` |
| Typing | white | `field/focused` = `#313236` |
| Entered | white | `divider/secondary` |
| Read Only | `surface/high` = `#edeef2` | `divider/secondary` |
| Error | white | `regulation/red` = `#f62e24` |

### 타이포그래피
| 요소 | Small | Medium |
|------|-------|--------|
| Placeholder | 30px / 38px, Regular, `text/dark/tertiary` | 36px / 44px, Regular, `text/dark/tertiary` |
| 입력 텍스트 | 30px / 38px, Regular, `text/dark/primary` | 36px / 44px, Regular, `text/dark/primary` |
| Help Text | 26px / 34px, Regular, `text/dark/secondary` | 동일 |
| Error Text | 26px / 34px, Regular, `regulation/red` | 동일 |

### Help Text 간격
| 속성 | Small | Medium |
|------|-------|--------|
| 필드~헬프텍스트 gap | 12px | 16px |
| help text padding horizontal | 16px | 16px |

---

## 2. Number Field

PIN/숫자 전용 입력. 키패드와 함께 사용.

### 크기
| 속성 | Medium | Large |
|------|--------|-------|
| 크기 | 128×128px | 140×180px |
| border-radius | 32px | 32px |
| border | 4px | 4px |

### 상태별 스타일
| 상태 | 배경 | 보더 색상 |
|------|------|-----------|
| Enabled | 없음 | `divider/secondary` |
| Focused | `dim/dark/secondary` 10% | `field/focused` = `#313236` |
| Entered | 없음 | `divider/secondary` |
| Error | 없음 | `regulation/red` = `#f62e24` |

### 타이포그래피
| 요소 | 스펙 |
|------|------|
| 숫자 | 60px / 80px, ExtraBold (`Headline/Large/Extra_Strong`) |
| 커서 | 4px × 48px, `icon/dark/primary` |

---

## 사용 규칙
- Text Field 전체 너비 기준: 700px (부모 컨테이너에 맞게 가변)
- Number Field: 키패드 입력과 반드시 함께 사용
- Error 상태에서만 error help text 표시
- Read Only에서 suffix icon 숨김
