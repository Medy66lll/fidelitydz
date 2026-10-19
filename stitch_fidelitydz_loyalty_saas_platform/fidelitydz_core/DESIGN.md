---
name: FidelityDZ Core
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
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system powers an enterprise-grade digital loyalty and merchant engagement platform tailored for the modern Algerian retail ecosystem. The visual language bridges trusted North African financial aesthetics with the precision, clarity, and motion of tier-one global fintech SaaS. 

The aesthetic is crisp, structured, and modern corporate, leaning heavily on clean hairline borders, purposeful status cues, and high-legibility typography across Latin (French) and Arabic scripts. Surfaces convey tactile reliability through pure white interactive cards set against pale cool-slate foundations, anchored by deep midnight headers and confident emerald green actions.

### Core Principles
- **Dual-Script Parity:** French and Arabic typography share identical visual mass, baseline alignment, and compositional dignity. Interfaces switch between LTR and RTL seamlessly without collapsing information density or component rhythm.
- **Fintech Reliability:** Visual credibility is paramount in a market transitioning rapidly toward digital payments (CIB, Edahabia, BaridiMob). Visual styling eliminates decorative noise in favor of hairline structural boundaries, crisp status badges, and data-dense dashboards.
- **Value-Driven Prominence:** Reward mechanisms, punch stamps, tier progressions, and wallet balances utilize a vibrant amber gold accent, creating immediate focal points against cool neutral planes.

## Colors

The palette establishes an immediate relationship between commercial authority and rewarding loyalty interactions. Color applications must follow strict semantic roles:

### Semantic Application
- **Primary (`#10B981` — Algerian Emerald):** Used for primary conversion funnels, point accumulation triggers, active loyalty tiers, positive balance badges, and high-priority action buttons.
- **Secondary (`#0F172A` — Deep Midnight Slate):** Applied to primary typography, navigation rails, high-contrast merchant analytics headers, and foundational surface backdrops for customer pass previews.
- **Tertiary (`#F59E0B` — Warm Amber):** Reserved exclusively for loyalty perks, gold membership milestones, VIP customer badges, reward redemptions, and pending operational states.
- **Surface Roles:** Base layout canvas renders in Crisp Alabaster (`#F8FAFC`). Elevated interactive units, dashboard widgets, and customer pass modules render in Pure White (`#FFFFFF`).
- **Structural Outlines:** All card boundaries, table cell dividers, and input strokes leverage Hairline Slate (`#E2E8F0`). Darkened borders (`#CBD5E1`) are strictly reserved for hover and focus targets.
- **Text Hierarchies:** Headings and numeric metrics rely on `#0F172A`. Body text, form descriptions, and table entries utilize `#334155`. Metadata, timestamps, and secondary captions utilize `#64748B`.

## Typography

Typography prioritizes geometric precision and multilingual readability across dense merchant POS panels and lightweight mobile passes.

### Multi-Script Font Pairing Rules
- **Primary Latin Script (French/English):** Governed by `Plus Jakarta Sans`. Its open counter forms, contemporary geometry, and robust weight distribution ensure clarity in data tables, metric tiles, and transactional dashboards.
- **Arabic Script Support (Arabic / Darija):** Bound to `Cairo` via cascading stylesheet fallbacks (`font-family: 'Plus Jakarta Sans', 'Cairo', sans-serif`). In Arabic contexts (`[dir="rtl"]`), line heights increase dynamically by 4px across body and headline levels to accommodate Arabic ascenders, descenders, and tashkeel marks without clipping.
- **Number & Currency Formatting:** Transaction values, phone inputs (`+213`), and loyalty point tallies must always enforce tabular figures (`font-variant-numeric: tabular-nums`) to preserve optical alignment in transactional listings.

## Layout & Spacing

The structural layout utilizes a responsive 12-column fluid grid system pinned to a maximum container width of `1280px` for desktop dashboards and marketing canvases.

### Screen Adaptations
- **Desktop (1024px+):** 12-column layout, `1.5rem` (24px) column gutters, `2rem` (32px) canvas margins. Fixed `260px` sidebar navigation for merchant backoffices.
- **Tablet (768px - 1023px):** 8-column layout, `1rem` (16px) gutters, `1.5rem` (24px) margins. Sidebar collapses to an icon rail or full-width sheet modal.
- **Mobile (< 768px):** 4-column layout, `1rem` (16px) gutters, `1rem` (16px) outer edge margins. Interactive components span full container width or stack sequentially.

