# Buttons

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/actions/basic-button` ~ `icon-button`
- Figma 노드: `67:22479` (Buttons 프레임 전체)

---

## 1. Basic Button

> "가장 기본적인 버튼으로 명확한 영역과 텍스트를 통해 고객의 행동을 유도할 수 있습니다."

### 구조 (Anatomy)
| 요소 | 설명 |
|------|------|
| Root | 버튼을 감싸는 최상위 컨테이너 |
| Label | 버튼 레이블 텍스트 |
| Icon (Prefix) | 레이블 왼쪽 아이콘 |
| Icon (Suffix) | 레이블 오른쪽 아이콘 |

### 상태 (States)
| 상태 | 타입 | 설명 |
|------|------|------|
| Pressed | Boolean | 터치/클릭 중인 상태 |
| Disabled | Boolean | 제어 불가능한 상태 |
| Loading | Boolean | 로더 표시, 제어 불가 |

### 속성 (Properties)
| 속성 | 옵션 | 설명 |
|------|------|------|
| Hierarchy | Primary / Secondary | 버튼 우선순위 레벨 |
| Size | Large / Medium / Small | 크기 변형 |

### 사용 규칙
- 명확한 행동 유도(CTA)가 필요한 경우 사용
- Primary: 주요 액션 (배경 없는 흰 배경 계열)
- Secondary (Filled): 강조 필요한 보조 액션

### 타입 (Type)
| 타입 | 배경 | 텍스트 색상 |
|------|------|-------------|
| Primary | `rgba(19,20,23,0.05)` | `#131417` |
| Secondary | `#44464e` | `#ffffff` |

### 크기별 수치 (Figma 기준)

| 속성 | Large | Medium | Small |
|------|-------|--------|-------|
| Height | 100px | 80px | 64px |
| Min-width | 140px | 120px | 100px |
| Padding H | 40px | 32px | 24px |
| Padding V | 16px | 16px | 8px |
| Gap | 16px | 14px | 12px |
| Border radius | 32px | 24px | 16px |
| Icon size | 52px | 40px | 32px |
| Font size | 32px | 30px | 26px |
| Line height | 40px | 38px | 34px |
| Font weight | Bold (700) | Bold (700) | Bold (700) |

### 상태별 색상 (Primary 기준)

| 상태 | 배경 | 텍스트 | 테두리 |
|------|------|--------|--------|
| Enabled | `rgba(19,20,23,0.05)` | `#131417` | — |
| Pressed | `rgba(19,20,23,0.1)` | `#131417` | — |
| Disabled | `rgba(255,255,255,0.2)` | `rgba(19,20,23,0.32)` | 2px solid `rgba(19,20,23,0.1)` |

### CSS 토큰 참조
```css
--button/basic/enabled:   rgba(19,20,23,0.05)
--button/basic/pressed:   rgba(19,20,23,0.1)
--button/basic/disabled:  rgba(255,255,255,0.2)
--button/filled/enabled:  #44464e
--text/dark/primary:      #131417
--text/dark/quaternary:   rgba(19,20,23,0.32)
--text/light/primary:     #ffffff
--divider/secondary:      rgba(19,20,23,0.1)
```

---

## 2. Toggle Button

> "On/Off가 가능한 버튼으로 다수의 옵션 제공 시 상태 인식에 유용합니다."

### 구조 (Anatomy)
| 요소 | 설명 |
|------|------|
| Root | 버튼을 감싸는 최상위 컨테이너 |
| Label | 버튼 레이블 텍스트 |
| Icon (Prefix) | 레이블 왼쪽 아이콘 |
| Icon (Suffix) | 레이블 오른쪽 아이콘 |

### 상태 (States)
| 상태 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| Toggled | Boolean | False | 활성화 시 True |
| Pressed | Boolean | False | 드래그 가능 윈도우에서 True |
| Disabled | Boolean | — | 제어 불가능 상태 |

### 속성 (Properties)
| 속성 | 옵션 | 설명 |
|------|------|------|
| Floating | Boolean | 배경에 따라 그림자/색상 변화 적용 |
| Size | Large / Medium / Small | 크기 변형 |

### 사용 규칙
- 여러 옵션 중 On/Off 상태가 필요한 경우
- Floating=true: 밝은 배경 위에 사용 (그림자 추가)

### 크기별 수치 (Figma 기준 — Basic Button과 동일한 사이즈 스케일)

| 속성 | Large | Medium | Small |
|------|-------|--------|-------|
| Height | 100px | 80px | 64px |
| Border radius | 32px | 24px | 16px |

---

## 3. Text Button

> "텍스트 버튼은 부가 정보에 대한 링크를 위해 주로 사용되며, 앞/뒤 아이콘을 통해 정보 전달력을 강화할 수 있습니다."

