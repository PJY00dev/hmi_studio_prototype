# Status Bar

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/status-bar`
- Figma 노드: `39690:11164` (SP1 Dynamic 프레임), `39690:11192` (privacy_indicator)

> "차량 내 주행 및 주요 시스템 상태를 인지할 수 있는 영역입니다."

---

## 구조 (Anatomy) — 7개 섹션

| 섹션 | 우선순위 | 설명 |
|------|---------|------|
| SP0 Static | High | 고정 고우선 인디케이터 (Door Lock, Search) |
| SP0 Dynamic | High | 이벤트 기반 고우선 인디케이터 (Notifications, In-call, Privacy) |
| SP1 Dynamic | Low | 이벤트 인디케이터 (Download, Update, WPC, Hi-Pass, Sound) |
| SP1 Dynamic Hotspot | Low | 네트워크 상태 다음에 위치하는 네트워크 관련 버튼 |
| SP1 Static | Low | 고정 저우선 상태 (Profile, Bluetooth, Network) |
| Time | — | 시스템 시간 (24h 또는 12h 형식) |
| PAB | — | 조수석 에어백 상태 인디케이터 |
| More Menu | — | 공간 부족 시 추가 아이콘 |

---

## 상태 (States)

### Static Icons
| 상태 | 타입 |
|------|------|
| Pressed | Boolean |
| Selected | Boolean |

### Dynamic Icons
| 상태 | 타입 | 설명 |
|------|------|------|
| Activate | Boolean | 활성화 시 나타남 (왼쪽 정렬 순서로) |

---

## Menu Panels

상태 메뉴 아이템은 Pressed / Selected 상태 지원:
- 기기 연결 (Bluetooth, Wi-Fi 등)
- 프로필 관리

---

## 아이콘 크기
- 아이콘 영역: `68×68px` (Figma 기준)
- privacy_indicator: `100×56px`
