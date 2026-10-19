---
name: Emerald Merchant
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
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.03em
  currency-numeral:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies a modern, utilitarian SaaS aesthetic engineered specifically for high-velocity North African retail and hospitality commerce. The design persona fuses contemporary fintech precision with local familiarity: authoritative, trustworthy, crisp, and tactile.

The visual style is **Corporate / Modern with High-Density Polish**. It avoids superfluous decorative elements in favor of information-rich interfaces, deliberate micro-interactions, distinct state indicators, and fluid bilingual parity between French (LTR) and Arabic (RTL). Interfaces evoke financial reliability, merchant pride, and frictionless transactional speed for counter environments where transactions occur in seconds.

## Colors

The palette balances Algerian identity with fintech-grade usability:

- **Primary (Algerian Emerald):** `#10B981` (Base), `#059669` (Hover/Active), `#ECFDF5` (Surface Tint / Pill Background). Used for primary actions, active loyalty states, and positive validation.
- **Secondary (Midnight Slate):** `#0F172A` (Deep Slate for headers, sidebars, and critical text), `#1E293B` (Secondary headers/borders), `#475569` (Muted labels), `#94A3B8` (Disabled/Placeholder state).
- **Tertiary (Reward & Gold Accent):** `#F59E0B` (Base Amber), `#FEF3C7` (Light Amber). Signals unlocked rewards, loyalty tiers, VIP badges, and star ratings.
- **Neutrals & Surfaces:** `#F8FAFC` (Canvas background), `#FFFFFF` (Surface cards, table bodies, modal layers), `#E2E8F0` (Structural division lines and card borders).
- **Payment & Ecosystem Tokens:**
  - *Edahabia / Algérie Poste:* `#D97706` (Gold) / `#1E40AF` (Poste Blue)
  - *CIB (Carte Interbancaire):* `#0F766E` (CIB Teal)
  - *Chargily Pay:* `#6366F1` (Indigo accent indicator)
  - *Currency Indicator (DZD / د.ج):* Semantic chip using `#0F172A` with `#F1F5F9` background.

## Typography

The design system implements a strict dual-script pairing: **Plus Jakarta Sans** for Latin script contexts (French and numeric data) and **Cairo** for Arabic script contexts.

### Script Mechanics & Dual Layout
- When rendering French (`dir="ltr"`), Plus Jakarta Sans provides clean, legible geometry with slight humanist warmth ideal for dashboard data density.
- When rendering Arabic (`dir="rtl"`), Cairo inherits matching font size scales, with `line-height` multiplied by 1.15 to accommodate tall ascenders and deep descenders without layout shift.
- Numbers, monetary values, and phone numbers (`+213`) remain tabular in LTR sequence, even within RTL contexts, ensuring instantaneous scannability across POS receipts, analytics tables, and merchant bank identifiers.

## Layout & Spacing

The layout is built on an adaptive 12-column grid system optimized for high-density desktop dashboards, tablet counter terminals, and handheld mobile views.

- **Desktop (1024px+):** Fixed vertical left/right navigation sidebar (260px), 12-column fluid canvas with `1.5rem` gutters and `2rem` outer page margins. Maximizes vertical screen real estate for live transaction logs, customer tables, and campaign controls.
- **Tablet (768px - 1023px):** Compact collapsible sidebar (68px icon rail), 8-column grid with `1rem` gutters and `1.5rem` margins. Ideal for merchant POS iPad/Android counter setups.
- **Mobile (< 768px):** 4-column layout with `0.75rem` gutters and `1rem` margins. The navigation shifts to a persistent bottom app bar with thumb-accessible trigger points.
- **Spacing Rhythm:** Standard spacing uses strict 4px/8px multiples (`0.25rem` to `2rem`) to maintain consistent optical rhythm across data cards, modal drawers, and nested list items.

## Elevation & Depth

Visual hierarchy uses a refined hybrid of **low-contrast outlines** and **tinted ambient shadows** to preserve clarity under varying point-of-sale lighting conditions:

