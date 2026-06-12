# Steppers

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/controllers`
- Figma 노드: `67:25154` (Steppers 전체, Components 페이지)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 최상위 컨테이너 |
| Current value | 현재값과 Step 버튼을 감싸는 영역 |
| i++ | 증가 컨트롤 요소 |
| i-- | 감소 컨트롤 요소 |

## 상태 (States)

| 상태 | 타입 | 설명 |
|------|------|------|
| Pressed or Dragging | Boolean | Handle 영역 상호작용 시 True |
| Disabled | Boolean | Min/Max 도달 시 True |

```
[ − 버튼 ] | [ 값 표시 ] | [ + 버튼 ]
```

좌우 아이콘 버튼 + 구분선 + 중앙 값 텍스트.

---

## 크기 및 수치

| 속성 | 값 |
|------|-----|
| 전체 width | 420px |
| 전체 height | 100px |
| border-radius | 24px |
| border | 2px `divider/secondary` = `rgba(19,20,23,0.1)` |
| background | white (`controller/stepper_background`) |
| shadow | Level1 |
| padding horizontal | 24px |
| padding vertical | 18px |
| gap (내부) | 24px |

### 아이콘 버튼
| 속성 | 값 |
|------|-----|
| 크기 | 64×64px |
| radius | 16px (`buttons/icon/small/rounded_radius`) |
| 아이콘 | 44×44px |

### 구분선
| 속성 | 값 |
|------|-----|
| width | 2px (divider 이미지) |
| height | 컨테이너 전체 |

---

## 타이포그래피

| 요소 | 스펙 |
|------|------|
| 값 텍스트 | Title/Medium/Strong: 36px / 44px, Bold, `text/dark/primary`, 중앙 정렬 |

---

## 사용 규칙
- 온도, 좌석 열선 단계 등 단계 수치 조절에 사용
- 값 영역은 `flex: 1` (남은 공간 채움)
- 최솟값/최댓값 도달 시 해당 버튼 Disabled 처리
- Stepper는 항상 최소 범위 내에서 동작 (무한 스크롤 X)
