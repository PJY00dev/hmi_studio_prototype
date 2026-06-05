# Pleos Connect Typography

## Scope

This document defines the typography system used in Pleos Connect.

All typography values must follow the official Pleos typography scale.

Do not invent custom font sizes, line heights, or font weights.

---

# Android Accessibility Guideline

## Android 접근성 가이드라인에서 최소 폰트 사이즈

* 권장 최소값은 12sp 이상입니다.

  * 12sp ≈ 12dp → 12 × (160dpi / 160) = 12px
* 하지만 가독성을 위해 일반적으로 1.5배 이상 사용하는 것이 권장되며, 약 18~20px 정도의 높이를 확보하는 것이 안전합니다.
* 실제 픽셀 기준 최소 높이: 18px 이상

## Minimum Font Size for Android Accessibility

* Recommended minimum: 12sp or more

  * 12sp ≈ 12dp → 12 × (160dpi / 160) = 12px
* For better legibility, it is generally recommended to secure at least 1.5× that size, which means ensuring a height of around 18–20px is safer.
* Minimum height in actual pixels: 18px or more

---

# System Font

Pleos Connect uses system font.

---

# Headline

| Scale Category | Weight              | Size | Line height |
| -------------- | ------------------- | ---: | ----------: |
| Large          | Extrastrong, Strong |   60 |          80 |
| Medium         | Extrastrong, Strong |   56 |          72 |
| Small          | Extrastrong, Strong |   48 |          64 |

---

# Title

| Scale Category | Weight                       | Size | Line height |
| -------------- | ---------------------------- | ---: | ----------: |
| Large          | Extra_strong, Strong, Normal |   40 |          52 |
| Medium         | Extra_strong, Strong, Normal |   36 |          44 |
| Small          | Extra_strong, Strong, Normal |   32 |          40 |

---

# Body

| Scale Category | Weight         | Size | Line height |
| -------------- | -------------- | ---: | ----------: |
| Large          | Strong, Normal |   30 |          38 |
| Medium         | Strong, Normal |   28 |          36 |
| Small          | Strong, Normal |   26 |          34 |

---

# Label

| Scale Category | Weight | Size | Line height |
| -------------- | ------ | ---: | ----------: |
| Medium         | Normal |   24 |          28 |
| Small          | Normal |   20 |          24 |

---

# Feature Font

## Driving

| Scale Category | Weight | Size | Line height |
| -------------- | ------ | ---: | ----------: |
| Speed          | Bold   |  112 |         134 |
| Traffic sign   | Bold   |   36 |          44 |

## Bubble

| Scale Category | Weight               | Size | Line height |
| -------------- | -------------------- | ---: | ----------: |
| Bubble         | Extra_strong, Strong |   30 |          48 |

## List_number

| Scale Category | Weight | Size | Line height |
| -------------- | ------ | ---: | ----------: |
| List_number    | Strong |   28 |          36 |

---

# Implementation Rule

* Always follow Pleos typography values.
* Do not invent custom font sizes.
* Do not invent custom line heights.
* Do not invent custom font weights.
* Minimum readable text should be 18px or more.
* Preserve original Pleos naming exactly as defined.

---

# Notes

Pleos typography naming contains inconsistent conventions in some places.

Examples:

* `Extrastrong`
* `Extra_strong`

Do not normalize naming.

Always preserve the original naming from Pleos documentation.
