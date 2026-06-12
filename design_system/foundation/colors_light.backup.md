# Pleos Connect Color System - Light Theme Only

## Scope

This document defines the Light theme color tokens for the Pleos Connect HTML/CSS/JS prototype.

Use this file as the primary color reference for implementation.

Do not use Dark theme values in this prototype.

---

# 1. Basic Colors

## Grayscale

| Token     | Value   |
| --------- | ------- |
| basic_00  | #FFFFFF |
| basic_50  | #F7F8FA |
| basic_100 | #EDEEF2 |
| basic_200 | #E0E1E6 |
| basic_300 | #C7C9CE |
| basic_400 | #A4A8AE |
| basic_500 | #686A72 |
| basic_600 | #44464E |
| basic_700 | #313236 |
| basic_800 | #1D1E21 |
| basic_900 | #131417 |

---

## Alpha

| Token           | Value         |
| --------------- | ------------- |
| alpha_dark_50   | #131417 @ 5%  |
| alpha_dark_100  | #131417 @ 10% |
| alpha_dark_200  | #131417 @ 20% |
| alpha_dark_300  | #131417 @ 30% |
| alpha_dark_400  | #131417 @ 40% |
| alpha_dark_500  | #131417 @ 50% |
| alpha_light_50  | #FFFFFF @ 5%  |
| alpha_light_100 | #FFFFFF @ 10% |
| alpha_light_200 | #FFFFFF @ 20% |
| alpha_light_300 | #FFFFFF @ 30% |
| alpha_light_400 | #FFFFFF @ 40% |
| alpha_light_500 | #FFFFFF @ 50% |

---

## Basic Alpha Source Tokens

These tokens are listed in the Foundation Basic Color table.
Use `alpha_dark_*` and `alpha_light_*` in component/system tokens when Pleos System Color uses the shortened token names.

| Token                 | Value         |
| --------------------- | ------------- |
| basic_alpha_light_50  | #131417 @ 5%  |
| basic_alpha_light_100 | #131417 @ 10% |
| basic_alpha_light_200 | #131417 @ 20% |
| basic_alpha_light_300 | #131417 @ 30% |
| basic_alpha_light_400 | #131417 @ 40% |
| basic_alpha_light_500 | #131417 @ 50% |
| basic_alpha_dark_50   | #FFFFFF @ 5%  |
| basic_alpha_dark_100  | #FFFFFF @ 10% |
| basic_alpha_dark_200  | #FFFFFF @ 20% |
| basic_alpha_dark_300  | #FFFFFF @ 30% |
| basic_alpha_dark_400  | #FFFFFF @ 40% |
| basic_alpha_dark_500  | #FFFFFF @ 50% |

---

## Static

| Token            | Value         |
| ---------------- | ------------- |
| static_light_100 | #FFFFFF       |
| static_light_200 | #FFFFFF @ 84% |
| static_light_300 | #FFFFFF @ 64% |
| static_light_400 | #FFFFFF @ 32% |
| static_dark_100  | #131417       |
| static_dark_200  | #131417 @ 84% |
| static_dark_300  | #131417 @ 64% |
| static_dark_400  | #131417 @ 32% |

---

# 2. Light Theme System Colors

## Background

| Token                | Light Value |
| -------------------- | ----------- |
| background_primary   | basic_50    |
| background_secondary | basic_00    |
| background_popup     | basic_00    |

---

## Button

| Token                  | Light Value     |
| ---------------------- | --------------- |
| button_basic_enabled   | alpha_dark_50   |
| button_basic_pressed   | alpha_dark_100  |
| button_basic_disabled  | alpha_light_200 |
| button_switch_enabled  | basic_00        |
| button_switch_pressed  | alpha_light_500 |
| button_switch_disabled | alpha_light_300 |
| button_filled_enabled  | basic_600       |
| button_filled_pressed  | basic_700       |
| button_filled_disabled | alpha_dark_50   |

---

## Controller

| Token                         | Light Value    |
| ----------------------------- | -------------- |
| controller_slider_normal      | alpha_dark_200 |
| controller_slider_pressed     | alpha_dark_300 |
| controller_slider_knob        | basic_00       |
| controller_tab_background     | alpha_dark_50  |
| controller_stepper_background | basic_00       |

---

## Climate

| Token                  | Light Value      |
| ---------------------- | ---------------- |
| button_enabled         | basic_200        |
| button_selected        | basic_00         |
| button_border_enabled  | alpha_dark_200   |
| button_border_disabled | alpha_dark_50    |
| toggle_selected        | alpha_dark_100   |
| toggle_pressed         | alpha_dark_200   |
| slider_background      | basic_00         |
| airvent_button_opened  | basic_00         |
| airvent_button_closed  | alpha_light_400  |
| airvent_symbol_opened  | static_dark_200  |
| airvent_symbol_closed  | static_dark_400  |
| airvent_opened         | static_light_300 |
| airvent_closed         | alpha_light_200  |

---

## Dropdown

| Token            | Light Value |
| ---------------- | ----------- |
| dropdown_normal  | basic_00    |
| dropdown_pressed | basic_100   |

---

## Dim

