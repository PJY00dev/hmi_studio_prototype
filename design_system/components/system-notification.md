# System Notification

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/notification/system-notification`
- Figma 노드: `67:33989` (System Notification 전체, Components 페이지)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 전체 알림을 감싸는 최상위 컨테이너 |
| Imagery | 알림 맥락을 위한 선택적 시각 요소 |
| Header | 알림 목적에 따른 피드백을 제공하는 설명 텍스트 |
| Action | 설명을 확인하거나 사용자 참여를 유도하는 버튼 |

## 이미지 타입 (Types)

| 타입 | 용도 |
|------|------|
| App icon | 앱별 알림에 사용 |
| Profile | 통화/메시지 등, 앱 아이콘 정보 선택 표시 |
| Image | 내비게이션 정보 또는 기타 알림 |
| Action | 확인 또는 참여 버튼 |

## 속성 (Properties)

| 속성 | 옵션 | 설명 |
|------|------|------|
| Button Alignment | Single / Vertical / Horizontal | 버튼 배치 방식 |

```
┌──────────────────────────────────────┐
│ [이미지/프로필]  제목 (36px ExtraBold) │  ← Header
│                설명 (26px Regular)    │
├──────────────────────────────────────┤
│ [ 주요 CTA ]        [ 보조 액션 ]      │  ← Buttons
└──────────────────────────────────────┘
```

---

## 크기 및 수치

### 컨테이너
| 속성 | 값 |
|------|-----|
| width | 700px |
| border-radius | 48px |
| border | 1px `divider/secondary` |
| background | white |
| shadow | Level3 |

### Header
| 속성 | 값 |
|------|-----|
| padding top | 32px |
| padding horizontal | 32px |
| padding bottom | 16px |
| gap | 24px |

### 버튼 영역
| 속성 | 값 |
|------|-----|
| padding (all) | 24px |
| gap | 16px |

---

## 이미지 타입
| 타입 | 크기 | 형태 |
|------|------|------|
| App | 100×100px | 사각형 radius 24px |
| Profile | 100×100px | 원형 radius 999px |
| Image | 100×100px | 사각형 (내부 처리) |

**Profile 앱 배지**: 48×48px, radius 16px, border 1px `divider/secondary`, shadow Level2  
위치: 오른쪽 하단 (left 60px, top 60px offset)

---

## 타이포그래피
| 요소 | 스펙 |
|------|------|
| 제목 | 36px / 44px, ExtraBold (`Title/Medium/Extra_Strong`) |
| 설명 | 26px / 34px, Regular (`Body/Small/Normal`) |
| 제목 색상 | `text/dark/primary` |
| 설명 색상 | `text/dark/tertiary` = `rgba(19,20,23,0.64)` |
| 텍스트 상단 패딩 | 4px |
| 텍스트 gap | 12px |

---

## 버튼 타입 (Medium 버튼)
| 타입 | 구성 | 주요 버튼 색상 | 보조 버튼 색상 |
|------|------|---------------|---------------|
| Single | 버튼 1개 | `button/basic/enabled` rgba(19,20,23,0.05) | — |
| Horizontal | 2개 가로 | `button/filled/enabled` #44464e | `button/basic/enabled` |
| Vertical | 2개 세로 | `button/filled/enabled` #44464e | `button/basic/enabled` |
| Call | 수신+거절 | `phone/accept_normal` = `#32b957` | `phone/end_normal` = `#fe3d16` |

### 버튼 크기 (Medium)
| 속성 | 값 |
|------|-----|
| height | 80px |
| padding horizontal | 32px |
| padding vertical | 16px |
| gap | 14px |
| border-radius | 24px |
| 텍스트 | 30px / 38px, Bold |

---

## 알림 타입
| 타입 | 이미지 |
|------|--------|
| Image + Text | 좌측 이미지 표시 |
| Only Text | 이미지 없음 (텍스트에 padding 8px 추가) |
| Call | Profile + 앱 배지 |

---

## 사용 규칙
- 화면 상단/우측에 오버레이로 표시
- 운전 중 버튼 최소화 권장
- Call 타입은 전화 수신 전용
