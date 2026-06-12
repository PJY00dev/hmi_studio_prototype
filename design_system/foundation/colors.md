# Colors

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/foundations/colors`
- Figma 노드: `67:14834` (Colors 프레임, Foundation 페이지)
- Figma 변수: `get_variable_defs` on `FKNjhVLOqG2JarL1ksV5H0 / 67:14834`

> "Color는 하나의 제품으로써 브랜드 아이덴티티를 유지하기 위한 도구이자, 고객의 혼란을 최소화 하기 위해 색상 대비를 통해 소프트웨어 내에서 명확한 정보의 위계를 표현할 수 있어야 합니다."

### 색상 체계 구분

| 카테고리 | 설명 |
|---------|------|
| Basic (Grayscale) | 가장 기본적인 흑백 컬러로 투명도가 없는 색상 |
| Alpha Colors | 투명도 조절 가능한 색상 (배경, 요소 조합용) |
| Static Colors | 라이트/다크 테마 관계없이 원본 값 유지 (오버레이 요소용) |
| System Colors | 18가지 UI 컴포넌트별 특수 색상 (Background, Button, Controller, Climate, Dropdown, Dim, Driving, Fields, Gleo AI, Icon, Informative, Keyboard, Media, Overlay, Phone, Regulation, Surface, Switch, Text) |

---

## 색상 체계

### 1. Basic (Grayscale) — 불투명 단색

| 토큰 | Hex | 용도 |
|------|-----|------|
| `basic/00` | `#ffffff` | 흰색 |
| `basic/50` | `#f7f8fa` | 배경 기본 |
| `basic/100` | `#edeef2` | 배경 보조 |
| `basic/200` | `#e0e1e6` | 구분선 강조 |
| `basic/300` | `#c7c9ce` | 비활성 요소 |
| `basic/400` | `#a4a8ae` | 보조 텍스트 |
| `basic/500` | `#686a72` | 중간 강조 |
| `basic/600` | `#44464e` | Secondary 버튼 배경 |
| `basic/700` | `#313236` | 눌림 상태 |
| `basic/800` | `#1d1e21` | Surface container |
| `basic/900` | `#131417` | 다크 프라이머리 |

> Figma 값이 공식 기준. `--pleos-basic-100`, `--pleos-basic-200` 수정 완료. `--pleos-basic-150`은 Figma에 없어 제거됨.

---

### 2. Alpha (투명도 색상)

#### Light Alpha (흰색 기반)
| 토큰 | Hex | Opacity |
|------|-----|---------|
| `alpha/light/50` | `#ffffff0d` | 5% |
| `alpha/light/100` | `#ffffff1a` | 10% |
| `alpha/light/200` | `#ffffff33` | 20% |
| `alpha/light/300` | `#ffffff4d` | 30% |
| `alpha/light/400` | `#ffffff66` | 40% |
| `alpha/light/500` | `#ffffff80` | 50% |

#### Dark Alpha (검정 기반)
| 토큰 | Hex | Opacity |
|------|-----|---------|
| `alpha/dark/50` | `#1314170d` | 5% |
| `alpha/dark/100` | `#1314171a` | 10% |
| `alpha/dark/200` | `#13141733` | 20% |
| `alpha/dark/300` | `#1314174d` | 30% |
| `alpha/dark/400` | `#13141766` | 40% |
| `alpha/dark/500` | `#13141780` | 50% |

---

### 3. Static (테마 불변 색상)

라이트/다크 테마에 영향을 받지 않음. 주로 Overlay 위 요소에 사용.

| 토큰 | Hex | Opacity |
|------|-----|---------|
| `static/light/100` | `#ffffff` | 100% |
| `static/light/200` | `#ffffffd6` | 84% |
| `static/light/300` | `#ffffffa3` | 64% |
| `static/light/400` | `#ffffff52` | 32% |
| `static/dark/100` | `#131417` | 100% |
| `static/dark/200` | `#131417d6` | 84% |
| `static/dark/300` | `#131417a3` | 64% |
| `static/dark/400` | `#13141752` | 32% |

---

## 시맨틱 색상 토큰 (System Colors)

### Background
| 토큰 | Hex | 용도 |
|------|-----|------|
| `background/primary` | `#f7f8fa` | 메인 배경 |
| `background/secondary` | `#ffffff` | 보조 배경 |
| `background/popup` | `#ffffff` | 팝업 배경 |

