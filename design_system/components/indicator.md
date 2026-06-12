# Indicator

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/components/indicator`
- Figma 노드: 미정의 (Components 및 Foundation 페이지에 별도 섹션 없음)

---

## 구조 (Anatomy)

| 요소 | 설명 |
|------|------|
| Root | App bar 컴포넌트를 감싸는 최상위 컨테이너 |
| Present Value | 현재 선택된 값을 표시하는 영역 |
| Next / Prev Value | 선택 가능한 이전/다음 값을 표시하는 영역 |

---

## 상태 (States)

| 상태 | 타입 | 설명 |
|------|------|------|
| Present | Boolean | 현재 값과 Present 상태가 일치하면 True |

---

## 속성 (Properties)

| 속성 | 옵션 | 설명 |
|------|------|------|
| Size | Wide / Narrow | 인디케이터 아이템 크기 변형 |

---

## 사용 규칙
- 캐러셀, 탭 등 복수 콘텐츠의 현재 위치를 시각적으로 표시
- Present Value는 현재 선택된 항목을 강조 표시
- Next/Prev Value는 인접 항목을 흐리게 표시
- Wide: 넓은 공간에서 사용 (홈 화면 위젯 페이지네이션 등)
- Narrow: 좁은 공간에서 사용 (상태 바 등)
