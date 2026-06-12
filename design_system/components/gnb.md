# GNB (Global Navigation Bar)

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/gnb`
- Figma 노드: 미정의 (Components 페이지에 별도 섹션 없음)

> "Pleos Connect 이용에 필요한 필수 기능을 빠르게 실행하기 위한 영역입니다."

---

## 구조 (Anatomy)

3개 주요 제어 영역으로 구성:
| 영역 | 설명 |
|------|------|
| Driver-side climate control | 운전석(좌측 전방) 온도 조절 |
| Application controls | 차량 내 앱 조작 영역 |
| Passenger-side climate control | 조수석(우측 전방) 온도 조절 |

---

## 구성 요소 (Items)

| 요소 | 편집 가능 | 설명 |
|------|----------|------|
| Vehicle settings | ❌ | 차량 설정 진입 (고정) |
| Climate panel toggle | ❌ | 공조 패널 열기/닫기 |
| Defrost controls | ❌ | FR/RR 서리 제거 (팝업 토글) |
| Navigation app | ❌ | 중앙 고정 내비게이션 앱 |
| Customizable slots (×3) | ✅ | 사용자 설정 앱 슬롯 |
| App library | ❌ | 앱 라이브러리 진입 |
| Recent apps (×2) | ❌ (read-only) | 최근 사용 앱 2개 표시 |

---

## 편집 모드 (Edit Mode)

- 진입: 편집 가능 슬롯 **롱프레스(2~3초)**
- GNB 기본 앱 / 차량 설정 앱: 이동 불가, 비활성화 표시
- 차량 제어 앱: 지정 영역 내에서만 이동
- 일반 앱: 재배치 및 삭제 가능
- Frost/Defrost: 지역 규정에 따라 GNB에 필수 포함될 수 있음
- Recent apps 영역: 편집 불가 (read-only)

---

## OSD 패널

물리적 스티어링 휠 컨트롤로 트리거:
- 미디어, 차량 시스템, 적응형 크루즈 거리 조절 상태 변경 표시
- **2초간 비활성** 후 자동 소멸

---

## 사용 규칙
- GNB는 항상 화면 하단 고정
- 편집 모드 진입 전까지 앱 슬롯 변경 불가
- Climate 단축키는 앱 라이브러리에 존재하지만 삭제 불가
