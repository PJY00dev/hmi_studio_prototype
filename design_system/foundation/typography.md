# Typography

## 소스
- 웹: `https://document.pleos.ai/docs/connect/guide/docs-design/foundations/typography`
- Figma 노드: `67:11477` (Typography 프레임, Foundation 페이지)

> "폰트는 중립적인 형태와 균일한 수준의 시인성을 확보할 수 있는 서체를 사용해야 합니다."

### 디자인 원칙
- 최소 폰트 크기: **12sp** (Android 접근성, 약 18px 이상 권장)
- 위계 레벨: Headline > Title > Body > Label
- 정보 위계 차별화를 위해 sub-text 전략적 활용
- 과도하게 스타일화된 폰트 사용 금지

---

## 폰트 패밀리

| 항목 | 값 |
|------|-----|
| System Font | **Asta Sans** |
| 파일 위치 | `assets/fonts/AstaSans-*.woff2` |
| CSS 변수 | `--font-sans: "Asta Sans"` |
| 최소 폰트 크기 | 18px 이상 (Android 접근성 가이드라인 12sp 기준) |

---

## 웨이트 (Weight)

| 이름 | font-weight | CSS 변수 |
|------|-------------|----------|
| Normal | 400 | `--type-weight-Normal` |
| Strong / Bold | 700 | `--type-weight-Strong` |
| Extrastrong / ExtraBold | 800 | `--type-weight-Extrastrong` |

---

## 타입 스케일 (Figma 기준)

### Headline
| 스케일 | Size | Line Height | Weight |
|--------|------|------------|--------|
| Large | 60px | 80px | Extrastrong / Strong |
| Medium | 56px | 72px | Extrastrong / Strong |
| Small | 48px | 64px | Extrastrong / Strong |

### Title
| 스케일 | Size | Line Height | Weight |
|--------|------|------------|--------|
| Large | 40px | 52px | Extrastrong / Strong / Normal |
| Medium | 36px | 44px | Extrastrong / Strong / Normal |
| Small | 32px | 40px | Strong / Normal |

### Body
| 스케일 | Size | Line Height | Weight |
|--------|------|------------|--------|
| Large | 30px | 38px | Strong / Normal |
| Medium | 28px | 36px | Strong / Normal |
| Small | 26px | 34px | Strong / Normal |

### Label
| 스케일 | Size | Line Height | Weight |
|--------|------|------------|--------|
| Medium | 24px | 28px | Normal |
| Small | 20px | 24px | Normal |

---

## Feature Font (특수 용도)

### Driving View (Figma: `67:12858`)
| 항목 | Size | Line Height | 용도 |
|------|------|------------|------|
| Speed | 112px | 134px | 주행 중 속도 표시 |
| Traffic Sign | 36px | 44px | 교통 표지판 |
| Bubble | 30px | 48px | 말풍선 |

### Ambient AI (Figma: `67:12893`)
별도 스케일 적용 — 필요 시 해당 노드 직접 조회

---

## CSS 변수 전체 목록

```css
--type-weight-Normal: 400;
--type-weight-Strong: 700;
--type-weight-Extrastrong: 800;

--type-headline-large-size: 60px;       --type-headline-large-line-height: 80px;
--type-headline-medium-size: 56px;      --type-headline-medium-line-height: 72px;
--type-headline-small-size: 48px;       --type-headline-small-line-height: 64px;

--type-title-large-size: 40px;          --type-title-large-line-height: 52px;
--type-title-medium-size: 36px;         --type-title-medium-line-height: 44px;
--type-title-small-size: 32px;          --type-title-small-line-height: 40px;

--type-body-large-size: 30px;           --type-body-large-line-height: 38px;
--type-body-medium-size: 28px;          --type-body-medium-line-height: 36px;
--type-body-small-size: 26px;           --type-body-small-line-height: 34px;

--type-label-medium-size: 24px;         --type-label-medium-line-height: 28px;
--type-label-small-size: 20px;          --type-label-small-line-height: 24px;

--type-driving-speed-size: 112px;       --type-driving-speed-line-height: 134px;
--type-traffic-sign-size: 36px;         --type-traffic-sign-line-height: 44px;
--type-bubble-size: 30px;               --type-bubble-line-height: 48px;
```

---

## 사용 규칙
- `letter-spacing: 0` (모든 스케일)
- 숫자 표시 시 `font-feature-settings: "lnum" 1, "pnum" 1`
- 최소 크기 18px 미만 사용 금지
- 웨이트는 스케일별 허용 범위 내에서만 사용 (예: Label은 Normal만)