### 구조 (Anatomy)
| 요소 | 설명 |
|------|------|
| Root | 버튼을 감싸는 최상위 컨테이너 |
| Label | 버튼 레이블 텍스트 |
| Icon (Prefix) | 레이블 왼쪽 아이콘 |
| Icon (Suffix) | 레이블 오른쪽 아이콘 |

### 상태 (States)
| 상태 | 타입 | 설명 |
|------|------|------|
| Pressed | Boolean | 터치 시 활성화 |
| Disabled | Boolean | 제어 불가 |
| Loading | Boolean | 로더 표시, 제어 불가 |

### 사용 규칙
- 부가 정보 링크 또는 보조 액션에 사용
- 배경/테두리 없음 — 텍스트 색상(`--informative/positive`)으로만 구분
- 아이콘으로 정보 전달력 강화 가능

### 크기별 수치 (Figma 기준)

| 속성 | Medium | Small |
|------|--------|-------|
| Gap | 8px | 8px |
| Icon size | 32px | — |
| Font size | 30px | 26px |
| Line height | 38px | 34px |
| Font weight | Bold (700) | Bold (700) |

### 색상
| 상태 | 텍스트 색상 |
|------|-------------|
| Enabled | `#0064ff` (`--informative/positive`) |
| Disabled | `rgba(19,20,23,0.32)` |

> Text Button은 배경/테두리 없음. 텍스트 색상으로만 구분.

---

## 4. Icon Button

> "아이콘 버튼은 어떤 고객이든 직관적으로 인지할 수 있는 경우에 사용합니다."

### 구조 (Anatomy)
| 요소 | 설명 |
|------|------|
| Root | 버튼을 감싸는 최상위 컨테이너 |
| Icon | 아이콘을 통해 버튼 정보를 전달하는 영역 |

### 상태 (States)
| 상태 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| Pressed | Boolean | False | 드래그 가능 윈도우에서 True |
| Disabled | Boolean | — | 제어 불가능 상태 |

### 속성 (Properties)
| 속성 | 옵션 | 설명 |
|------|------|------|
| Style | Basic / Plain / Circle | 시각적 스타일 선택 |
| Size | Large / Medium / Small | 크기 선택 |

### 사용 규칙
- 의미가 직관적으로 명확한 아이콘에만 사용
- Basic: 배경 영역 있음 (가장 일반적)
- Plain: 배경 없음 (텍스트와 인라인 사용 시)
- Circle: 원형 배경 (프로필, 미디어 제어 등)

### 크기별 수치 (Figma 기준)

| 속성 | Large | Medium | Small |
|------|-------|--------|-------|
| Width | — | 80px | 64px |
| Height | — | 80px | 64px |
| Border radius (Basic) | — | 20px | 16px |
| Border radius (Circle) | — | 50% | 50% |
| Border radius (Plain) | — | 0 / none | 0 / none |
| Icon area | — | 56px | — |

### 상태별 색상 (Basic 기준)
| 상태 | 배경 |
|------|------|
| Enabled | `rgba(19,20,23,0.05)` |
| Pressed | `rgba(19,20,23,0.1)` |
| Disabled | `rgba(255,255,255,0.2)` |

---

## CSS 구현 패턴 (프로토타입용)

```css
/* Basic Button — Primary */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-weight: 700;
  background: rgba(19, 20, 23, 0.05);
  color: #131417;
  border: none;
  cursor: pointer;
  transition: background 120ms ease;
}
.btn:active { background: rgba(19, 20, 23, 0.1); }
.btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(19, 20, 23, 0.1);
  color: rgba(19, 20, 23, 0.32);
  cursor: not-allowed;
}

/* Secondary */
.btn.btn-secondary { background: #44464e; color: #ffffff; }

/* Size: Large */
.btn-lg { height: 100px; min-width: 140px; padding: 16px 40px; gap: 16px; border-radius: 32px; font-size: 32px; line-height: 40px; }
/* Size: Medium */
.btn-md { height: 80px; min-width: 120px; padding: 16px 32px; gap: 14px; border-radius: 24px; font-size: 30px; line-height: 38px; }
/* Size: Small */
.btn-sm { height: 64px; min-width: 100px; padding: 8px 24px; gap: 12px; border-radius: 16px; font-size: 26px; line-height: 34px; }

/* Icon Button — Basic Medium */
.btn-icon-md { width: 80px; height: 80px; border-radius: 20px; background: rgba(19, 20, 23, 0.05); }
/* Icon Button — Basic Small */
.btn-icon-sm { width: 64px; height: 64px; border-radius: 16px; background: rgba(19, 20, 23, 0.05); }
/* Icon Button — Circle */
.btn-icon-circle { border-radius: 50%; }
```
