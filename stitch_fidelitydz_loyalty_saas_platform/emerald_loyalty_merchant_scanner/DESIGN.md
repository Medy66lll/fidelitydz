---
name: Emerald Loyalty & Merchant Scanner
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  title-card:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-stamp-number:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
  code-scanner-data:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-sm: 0.75rem
  margin-lg: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system drives a dual-mode Mobile Web and Progressive Web App (PWA) tailored for Algerian commerce: consumer-facing digital loyalty cards, reward stamp sheets, and dynamic QR wallets alongside high-velocity merchant cashier verification and barcode scanning.

The aesthetic fuses **Tactile Modernism** with **Editorial Clarity**. The interface conveys the prestige of physical embossed membership cards combined with the frictionless utility of point-of-sale hardware. Micro-interactions evoke physical delight—tactile stamp impressions, haptic feedback confirmations, and paper-smooth bottom sheets.

Target audiences encompass everyday shoppers seeking effortless discount tracking across neighborhood stores, supermarkets, and cafes, as well as fast-paced cashiers operating handheld devices under diverse retail lighting conditions. Interfaces must feel immediate, trusted, celebratory upon reward redemption, and completely native across both French (LTR) and Arabic (RTL) locales.

## Colors

The color palette centers on national visual heritage reinterpreted through modern digital banking and retail UX:

- **Primary (`#10B981` — Algerian Emerald):** Serves as the primary validation vector, progress track fill, active reward badge, and high-priority action color. Conveys growth, security, and verified authenticity.
- **Secondary (`#0F172A` — Deep Midnight Slate):** Used for top navigation headers, primary customer loyalty pass backgrounds, camera scanner viewports, and primary typographic weight. Provides deep contrast and an executive tier feel.
- **Tertiary (`#F59E0B` — Warm Amber):** Reserved for rewards, tier status (Gold/VIP), unlocked stamp starbursts, point milestones, and cashier cash-back notifications.
- **Neutral (`#64748B` — Slate Grey):** Controls secondary metadata, placeholder copy, divider strokes, inactive stamp outlines, and auxiliary icon states.
- **Canvas & Surface Tier:** Root canvas uses Crisp Alabaster (`#F8FAFC`), while cards, modals, and scanner bottom sheets use Pure White (`#FFFFFF`). Structural delineation is reinforced by hairline borders (`#E2E8F0`).
- **Functional Semantics:** Success (`#059669`), Warning (`#D97706`), Error/Destructive (`#EF4444`), QR Scanner Targeting Grid (`#10B981` with pulsing glow).

## Typography

The type system is engineered to handle seamless Latin and Arabic typographic parity across responsive viewports.

