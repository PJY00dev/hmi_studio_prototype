# Sliders

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/controllers`
- Figma 노드: `67:24477` (Sliders 전체, Components 페이지)

> "Controllers는 최솟값과 최댓값을 가지며, 범위 내 volume, temperature 등과 같은 속성을 슬라이더 또는 클릭을 통해 조작 가능한 컴포넌트입니다."

---

## 구조 (Anatomy) — Continuous Slider

| 요소 | 설명 |
|------|------|
| Root | 최상위 컨테이너 |
| Control | Track과 Handle을 감싸는 영역 |
| Handle | 드래그 가능한 컨트롤 요소 |
| Track | Handle 이동 영역 표현 |
| Icon (Prefix) | 선택적 아이콘 |
| Icon (Suffix) | 라벨 설명 아이콘 |
| Stepper | 버튼으로 제어하는 요소 |

## 상태 (States)

| 상태 | 타입 | 설명 |
|------|------|------|
| Pressed or Dragging | Boolean | Handle 영역 상호작용 시 True |
| Disabled | Boolean | Min/Max 도달 시 전환 |

## 속성 (Options)

| 속성 | 타입 | 설명 |
|------|------|------|
| MinValue | Number | 최솟값 |
| MaxValue | Number | 최댓값 |
| Step | Number | 값 제어 단계 |

## 동작 (Behaviors)

| 동작 | 설명 |
|------|------|
| Basic | 일반 슬라이더 |
| Floating | 밝은 배경에서 사용 |
| Buttons | 스테퍼 버튼 포함 |

---

## 타입

| 타입 | 설명 |
|------|------|
| Continuous Basic | 기본 슬라이더 (트랙 + 노브) |
| Continuous Floating | 팝업형 값 표시 슬라이더 |

---

## 크기 (Continuous Basic)

### Large
| 속성 | 값 |
|------|-----|
| 전체 구성 | 감소 버튼 + 트랙 + 증가 버튼 |
| label 텍스트 | 32px / 40px, Bold, `text/dark/primary` |
| 버튼 크기 (아이콘) | 56×56px |

### Medium
| 속성 | 값 |
|------|-----|
| 버튼 크기 (아이콘) | 56×56px, radius 16px |
| 버튼 radius | 16px (`buttons/icon/small/rounded_radius`) |
| 트랙 배경 | `controller/slider/normal` = `rgba(19,20,23,0.2)` |
| 노브 색상 | white (`controller/slider/knop`) |
| 노브 radius (small) | 16px |
| label 텍스트 | 30px / 38px, Bold |

### Small
| 속성 | 값 |
|------|-----|
| 버튼 크기 | 48×48px |
| 버튼 pressed bg | `dim/dark/secondary` 10% |

---

## Continuous Floating

| 속성 | 값 |
|------|-----|
| 컨테이너 bg | white (`background/popup`) |
| 컨테이너 border | `controller/slider/continuous/medium/border` |
| 값 표시 | 트랙 위 팝업 레이블 |

---

## 트랙 레벨 (Level)

| Level | 설명 |
|-------|------|
| Min | 최솟값 (노브 없음 또는 최좌측) |
| Low | 낮은 값 |
| Mid | 중간 값 |
| High | 높은 값 |
| Max | 최댓값 (노브 최우측) |

트랙 내 노브 왼쪽은 채워진 영역 (fill color), 오른쪽은 빈 영역.

---

## 버튼 상태
| 상태 | Small 배경 |
|------|-----------|
| Enabled | 없음 |
| Pressed | `dim/dark/secondary` = `rgba(19,20,23,0.1)` |
| Disabled | 아이콘 quaternary 색상 |

---

## 사용 규칙
- 음량, 밝기, 온도 등 연속 값 조절에 사용
- Large: 주요 컨트롤러 (큰 화면)
- Medium/Small: 서브 컨트롤러 (패널 등)
- Floating: 값을 직접 확인하며 조절 (정밀 조정)
- 아이콘 버튼으로 단계 증감 가능 (prefix/suffix)
