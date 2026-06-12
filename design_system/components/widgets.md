# Widgets

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/widgets`
- Figma 노드: 미정의 (Components 및 Foundation 페이지에 별도 섹션 없음)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | 컴포넌트를 감싸는 최상위 컨테이너 |
| Handle | 위젯을 숨기기 위한 드래그 영역 |
| Pagination | 사용 가능한 위젯 수와 현재 위치 표시 |
| Title / Action area | 위젯 타이틀과 컨트롤 옵션 영역 |
| Information area | 위젯이 제공하는 주요 정보 영역 |

---

## 속성 (Properties)
- 시각적 다이어그램으로 제공 (문서에서 텍스트 수치 미제공)
- Interaction 섹션 포함

---

## 사용 규칙
- GNB 또는 앱 화면에서 빠른 정보 확인 / 조작에 사용
- Handle 드래그로 위젯 숨김 가능
- Pagination으로 여러 위젯 간 이동
- Title/Action으로 위젯 제목 표시 및 추가 조작 버튼 제공
- Information area에 날씨, 음악, 내비게이션 등 핵심 정보 표시

---

## 프로토타입 구현 현황

현재 프로토타입에서 사용되는 위젯 패턴:
- 내비게이션 위젯
- 전화 위젯
- Spotify / 미디어 위젯
- Android Auto 위젯
- 에어컨 온도 / 팬 속도 / 시트 히터 빠른 설정 위젯