- **Level 0 (Flat / Canvas):** Surface color `#F8FAFC`, zero elevation, separation achieved via 1px solid `#E2E8F0` borders.
- **Level 1 (Cards, Tables, Modules):** `#FFFFFF` surface with a 1px border (`#E2E8F0`) paired with an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Popovers, Dropdowns, Datepickers):** `#FFFFFF` surface with `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)` and subtle slate border.
- **Level 3 (Modals, Barcode / QR Scanners, Drawers):** High-prominence surface with `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)` backed by a slate scrim (`rgba(15, 23, 42, 0.45)`).
- **Physical Print Elevation (A4 Posters & Tent Cards):** Outlined with a high-contrast crop edge, distinct fold indicators, and realistic mock drop-shadows during dashboard preview mode.

## Shapes

The design system utilizes **Rounded (Level 2)** geometry:
- Standard interactive elements (buttons, text fields, badges, table row highlights) feature an 8px (`0.5rem`) corner radius.
- Structural cards, stat panels, and alert banners use 16px (`1rem` / `rounded-lg`).
- High-level containers (modals, sheet slide-outs, QR stand generators) use 24px (`1.5rem` / `rounded-xl`).
- Status chips, currency pills, and avatar placeholders use fully rounded circular capsules (`9999px` / `rounded-full`) to differentiate metadata from actionable input surfaces.

## Components

### Buttons
- **Primary:** Background `#10B981`, text `#FFFFFF`, font `label-lg`. Hover: `#059669`. Active scale down to 0.98.
- **Secondary:** Surface `#FFFFFF`, border 1px solid `#E2E8F0`, text `#0F172A`. Hover: `#F8FAFC`.
- **Tertiary / Reward:** Background `#F59E0B`, text `#FFFFFF`. Hover: `#D97706`. Used for loyalty point redemptions and tier perks.
- **Destructive:** Background `#EF4444`, text `#FFFFFF`.

### Inputs & Form Controls
- **Text Inputs:** Height 40px, font `body-md`, background `#FFFFFF`, border 1px solid `#CBD5E1`, rounded `0.5rem`. Focus ring: 2px offset with `#10B981`.
- **Bilingual Toggles:** Segmented control toggling between `FR` and `عربي`. Active segment features a white elevation pill against a slate-100 track.
- **Checkboxes & Radios:** 18px size, primary color fill `#10B981` when active, smooth checkmark animation.

### Chips & Status Badges
- **Active Card / Client Active:** Background `#ECFDF5`, text `#065F46`, emerald dot indicator.
- **Pending / Inactive:** Background `#F1F5F9`, text `#475569`.
- **VIP Tier:** Background `#FEF3C7`, text `#92400E`, with mini star glyph.
- **Currency Badge:** High-contrast pill: `#F1F5F9` background, `#0F172A` text displaying `2,450.00 د.ج` or `2,450.00 DZD`.

### Algerian Banking & Payment Cards (RIP / CCP)
- High-utility card container with `#F8FAFC` background and `#E2E8F0` border.
- Displays Algérie Poste, BaridiMob, or CIB logos alongside masked account/RIP numbers in monospace styling.
- Houses a one-click "Copier le RIP" / "نسخ رقم الحساب" micro-action button with momentary checkmark feedback.
- Integrated Chargily Pay badge displaying certified checkout integration status.

### High-Density Data Tables
- Header: `#F8FAFC`, uppercase label-sm, text `#475569`, 1px border-b `#E2E8F0`.
- Rows: `#FFFFFF`, hover state `#F8FAFC`, row height 52px. Includes customer phone (+213), visits count, total spend in DZD, and last stamp timestamp.

### Print-Ready A4 Loyalty Poster Builder
- Mockup component rendering counter tent cards and A4 printable posters.
- Features scalable vector QR code generator with central merchant brand icon, dual-language instructions ("Scannez pour cumuler vos tampons" / "امسح لجمع النقاط"), and cut-line guides.