### Text
| 토큰 | Hex | 용도 |
|------|-----|------|
| `text/dark/primary` | `#131417` | 기본 텍스트 |
| `text/dark/secondary` | `#131417d6` | 보조 텍스트 (84%) |
| `text/dark/tertiary` | `#131417a3` | 3차 텍스트 (64%) |
| `text/dark/quaternary` | `#13141752` | 비활성 텍스트 (32%) |
| `text/light/primary` | `#ffffff` | 밝은 배경 위 기본 |
| `text/light/secondary` | `#ffffffd6` | 밝은 배경 위 보조 |
| `text/light/tertiary` | `#ffffffa3` | 밝은 배경 위 3차 |
| `text/light/quaternary` | `#ffffff52` | 밝은 배경 위 비활성 |

### Icon
| 토큰 | Hex |
|------|-----|
| `icon/dark/primary` | `#131417` |
| `icon/dark/secondary` | `#131417d6` |
| `icon/dark/tertiary` | `#131417a3` |
| `icon/dark/quaternary` | `#13141752` |
| `icon/light/primary` | `#ffffff` |
| `icon/light/secondary` | `#ffffffd6` |
| `icon/light/tertiary` | `#ffffffa3` |
| `icon/light/quaternary` | `#ffffff52` |

### Divider
| 토큰 | Hex | Opacity |
|------|-----|---------|
| `divider/primary` | `#1314170d` | 5% |
| `divider/secondary` | `#1314171a` | 10% |
| `divider/tertiary` | `#13141733` | 20% |

### Dim (어두운 오버레이)
| 토큰 | Hex |
|------|-----|
| `dim/dark/primary` | `#1314170d` |
| `dim/dark/secondary` | `#1314171a` |
| `dim/dark/tertiary` | `#13141733` |
| `dim/light/primary` | `#ffffff80` |
| `dim/light/secondary` | `#ffffff66` |
| `dim/light/tertiary` | `#ffffff4d` |

### Overlay
| 토큰 | Hex |
|------|-----|
| `overlay/default` | `#13141733` |

### Surface
| 토큰 | Hex | 용도 |
|------|-----|------|
| `Surface/container` | `#1d1e21` | 다크 컨테이너 |

### Switch
| 토큰 | Hex | 용도 |
|------|-----|------|
| `Miscellaneous/Switch/background-on` | `#02c265` | 켜진 상태 트랙 |
| `switch/off` | `#1314174d` | 꺼진 상태 트랙 |
| `switch/disabled` | `#1314171a` | 비활성 트랙 |
| `Miscellaneous/Switch/button-*` | `#ffffff` | 토글 버튼 |

### Button (Call 전용)
| 토큰 | Hex |
|------|-----|
| `Button/Call/accept-normal` | `#32b957` |
| `Button/Call/accept-pressed` | `#279e47` |
| `Button/Call/end-normal` | `#fe3d16` |
| `Button/Call/end-pressed` | `#e73612` |

### Miscellaneous
| 토큰 | Hex | 용도 |
|------|-----|------|
| `Miscellaneous/Charging/normal` | `#00db25` | 충전 중 |
| `Miscellaneous/Charging/deep` | `#00b975` | 충전 완료 |
| `Feature/Media/radio-primary` | `#c911e7` | 라디오 브랜드 |
| `Feature/Media/music-primary` | `#4781ff` | 뮤직 브랜드 |

---

## CSS 변수 매핑 (styles.css 기준)

현재 프로토타입에서 사용 중인 변수와 Figma 토큰 대응:

| styles.css 변수 | Figma 토큰 | 값 |
|----------------|-----------|-----|
| `--text-dark-primary` | `text/dark/primary` | `#131417` ✅ |
| `--text-light-primary` | `text/light/primary` | `#ffffff` ✅ |
| `--btn-filled-enabled` | `basic/600` | `#44464e` ✅ |
| `--pleos-basic-50` | `basic/50` | `#f7f8fa` ✅ |
| `--pleos-basic-100` | `basic/100` | `#edeef2` ✅ |
| `--pleos-basic-200` | `basic/200` | `#e0e1e6` ✅ |
