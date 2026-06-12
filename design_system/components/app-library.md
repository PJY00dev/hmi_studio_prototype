# App Library

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/app-library`
- Figma 노드: 미정의 (Components 페이지에 별도 섹션 없음)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 최상위 컨테이너 |
| Editing guide | 편집 모드 중 표시되는 가이드 |
| Complete button | 재배치/삭제 후 변경사항 저장 버튼 |
| Climate control | Heat, ventilation 등 공조 컨트롤 버튼 영역 |
| App | 내장 앱 및 다운로드 앱 |
| Pagination | Climate control 및 App 노출 가능 수 초과 시 표시 |
| Divider | Climate와 App 섹션 구분선 |

---

## 동작 (Behaviors)

### 일반 모드 (Normal Mode)
- 행당 최대 7개 (Connect-S 기준)
- 콘텐츠가 2행 이상이면 좌/우 내비게이션 표시
- 상단 메뉴: 차량 기능 제어
- 하단 메뉴: 앱 실행

### 편집 모드 (Editing Mode)
- GNB 기본 앱 / 내장 앱: 이동 불가 → 비활성 표시
- 차량 제어 앱: 지정 영역으로만 이동 가능
- 이동 불가 영역 드래그 시 비활성 표시
- Frost/Defrost: 지역 규정에 따라 삭제 불가

---

## 사용 규칙
- GNB의 앱 라이브러리 버튼으로 진입
- 편집은 롱프레스로 시작
- Complete 버튼으로 편집 완료