### Spatial Rhythm
- Apply `space-xs` (4px) and `space-sm` (8px) for internal pill badge padding, inline status icon pairings, and compact list gaps.
- Apply `space-md` (16px) for standard input padding, button inner gaps, and compact metric cell spacing.
- Apply `space-lg` (24px) for card body padding, stack gaps between card sections, and form control groups.
- Apply `space-xl` (40px) exclusively for dashboard section division, page headers, and loyalty tiers comparison rows.

## Elevation & Depth

Visual hierarchy does not depend on heavy drop shadows or skeumorphic skews. Depth is established through crisp surface layering, subtle structural outlines, and whisper-quiet diffused shadows.

### Elevation Levels
- **Level 0 (Flat Canvas):** Crisp Alabaster (`#F8FAFC`). Holds zero shadow, serving as the passive backdrop for pages, sidebars, and structural panels.
- **Level 1 (Card & Module Layer):** Pure White (`#FFFFFF`) framed with a continuous 1px border of `#E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Dropdowns, Popovers, & Hover States):** Surface in `#FFFFFF` with `#E2E8F0` border. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Modals & Stamp Cards):** Surface in `#FFFFFF` with `#CBD5E1` border. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.
- **Digital Pass Specimen (Customer Facing):** High-contrast midnight surface (`#0F172A`) overlaying a delicate emerald radial shimmer (`radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), transparent 60%)`), paired with an outer border of `rgba(255, 255, 255, 0.1)`.

## Shapes

The geometric personality balances industrial discipline with approachable consumer ergonomics. 

- **Base Radius (`0.5rem` / 8px):** Applied to form inputs, small buttons, metric widgets, dropdown menus, and localized payment gateway badges.
- **Large Radius (`1rem` / 16px):** Standard for merchant dashboard cards, customer digital stamp boards, QR scan containers, and modals.
- **Extra Large Radius (`1.5rem` / 24px):** Reserved for floating mobile checkout overlays and consumer Apple/Google Wallet pass simulators.
- **Pill Radius (`9999px`):** Strictly enforced on status chips, loyalty tier pills (e.g., Bronze, Silver, Gold DZ), balance tags, stamp dots, and icon action circles.

## Components

### Buttons
- **Primary Action:** Background `#10B981`, text `#FFFFFF`, font weight `600`, radius `0.5rem`. Hover state transitions to `#059669` with subtle upward transform. Focus ring: `3px solid rgba(16, 185, 129, 0.35)`.
- **Secondary (Merchant Accent):** Background `#0F172A`, text `#FFFFFF`. Hover: `#1E293B`.
- **Outline / Ghost:** Background `transparent`, border `1px solid #E2E8F0`, text `#334155`. Hover: background `#F8FAFC`, border `#CBD5E1`.

### Badges & Chips
- Designed as full pills (`roundedness: 9999px`) using `12px` font size and `600` weight.
- **Success / Active:** Background `#ECFDF5`, text `#065F46`, 1px border `#A7F3D0`.
- **Pending / Amber Tier:** Background `#FFFBEB`, text `#92400E`, 1px border `#FDE68A`.
- **Neutral / Draft:** Background `#F1F5F9`, text `#475569`, 1px border `#E2E8F0`.

### Form Inputs & Selects
- Height `44px` on desktop, `48px` on mobile for tap target accessibility.
- Background `#FFFFFF`, 1px border `#E2E8F0`, text `#0F172A`, border radius `0.5rem`.
- Focus ring: outline `none`, border color `#10B981`, box-shadow `0 0 0 3px rgba(16, 185, 129, 0.2)`.
- Phone prefix input explicitly styled for Algerian mobile operators (`+213 5xx / 6xx / 7xx`) with auto-separating digit blocks.

### Payment & Settlement Badges (Algerian FinTech Localized)
- Structured badges for **BaridiMob**, **Edahabia**, **CIB**, and **Chargily Pay**.
- Dimensions: fixed height `32px`, minimum width `56px`, 1px solid `#E2E8F0`, background `#FFFFFF`, radius `0.5rem`, displaying high-contrast SVG vector logomarks with localized state indicators.

### Digital Loyalty Cards & Punch Stamps
- **Card Surface:** Midnight slate `#0F172A` with a micro-pattern or subtle emerald glow for VIP statuses; pure white `#FFFFFF` for standard retail stamp cards.
- **Stamp Cells:** Circular slots (`40px x 40px`) surrounded by dashed border `#CBD5E1` when unearned; filled with solid `#10B981` (or `#F59E0B` for milestone rewards) and white check/star icons when validated.
- **RTL Behavior:** Loyalty stamp progression flows intuitively right-to-left when `dir="rtl"` is applied, ensuring intuitive orientation for Arabic-speaking consumers.