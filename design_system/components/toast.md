# Toast

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/toast`
- Figma 노드: `67:32582` (Toast Popup, Components 페이지)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 컴포넌트를 감싸는 최소 컨테이너 |
| Toast message | 알림 텍스트 |

> "앱 서비스를 위한 임시 알림 요소로, 필요에 따라 시스템 메시지를 전달합니다."

```
[ ic_app or ic_icon ] [ Message Text ]
```

선택적으로 아이콘(앱 아이콘 또는 일반 아이콘)이 왼쪽에 위치.

---

## 크기 및 수치

| 속성 | 값 |
|------|-----|
| max-width | 792px |
| padding horizontal | 40px |
| padding vertical | 24px |
| gap | 16px |
| border-radius | 16px |
| 아이콘 크기 | 48×48px |
| 앱 아이콘 radius | 12px |
| 앱 아이콘 border | 1px `divider/secondary` |

---

## 색상

| 요소 | 값 |
|------|-----|
| 배경 | `basic/600` = `#44464e` |
| 텍스트 | `basic/00` = `#ffffff` |

---

## 타이포그래피

| 요소 | 스펙 |
|------|------|
| 메시지 | Body/Small/Strong: 26px / 34px, Bold |

---

## 위치
- 화면 하단 중앙
- margin-bottom: 24px
- margin-horizontal: 24px

---

## 사용 규칙
- 간단한 상태 알림에만 사용 (블루투스 연결, 설정 변경 등)
- 아이콘은 앱 아이콘 또는 심볼 아이콘 중 하나만 (둘 다 X)
- 텍스트만 있는 경우 아이콘 생략 가능
- 비인터랙티브, 자동 소멸
- Loading은 Spinner(Lottie) 사용 — Toast 아님