- **Latin Font (French LTR):** Plus Jakarta Sans offers geometric precision, open counters, and high legibility at micro-scales on low-cost mobile displays.
- **Arabic System Pairing (RTL):** When the locale shifts to Arabic or displays bilingual metadata (e.g., store name, point denomination `د.ج`), the UI binds to the Naskh-inspired modern font **Cairo** or **Noto Sans Arabic** using equivalent weight distributions (Regular 400 for descriptions, SemiBold 600 for card headers, Bold 700 for monetary point tallies).
- **Bilingual Stacking Rules:** In bilingual badge and header components, Latin French precedes at `14px/600`, while Arabic subtitles display directly underneath at `12px/500` with optical color dampening (`#64748B`).
- **Numerical Representation:** High-density point counters and QR authorization codes use tabular lining numbers (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during real-time balance increments.

## Layout & Spacing

The layout is built for **Mobile-First PWA environments** with desktop adaptability for store manager consoles.

- **Viewport Constraints:** Mobile customer screens center within a max-width container of `440px` with fixed viewport margins of `16px` (`margin`). Cashier scanner mode optimizes for one-handed thumb navigation with vital interactions positioned within the lower 60% of the screen height.
- **Rhythm & Grid:** Built on an absolute 4px/8px incremental base. Component gaps utilize `space-sm` (8px) for tightly grouped items (e.g., stamp pill badges), `space-md` (16px) for form groupings and list items, and `space-lg` (24px) for distinct section partitions.
- **Safe Area Insets:** All fixed bottom bars and floating scan trigger buttons inject `env(safe-area-inset-bottom)` plus `12px` padding to guarantee clearance over home indicator bars and mobile browser navigation chrome.
- **RTL Fluidity:** Layout containers rely strictly on logical properties (`padding-inline-start`, `margin-inline-end`, `inset-inline`) ensuring immediate layout inversion when switching between French and Arabic interfaces without stylesheet reloading.

## Elevation & Depth

Visual depth is achieved through layered structural surfaces, crisp hairline borders, and targeted ambient drop shadows:

- **Level 0 (Canvas Base):** Ground color `#F8FAFC`. Completely flat with no shadow.
- **Level 1 (Cards & Stamp Sheets):** Surface `#FFFFFF`, bounded by a `1px solid #E2E8F0` border, cast with an ambient shadow: `box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Customer Loyalty Pass Deck):** The active pass features a rich Deep Midnight Slate (`#0F172A`) gradient to `#1E293B`, elevated with `box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.25), 0 4px 10px -2px rgba(15, 23, 42, 0.15)`. Gold Foil/VIP tiers use subtle inner highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.15)`).
- **Level 3 (Scanner Bottom Sheet & Drawer):** Surfaces float with top-radius rounding and an elevation of `box-shadow: 0 -8px 30px rgba(15, 23, 42, 0.12)`.
- **Level 4 (Camera HUD Overlays & Dynamic QR Overlays):** Semi-translucent Midnight Slate overlay with `backdrop-filter: blur(8px)` at `rgba(15, 23, 42, 0.75)` featuring a centered spotlight punch-out with a glowing emerald tracking perimeter.

## Shapes

The system implements a structured **Rounded (`2`)** token strategy, pairing tactile consumer-grade softness with structural rigor:

- **Base Radius (`0.5rem` / 8px):** Standard buttons, text inputs, chips, dropdown selectors, and small notification toasts.
- **Large Radius (`rounded-lg` / `1rem` / 16px):** Stamp grid cells, QR code presentation frames, promotion banners, and merchant activity cards.
- **Extra-Large Radius (`rounded-xl` / `1.5rem` / 24px):** Digital loyalty cards (ISO standard credit card aspect ratio), scanner viewport cutout frames, and top-corners of sliding bottom sheets.
- **Full Pill (`9999px`):** Stamp circles, reward counter indicators, language toggle switches (FR | AR), and floating cashier scan trigger actions.

## Components

### 1. Loyalty Card Component
- **Geometry:** 85.6mm x 53.98mm credit-card proportional container rendered with `rounded-xl` (24px).
- **Finish:** Deep Midnight Slate `#0F172A` with an organic emerald wave watermark. Top row displays merchant brand avatar and title alongside a bilingual tier pill (`VIP Or / ذهبي`). Bottom area features customer name, point balance formatted in bold emerald numbers, and a quick-tap button that pulls up the full-screen QR code.

### 2. Stamp Grid Component
- **Layout:** 2x5 or 3x4 grid depending on merchant configuration.
- **Stamp Node:** 56px circular cells with `border: 2px dashed #CBD5E1`.
- **Active / Claimed Stamp:** Background filled with `#10B981`, containing an embossed white checkmark or merchant brand stamp icon, animated with an elastic scale pop.
- **Target Reward Node:** The 10th stamp features an Amber border (`#F59E0B`), warm golden glow, and a gift box icon that triggers celebratory confetti upon unlock.

### 3. QR Code Pass & Brightness Lock
- **Frame:** Centered white canvas with `16px` padding and rounded corners (`16px`).
- **Code Graphic:** Contrast-rich black-on-white SVG QR with emerald corner registration markers.
- **PWA Auto-Brightness Directive:** When the QR view expands, a full-screen bottom sheet initiates with a prompt to set screen brightness to 100% for effortless barcode scanner detection at physical checkout lanes.

### 4. Cashier Camera Scanner Viewport
- **Overlay:** Fullscreen black canvas with a centered 260px transparent scanning aperture.
- **Targeting Corners:** 4px thick emerald accent brackets defining the focal zone with an oscillating vertical laser scan line (`#10B981`).
- **Scanner Bottom Sheet:** Immediately slides up upon successful read displaying the customer identity, current points, instant validation buttons (`+1 Stamp`, `Redeem Reward`), and a tactile audio/haptic confirmation cue.

### 5. Bilingual Toggle (FR / العربية)
- **Shape:** Pill segmented control with light slate background (`#F1F5F9`).
- **Active State:** Pure white pill container with soft shadow (`0 2px 4px rgba(0,0,0,0.06)`), rendering bold typography in the selected language with an immediate horizontal sliding indicator.

### 6. Buttons & Inputs
- **Primary Action:** Solid Emerald `#10B981` background, white text, height `48px` (touch-safe target minimum), `rounded-md` (8px), font-weight `600`. Active state depresses 1px for high tactile affordance.
- **Secondary Action:** Transparent background with `1.5px solid #0F172A` outline and midnight slate typography.
- **Form Inputs:** Height `48px`, background `#FFFFFF`, border `1px solid #E2E8F0`, focusing to `2px solid #10B981` with zero layout shift. Clear labels placed above with French on the left and Arabic right-aligned when applicable.