| Token               | Light Value     |
| ------------------- | --------------- |
| dim_dark_primary    | alpha_dark_50   |
| dim_dark_secondary  | alpha_dark_100  |
| dim_dark_tertiary   | alpha_dark_200  |
| dim_light_primary   | alpha_light_500 |
| dim_light_secondary | alpha_light_400 |
| dim_light_tertiary  | alpha_light_300 |

---

## Divider

| Token             | Light Value    |
| ----------------- | -------------- |
| divider_primary   | alpha_dark_50  |
| divider_secondary | alpha_dark_100 |
| divider_tertiary  | alpha_dark_200 |

---

## Driving

| Token                | Light Value  |
| -------------------- | ------------ |
| gearshift_background | basic_900    |
| charging_normal      | #00DB25      |
| charging_deep        | #00B975      |
| gradient_end         | basic_00     |
| gradient_start       | #FFFFFF @ 0% |

---

## Fields

| Token            | Light Value |
| ---------------- | ----------- |
| field_background | basic_00    |
| field_focused    | basic_700   |

---

## Icon

| Token                | Light Value     |
| -------------------- | --------------- |
| icon_dark_primary    | static_dark_100 |
| icon_dark_secondary  | static_dark_200 |
| icon_dark_tertiary   | static_dark_300 |
| icon_dark_quaternary | static_dark_400 |

---

## Informative

| Token                          | Light Value |
| ------------------------------ | ----------- |
| informative_active             | #02C265     |
| informative_positive           | #0064FF     |
| informative_negative           | #FE3D16     |
| informative_autonomous_driving | #5A46FA     |

---

## Keyboard - Normal

| Token                             | Light Value |
| --------------------------------- | ----------- |
| keyboard_normal_primary_normal    | basic_00    |
| keyboard_normal_primary_pressed   | basic_100   |
| keyboard_normal_secondary_normal  | basic_300   |
| keyboard_normal_secondary_pressed | basic_400   |
| keyboard_normal_active_normal     | basic_600   |
| keyboard_normal_active_pressed    | basic_700   |
| keyboard_normal_accents_normal    | basic_600   |
| keyboard_normal_accents_pressed   | basic_700   |
| keyboard_normal_background        | basic_200   |

---

## Keyboard - Static

| Token                             | Light Value     |
| --------------------------------- | --------------- |
| keyboard_static_primary_normal    | basic_500       |
| keyboard_static_primary_pressed   | basic_600       |
| keyboard_static_secondary_normal  | basic_600       |
| keyboard_static_secondary_pressed | basic_500       |
| keyboard_static_active_normal     | basic_500       |
| keyboard_static_active_pressed    | basic_700       |
| keyboard_static_accents_normal    | basic_300       |
| keyboard_static_accents_pressed   | basic_400       |
| keyboard_static_background        | basic_900       |
| keyboard_static_icon_light        | basic_00        |
| keyboard_static_icon_dark         | basic_900       |
| keyboard_static_icon_disabled     | alpha_light_100 |
| keyboard_static_text              | basic_700       |

---

## Media

| Token                | Light Value |
| -------------------- | ----------- |
| radio_primary        | #C911E7FF   |
| music_primary        | #4781FFFF   |
| radio_gradient_start | #00FFFFFF   |
| radio_gradient_end   | #FFFFFFFF   |

---

## Overlay

| Token           | Light Value    |
| --------------- | -------------- |
| overlay_default | alpha_dark_200 |

---

## Phone

| Token              | Light Value |
| ------------------ | ----------- |
| phone_call_normal  | #32B957     |
| phone_call_pressed | #279E47     |
| phone_end_normal   | #FE3D16     |
| phone_end_pressed  | #E73612     |

---

## Regulation

| Token                | Light Value |
| -------------------- | ----------- |
| regulation_blue      | #0064FF     |
| regulation_green     | #00BA13     |
| regulation_yellow    | #FFC224     |
| regulation_orange    | #FF8A00     |
| regulation_red       | #F62E24     |
| regulation_bluetooth | #0082FC     |

---

## Surface

| Token          | Light Value |
| -------------- | ----------- |
| surface_basic  | basic_00    |
| surface_low    | basic_50    |
| surface_high   | basic_100   |
| surface_accent | basic_200   |

---

## Switch

| Token                | Light Value        |
| -------------------- | ------------------ |
| switch_on            | informative_active |
| switch_off           | alpha_dark_300     |
| switch_disabled      | alpha_dark_100     |
| switch_knob_on       | basic_00           |
| switch_knob_off      | basic_00           |
| switch_knob_disabled | basic_00           |

---

## Text

| Token                | Light Value     |
| -------------------- | --------------- |
| text_dark_primary    | static_dark_100 |
| text_dark_secondary  | static_dark_200 |
| text_dark_tertiary   | static_dark_300 |
| text_dark_quaternary | static_dark_400 |

---

# 3. Implementation Notes

* This prototype uses Light mode only.
* Do not use Dark column values from the original Figma file.
* Do not rename tokens.
* If a token name appears inconsistent, preserve the original Figma token name.
* Use semantic system tokens first.
* Use Basic tokens only when no semantic token exists.
* Use raw HEX values only when the Figma System Color table provides raw HEX instead of token references.
