# DESIGN.md — DevFlow UI Overhaul
> Version 1.0 | Author: Dev Studio | Status: Active Design Spec
> This file is the single source of truth for the DevFlow UI redesign.
> All agents, developers, and AI IDEs must follow this specification exactly.
> Do NOT deviate from tokens, typography, or component specs without explicit approval.

---

## 0. Project Context

**Product:** DevFlow — AI code generation SaaS  
**URL:** https://dev-flow-lime.vercel.app  
**Stack:** Next.js, TypeScript, Tailwind CSS, Clerk (auth)  
**Scope:** Full UI overhaul of landing page, auth page, and dashboard. No functionality changes.  
**Goal:** Transform a basic, generic UI into a premium, distinctive SaaS product that does NOT look AI-generated.  
**Design Direction:** Arctic Monochrome — cold navy blacks, warm cream light mode, precise cyan accent. Technical precision meets editorial restraint.

---

## 1. Design Philosophy

**The Core Aesthetic:** Precision without coldness. The palette is technical (navy, slate, cyan) but the light mode introduces a warm cream (#F0ECDD) that creates a distinctive warm/cold tension — unusual and memorable. No purple gradients. No generic AI startup look.

**Reference points:** Warp terminal × Linear × A high-end editorial magazine  
**Anti-references:** Vercel v0, Framer AI, Cursor (avoid copying their exact aesthetic language)

**Three rules that govern every decision:**
1. **One thing at a time.** No competing focal points on any section. The eye must always know where to go first.
2. **Restraint is the accent.** Cyan (#0EA5E9) appears only on: primary CTA buttons, active/selected states, accent text in hero, and code syntax. Nowhere else.
3. **Depth through layering.** Dark surfaces are built in layers (#070D14 → #02122F → #23354D → #495B7D) — not through shadows alone.

---

## 2. Color System

### 2.1 Raw Palette

```
NAVY FAMILY (dark-mode surfaces)
  --navy-950: #070D14   /* Page background, deepest level */
  --navy-900: #02122F   /* Card backgrounds, primary surface */
  --navy-700: #23354D   /* Elevated cards, borders on dark */
  --navy-500: #495B7D   /* Muted UI elements, disabled states */
  --navy-300: #8BA3C5   /* Secondary text on dark, icons on dark */

CREAM FAMILY (light-mode surfaces)
  --cream-50:  #F0ECDD  /* Page background — light mode */
  --cream-100: #E8E2CE  /* Card surfaces — light mode */
  --cream-200: #D9D1B8  /* Borders — light mode */
  --cream-400: #B5A882  /* Muted text — light mode */

CYAN ACCENT (the single accent — use sparingly)
  --cyan-400: #38BDF8   /* Highlights, hover glow */
  --cyan-500: #0EA5E9   /* Primary accent, CTAs, active states */
  --cyan-700: #0369A1   /* Accent on light mode (higher contrast) */

NEUTRAL
  --white:     #FFFFFF
  --off-white: #F8F9FA
```

### 2.2 Semantic Design Tokens

Define these as CSS custom properties in `globals.css`. Use ONLY these tokens in all components — never hardcode raw hex.

```css
:root {
  /* === DARK MODE (default) === */
  --color-bg-page:         #070D14;
  --color-bg-surface:      #02122F;
  --color-bg-elevated:     #23354D;
  --color-bg-hover:        #2A3F5C;

  --color-border-subtle:   rgba(139, 163, 197, 0.12);
  --color-border-default:  rgba(139, 163, 197, 0.20);
  --color-border-strong:   rgba(139, 163, 197, 0.35);

  --color-text-primary:    #F0ECDD;   /* Warm cream — primary text on dark */
  --color-text-secondary:  #8BA3C5;   /* Navy-300 — supporting text */
  --color-text-tertiary:   #495B7D;   /* Navy-500 — hints, placeholders */
  --color-text-disabled:   #2D3E56;

  --color-accent:          #0EA5E9;   /* Cyan-500 — single accent */
  --color-accent-glow:     rgba(14, 165, 233, 0.15);
  --color-accent-light:    #38BDF8;   /* Cyan-400 — hover/highlight */

  --color-code-bg:         #020C1E;   /* Deeper than page bg for code blocks */
  --color-code-text:       #38BDF8;   /* Cyan on code */

  --color-success:         #22C55E;
  --color-warning:         #F59E0B;
  --color-danger:          #EF4444;
  --color-online:          #22C55E;
}

[data-theme="light"],
.light {
  /* === LIGHT MODE === */
  --color-bg-page:         #F0ECDD;   /* Warm cream — distinctive */
  --color-bg-surface:      #FDFAF3;   /* Near white with warmth */
  --color-bg-elevated:     #FFFFFF;
  --color-bg-hover:        #F5F0E2;

  --color-border-subtle:   rgba(53, 68, 86, 0.08);
  --color-border-default:  rgba(53, 68, 86, 0.15);
  --color-border-strong:   rgba(53, 68, 86, 0.28);

  --color-text-primary:    #02122F;   /* Navy-900 — primary text on cream */
  --color-text-secondary:  #354456;   /* Mid navy — supporting text */
  --color-text-tertiary:   #7A8FA6;   /* Muted — hints, placeholders */
  --color-text-disabled:   #B5BECA;

  --color-accent:          #0369A1;   /* Cyan-700 — darker for light mode contrast */
  --color-accent-glow:     rgba(3, 105, 161, 0.10);
  --color-accent-light:    #0EA5E9;

  --color-code-bg:         #EAE6D6;   /* Slightly darker cream for code */
  --color-code-text:       #0369A1;

  --color-success:         #16A34A;
  --color-warning:         #D97706;
  --color-danger:          #DC2626;
  --color-online:          #16A34A;
}
```

### 2.3 Color Usage Rules

| Use case | Dark token | Light token |
|---|---|---|
| Page bg | `--color-bg-page` (#070D14) | `--color-bg-page` (#F0ECDD) |
| Card bg | `--color-bg-surface` (#02122F) | `--color-bg-surface` (#FDFAF3) |
| Elevated card | `--color-bg-elevated` (#23354D) | `--color-bg-elevated` (#FFFFFF) |
| Primary text | `--color-text-primary` (#F0ECDD) | `--color-text-primary` (#02122F) |
| Secondary text | `--color-text-secondary` (#8BA3C5) | `--color-text-secondary` (#354456) |
| Accent/CTA | `--color-accent` (#0EA5E9) | `--color-accent` (#0369A1) |
| Code blocks | `--color-code-bg` / `--color-code-text` | same tokens |
| Borders | `--color-border-default` | `--color-border-default` |

**RULE:** Accent color (#0EA5E9) must appear on NO MORE than 10% of any viewport. If you're using it on 3+ elements in one section, you're overusing it.

---

## 3. Typography System

### 3.1 Font Stack

```
HEADING FONT:  Onest
  — Source: Google Fonts (https://fonts.google.com/specimen/Onest)
  — Use for: All headings (h1–h4), navbar brand name, section labels
  — Why: Geometric grotesque, modern, not overused, has great display weights

BODY FONT:     Figtree
  — Source: Google Fonts (https://fonts.google.com/specimen/Figtree)
  — Use for: Body text, nav links, UI labels, form elements, descriptions
  — Why: Rounded but professional, clear at small sizes, distinct from Inter

MONO FONT:     JetBrains Mono
  — Source: Google Fonts (https://fonts.google.com/specimen/JetBrains+Mono)
  — Use for: Code blocks, terminal text, version numbers, keyboard shortcuts
  — Why: Industry-leading code font, excellent legibility, available on Google Fonts
```

Next.js implementation in `layout.tsx`:
```tsx
import { Onest, Figtree, JetBrains_Mono } from 'next/font/google'

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})
```

Tailwind config:
```js
fontFamily: {
  heading: ['var(--font-heading)', 'system-ui'],
  body:    ['var(--font-body)', 'system-ui'],
  mono:    ['var(--font-mono)', 'monospace'],
},
```

### 3.2 Type Scale — Perfect Fourth (1.333)

This is a marketing + app hybrid, so use Perfect Fourth for headings and Major Third for body/UI.

```css
:root {
  --text-xs:   0.563rem;   /*  9px — timestamps, captions */
  --text-sm:   0.75rem;    /* 12px — metadata, secondary labels */
  --text-base: 1rem;       /* 16px — body text, UI labels */
  --text-md:   1.125rem;   /* 18px — lead text */
  --text-lg:   1.333rem;   /* 21.3px — card titles, subsection headers */
  --text-xl:   1.777rem;   /* 28.4px — section headers */
  --text-2xl:  2.369rem;   /* 37.9px — page headers */
  --text-3xl:  3.157rem;   /* 50.5px — hero subheads */
  --text-4xl:  4.209rem;   /* 67.3px — hero main title (desktop) */
  --text-5xl:  5.61rem;    /* 89.8px — statement text, reserved */
}
```

### 3.3 Line Height & Letter Spacing

```css
/* Hero/Display (text-4xl and above) */
font-family: var(--font-heading);
line-height: 1.05;
letter-spacing: -0.04em;
font-weight: 700;

/* Section headers (text-2xl to text-3xl) */
font-family: var(--font-heading);
line-height: 1.1;
letter-spacing: -0.025em;
font-weight: 600;

/* Card titles (text-lg to text-xl) */
font-family: var(--font-heading);
line-height: 1.2;
letter-spacing: -0.015em;
font-weight: 600;

/* Body text (text-base) */
font-family: var(--font-body);
line-height: 1.65;
letter-spacing: 0em;
font-weight: 400;

/* Small labels / metadata (text-sm and below) */
font-family: var(--font-body);
line-height: 1.4;
letter-spacing: 0.01em;
font-weight: 500;

/* ALL CAPS labels (section badges, overlines) */
font-family: var(--font-body);
font-size: var(--text-xs);
letter-spacing: 0.10em;
font-weight: 500;
text-transform: uppercase;
```

### 3.4 Typography Usage Examples

```
Hero headline:    Onest 700, text-4xl (67px), tracking -0.04em, lh 1.05
Hero accent word: Same, color: var(--color-accent)
Hero subtitle:    Figtree 400, text-md (18px), color: var(--color-text-secondary), lh 1.65
Section overline: Figtree 500 uppercase, text-xs (9px), tracking 0.10em, color: var(--color-accent)
Section headline: Onest 600, text-2xl (37.9px), tracking -0.025em, lh 1.1
Card title:       Onest 600, text-lg (21.3px), tracking -0.015em
Card body:        Figtree 400, text-base (16px), color: var(--color-text-secondary)
Nav links:        Figtree 500, text-sm (12px), tracking 0.01em
CTA button text:  Figtree 600, text-sm (12px), tracking 0.02em
Code:             JetBrains Mono 400, text-sm (12px), tracking 0em
```

---

## 4. Spacing System

### 4.1 Base Grid: 4pt

All spacing values must be multiples of 4px. Primary rhythm is 8pt (8px).

```
--space-1:   4px    /* Micro: icon-label gap, inline padding */
--space-2:   8px    /* XSmall: tag padding, tight component gaps */
--space-3:   12px   /* Small: form element gaps */
--space-4:   16px   /* Base: card internal padding, nav item padding */
--space-5:   20px   /* Medium: component group gaps */
--space-6:   24px   /* Large: card padding, section element gaps */
--space-8:   32px   /* XLarge: between sibling components */
--space-10:  40px   /* 2x: major component separation */
--space-12:  48px   /* 3x: section padding (mobile) */
--space-16:  64px   /* 4x: section padding (desktop) */
--space-20:  80px   /* 5x: large section gaps */
--space-24:  96px   /* 6x: hero padding */
--space-32: 128px   /* 8x: major section separation */
```

### 4.2 Component Padding Standards

```
Button (sm):       px-12px  py-8px
Button (md):       px-20px  py-10px
Button (lg):       px-28px  py-14px

Card (compact):    p-16px
Card (default):    p-24px
Card (spacious):   p-32px

Nav:               px-24px  py-16px (outer), px-12px py-8px (links)
Input field:       px-16px  py-12px
Section (mobile):  py-64px  px-16px
Section (desktop): py-96px  px-24px
Hero (desktop):    pt-128px pb-96px
```

---

## 5. Border Radius

```
--radius-sm:   4px    /* Badges, code inline, small chips */
--radius-md:   8px    /* Buttons, inputs, small cards */
--radius-lg:   12px   /* Cards, modals, dropdown panels */
--radius-xl:   16px   /* Large cards, feature containers */
--radius-2xl:  24px   /* Hero mockup preview card */
--radius-full: 9999px /* Pills, avatar, toggle buttons */
```

---

## 6. Shadow & Depth System

Light source: directly above (0deg, top). All shadows have positive Y offset.

```css
/* Dark mode shadows — use rgba with navy color */
--shadow-xs:  0 1px 2px rgba(2, 18, 47, 0.5);
--shadow-sm:  0 2px 4px rgba(2, 18, 47, 0.4), 0 1px 2px rgba(2, 18, 47, 0.6);
--shadow-md:  0 4px 8px rgba(2, 18, 47, 0.5), 0 2px 4px rgba(2, 18, 47, 0.3);
--shadow-lg:  0 8px 16px rgba(2, 18, 47, 0.6), 0 4px 8px rgba(2, 18, 47, 0.4);
--shadow-xl:  0 16px 32px rgba(2, 18, 47, 0.7), 0 8px 16px rgba(2, 18, 47, 0.5);

/* Accent glow — only on interactive elements with accent color */
--shadow-accent: 0 0 0 1px var(--color-accent), 0 4px 16px rgba(14, 165, 233, 0.2);

/* Light mode shadows — warmer, softer */
--shadow-xs-light:  0 1px 2px rgba(35, 53, 77, 0.08);
--shadow-sm-light:  0 2px 4px rgba(35, 53, 77, 0.06), 0 1px 2px rgba(35, 53, 77, 0.10);
--shadow-md-light:  0 4px 8px rgba(35, 53, 77, 0.08), 0 2px 4px rgba(35, 53, 77, 0.06);
--shadow-lg-light:  0 8px 16px rgba(35, 53, 77, 0.10), 0 4px 8px rgba(35, 53, 77, 0.08);
```

Usage mapping:
```
Surface card:      --shadow-sm
Elevated card:     --shadow-md
Navbar (scrolled): --shadow-sm
Modal/Drawer:      --shadow-xl
Input (focused):   --shadow-accent
Dropdown panel:    --shadow-lg
```

---

## 7. Motion System

### 7.1 Named Easing Curves

```css
--ease-out:       cubic-bezier(0.16, 1, 0.3, 1);      /* Entering elements */
--ease-in:        cubic-bezier(0.7, 0, 0.84, 0);       /* Exiting elements */
--ease-in-out:    cubic-bezier(0.87, 0, 0.13, 1);      /* Transform, slide */
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);   /* Button press, popIn */
--ease-soft:      cubic-bezier(0, 0.55, 0.45, 1);      /* Subtle transitions */
```

NEVER use `ease`, `ease-in-out`, `linear` CSS keywords. Never use `transition: all`.

### 7.2 Duration Scale

```
--duration-instant:   50ms   /* Focus rings, color shifts */
--duration-fast:     100ms   /* Hover states, small UI responses */
--duration-normal:   200ms   /* Button press, input focus */
--duration-moderate: 300ms   /* Card hover, panel open */
--duration-slow:     400ms   /* Page elements entrance */
--duration-deliberate: 600ms /* Section reveals, hero animation */
```

### 7.3 Animation Rules

- **Entering** elements: `opacity: 0 → 1` + `transform: translateY(8px) → translateY(0)`, easing: `--ease-out`
- **Exiting** elements: reverse with `--ease-in`, same duration
- **Hover states:** 100ms, `--ease-soft`
- **Page load stagger:** 0ms, 80ms, 160ms, 240ms delays on sequential elements
- **Scroll reveals:** Use Intersection Observer. Threshold 0.15. Only elements BELOW initial viewport.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Component Specifications

### 8.1 Navbar

**Structure:** Fixed, full-width, transparent → frosted glass on scroll

```
Height: 64px
Layout: [Logo + Brand Name] [spacer] [Nav Links] [Theme Toggle] [CTA Button]
Background: transparent → rgba(7, 13, 20, 0.85) backdrop-blur-md (dark)
            transparent → rgba(240, 236, 221, 0.85) backdrop-blur-md (light)
Border-bottom: 0 → 0.5px solid var(--color-border-subtle) on scroll
```

**Logo:** Square-ish icon (existing DevFlow icon), 28×28px, followed by "DevFlow" in Onest 600, text-md

**Nav links:** "Features", "How it works"
- Default: Figtree 500, text-sm, color: var(--color-text-secondary)
- Hover: color: var(--color-text-primary), transition 100ms ease-soft
- Gap between links: 32px

**Theme Toggle:** 36×36px icon button, rounded-full
- Icon: Sun (light mode) / Moon (dark mode), 16px, color: var(--color-text-secondary)
- Hover: bg var(--color-bg-elevated), color: var(--color-text-primary)

**CTA Button:** "Start Building"
- Dark mode: bg transparent, border 1px var(--color-border-strong), text var(--color-text-primary)
- Hover: bg var(--color-bg-elevated), border var(--color-accent)
- Light mode: bg var(--color-text-primary) (#02122F), text var(--color-bg-page) (#F0ECDD)
- Padding: px-16px py-8px, border-radius: --radius-full (pill shape)
- Font: Figtree 600, text-sm, tracking 0.02em

---

### 8.2 Hero Section

**Layout:** 2-column grid (55% left, 45% right), vertically centered  
**Padding:** pt-128px pb-96px on desktop, pt-96px pb-64px on mobile

**Left column:**
```
[Overline badge]        ← small pill: "AI · Production Ready" in accent
[H1 headline]           ← "Turn ideas into" (neutral) + line break + 
                           "polished interfaces" (color: var(--color-accent))
[Subtitle]              ← 2 lines, Figtree 400, text-md, var(--color-text-secondary)
[Spacer: 32px]
[CTA Row]               ← Primary button + secondary link
[Feature pills]         ← 3 chips in a row, 24px gap
```

Headline spec:
- Font: Onest 700, text-4xl (67px desktop, text-3xl mobile)
- "polished interfaces": same weight/size, color: var(--color-accent)
- Letter-spacing: -0.04em, line-height: 1.05
- Do NOT use gradient text — solid accent color only

Overline badge:
- Pill shape (radius-full), padding px-12px py-4px
- Background: var(--color-accent-glow), border: 1px var(--color-border-default)
- Text: "AI · Production Ready", Figtree 500, text-xs, letter-spacing 0.06em, color: var(--color-accent-light)

Primary CTA "Try it now →":
- Background: var(--color-accent), text: white (dark mode) or #F0ECDD (light)
- Padding: px-20px py-10px, radius-full
- Figtree 600, text-sm
- Hover: brightness(1.1), shadow-accent, scale(1.02), transition 100ms ease-spring
- Arrow: inline → transform translateX(3px) on hover

Secondary link "See how it works":
- No background, no border
- Figtree 500, text-sm, color: var(--color-text-secondary)
- Underline on hover via border-bottom

Feature pills (below CTA):
```
[⚡ Lightning Fast · Seconds, not hours]
[◎ Production Ready · Deployable code]
[⊕ Customizable · Style it your way]
```
- Figtree 400, text-xs
- Icon: 14px, color: var(--color-accent)
- Title: font-weight 500, var(--color-text-primary)
- Sub: var(--color-text-secondary)
- No border, no card — just inline with icon

**Right column — Live Preview Card:**
```
Container: border-radius --radius-2xl, border 1px var(--color-border-default)
           background: var(--color-bg-surface)
           shadow: --shadow-lg
           padding: 20px
           Slight rotation: transform: rotate(-1deg) → rotate(0deg) on hover, 300ms ease-out
```
Internal UI preview is a simplified mockup of the DevFlow dashboard (mini sidebar + chat area). Keep it visually accurate to the actual dashboard — this is a product screenshot, not decoration.

**Background treatment (dark mode only):**
- Radial gradient from top-left: `radial-gradient(ellipse 80% 60% at -10% -10%, rgba(14, 165, 233, 0.06) 0%, transparent 60%)`
- Subtle dot grid: 1px dots, 24px grid, rgba(139, 163, 197, 0.08) — CSS background-image
- No noise textures, no mesh gradients — keep it sharp

---

### 8.3 Feature Cards Section

**Section heading:**
- Overline: "EVERYTHING YOU NEED", Figtree 500, text-xs, tracking 0.10em, var(--color-text-tertiary)
- H2: "Built for builders", Onest 600, text-2xl, tracking -0.025em
- Subtitle: Figtree 400, text-md, max-width 480px, centered, var(--color-text-secondary)

**Layout:** 2-column asymmetric grid
- Left: 1 large feature card (60% width)
- Right: 3 smaller stacked cards (40% width)

**Large feature card:**
```
background: var(--color-bg-surface)
border: 1px solid var(--color-border-default)
border-radius: --radius-xl
padding: 32px
shadow: --shadow-md
Hover: border-color → var(--color-border-strong), shadow → --shadow-lg, 200ms ease-out
```
Contains: Icon (24px, accent color), Title (Onest 600, text-xl), Description (Figtree 400, text-base, color: secondary), Code snippet block

Code snippet block:
```
background: var(--color-code-bg)
border-radius: --radius-md
padding: 12px 16px
border: 1px solid var(--color-border-subtle)
font: JetBrains Mono 400, text-sm
color: var(--color-code-text)
```

**Small feature cards:**
```
background: transparent
border: 0.5px solid var(--color-border-subtle)
border-radius: --radius-lg
padding: 20px 24px
Display: flex, row, icon + text
Gap: 16px
Hover: background → var(--color-bg-surface), border → var(--color-border-default)
```

---

### 8.4 Philosophy Section

**Layout:** Left-aligned, editorial. NOT centered.
- Overline badge on far left
- H2 takes 55% of width, left-aligned
- Body text in 2 columns below (or single column, staggered)
- 3 principle columns with thin top border accent

**Overline badge:**
- Pill shape, same as hero badge but different label: "Our Philosophy"
- Left-aligned, not centered

**H2:** "Design at the speed of thought"
- Onest 700, text-3xl (50.5px), tracking -0.03em
- Color: var(--color-text-primary)
- Max-width: 640px, NOT full-width

**Body text:** Figtree 400, text-md, max-width: 560px, var(--color-text-secondary)

**Principle columns (3):**
```
Each column:
  top: 1px solid var(--color-border-strong)  ← accent rule
  padding-top: 20px
  Title: Onest 600, text-base, var(--color-text-primary)
  Body: Figtree 400, text-sm, var(--color-text-secondary), lh 1.6
```

---

### 8.5 How It Works Section

**Layout:** Vertical stepper, left-aligned, with connector line

**Section heading:** Centered
- H2: "How it works", Onest 600, text-2xl
- Subtitle: Figtree 400, text-md, var(--color-text-secondary)

**Step structure:**
```
[Step number]  [Icon circle]  [Content]
               |              
               | (connector line, 1px, var(--color-border-default))
               |
```

Step number:
- JetBrains Mono 500, text-xs, var(--color-text-tertiary)
- "Step 01", "Step 02", "Step 03"
- Displayed above the icon

Icon circle:
- 40×40px, border-radius: 50%
- Background: var(--color-bg-elevated), border: 1px var(--color-border-default)
- Icon: 18px, color: var(--color-text-secondary)
- Active (when scrolled into view): border-color → var(--color-accent), icon color → var(--color-accent)

Step title: Onest 600, text-lg, var(--color-text-primary)
Step description: Figtree 400, text-base, var(--color-text-secondary), max-width: 480px

Connector line:
- Left edge of icon, 1px solid var(--color-border-subtle)
- height: 48px (gap between steps)

---

### 8.6 CTA Section

**Layout:** Full-width, high-contrast, standalone

**Dark mode treatment:**
- Background: var(--color-bg-surface), border-top: 1px var(--color-border-default)
- Centered content, py-96px

**Light mode treatment:**
- Background: var(--color-text-primary) (#02122F) ← INVERTED, dark bg in light mode
- Text: var(--color-bg-page) (#F0ECDD)
- This creates a striking contrast moment

**Content:**
- H2: "Ready to build smarter?", Onest 700, text-2xl, tracking -0.025em
- Subtitle: Figtree 400, text-md, max-width: 420px, centered
- CTA Button: "Start Building Free →"
  - Dark mode: bg var(--color-accent), text white
  - Light mode: bg #F0ECDD, text #02122F
  - Padding: px-28px py-14px, radius-full, Figtree 600, text-base

---

### 8.7 Auth Page (Sign In)

**Layout:** Full-page center, dark bg, single card

**Background:** var(--color-bg-page), same dot grid as hero (dark mode only)

**Auth card:**
```
background: var(--color-bg-surface)
border: 1px solid var(--color-border-default)
border-radius: --radius-xl (16px)
padding: 40px 36px
shadow: --shadow-xl
max-width: 400px
width: 100%
```

**Card content:**
1. Logo + "DevFlow" centered at top (Onest 600, text-lg)
2. Title "Sign in to DevFlow" (Onest 600, text-xl, tracking -0.02em)
3. Subtitle "Welcome back" (Figtree 400, text-sm, var(--color-text-secondary))
4. OAuth buttons row (GitHub, Google) — 2 columns, equal width
5. Divider "or" with horizontal lines
6. Email input
7. Continue button (full width, accent)
8. "Don't have an account? Sign up" below card (not inside)

**OAuth buttons:**
```
background: var(--color-bg-elevated)
border: 1px solid var(--color-border-default)
border-radius: --radius-md
padding: px-16px py-12px
Figtree 500, text-sm, var(--color-text-primary)
Icon: 16px native brand SVG
Hover: border-color → var(--color-border-strong), bg → var(--color-bg-hover)
```

**Email input:**
```
background: var(--color-bg-elevated)
border: 1px solid var(--color-border-default)
border-radius: --radius-md
padding: px-16px py-12px
Figtree 400, text-base, var(--color-text-primary)
Placeholder: var(--color-text-tertiary)
Focus: border-color → var(--color-accent), outline: none, shadow → --shadow-accent
```

**Continue button (full width):**
```
background: var(--color-accent)
color: white
border: none
width: 100%
padding: py-12px
border-radius: --radius-md
Figtree 600, text-sm, tracking 0.02em
Hover: brightness(1.08), shadow → --shadow-accent
```

**Remove or minimize "Secured by Clerk" / "Development mode" banner** — style it to be barely visible (opacity: 0.4, text-xs, centered at bottom of card).

---

### 8.8 Dashboard — Sidebar

**Width:** 240px (expanded), 60px (collapsed)  
**Background:** var(--color-bg-surface) (#02122F dark)  
**Right border:** 1px solid var(--color-border-subtle)

**Sidebar header:**
```
Padding: 20px 16px
DevFlow logo icon (28×28px) + "DevFlow" (Onest 600, text-md)
Subtitle "Build with AI" (Figtree 400, text-xs, var(--color-text-tertiary))
Collapse toggle: right edge, 24×24px icon button
```

**New Chat button:**
```
background: var(--color-bg-elevated)
border: 1px solid var(--color-border-default)
border-radius: --radius-md
width: calc(100% - 32px), mx-16px, my-8px
padding: py-10px
Figtree 600, text-sm
Icon: + (16px), gap 8px
Hover: border-color → var(--color-border-strong)
```

**Generate button (active nav item):**
```
background: var(--color-accent-glow)
border: 1px solid rgba(14, 165, 233, 0.25)
border-radius: --radius-md
color: var(--color-accent-light)
Icon: bolt/lightning 16px, color: var(--color-accent)
```

**Nav items (Projects, Templates, Settings):**
```
Layout: flex row, icon 16px + label, gap 10px
Padding: px-16px py-10px
border-radius: --radius-md
Default: text var(--color-text-secondary), icon var(--color-text-tertiary)
Hover: bg var(--color-bg-elevated), text var(--color-text-primary), icon var(--color-text-secondary)
Transition: 100ms ease-soft
```

---

### 8.9 Dashboard — Top Bar

**Height:** 52px  
**Background:** var(--color-bg-page)  
**Border-bottom:** 1px solid var(--color-border-subtle)  
**Padding:** px-24px

**Layout:**
```
[DevFlow logo] [AI Code Studio tab] [• Online badge] [spacer] [Search] [Theme] [Bell] [Avatar]
```

"AI Code Studio" tab:
- Figtree 500, text-sm, var(--color-text-primary)
- Background: var(--color-bg-elevated), border: 1px var(--color-border-default)
- Border-radius: --radius-full, padding: px-12px py-6px

"Online" badge:
- Green dot (6px, bg: var(--color-online)) + "Online" text
- Figtree 500, text-xs, var(--color-success)
- Background: rgba(34, 197, 94, 0.10), border-radius: --radius-full
- Padding: px-8px py-4px

Search button:
- "Search ⌘K" style
- Background: var(--color-bg-elevated), border: 1px var(--color-border-default)
- Border-radius: --radius-full, padding: px-12px py-6px
- Figtree 400, text-sm, var(--color-text-tertiary)

Notification bell:
- 36×36px, border-radius: 50%
- Badge: 16×16px circle, bg: var(--color-danger), text white, JetBrains Mono 500, text-xs
- Positioned: top-right of button

Avatar:
- 32×32px, border-radius: 50%
- Border: 2px var(--color-border-default)
- Hover: border-color → var(--color-accent)

---

### 8.10 Dashboard — Main Prompt Area

**Layout:** Vertically centered, horizontally centered, max-width 640px

**Headline:** "Turn ideas into code"
- Onest 700, text-3xl (50px), tracking -0.03em, lh 1.08
- Color: var(--color-text-primary)
- Centered

**Subtitle:** Figtree 400, text-md, var(--color-text-secondary), centered, max-width: 480px

**Quick start chips:**
```
Label: "Quick start" (Figtree 500, text-xs, var(--color-text-tertiary))
Chips: ["Make a Todo App", "Build a Budget tracker website", "Simple E-commerce website"]
  Background: var(--color-bg-elevated)
  Border: 1px var(--color-border-default)
  Border-radius: --radius-full (pill)
  Padding: px-16px py-8px
  Figtree 500, text-sm, var(--color-text-secondary)
  Hover: border-color → var(--color-accent), color → var(--color-accent-light)
  Transition: 100ms ease-soft
```

**Prompt textarea:**
```
background: var(--color-bg-surface)
border: 1px solid var(--color-border-default)
border-radius: --radius-xl (16px)
padding: 16px 56px 16px 20px  (right padding for send button)
min-height: 80px, max-height: 240px
resize: none, overflow-y: auto
Figtree 400, text-base, var(--color-text-primary)
Placeholder: "Describe what you want to build...", var(--color-text-tertiary)
Focus: border-color → var(--color-accent), shadow → --shadow-accent
```

Send button (inside textarea, bottom-right):
```
position: absolute, bottom: 12px, right: 12px
background: var(--color-bg-elevated) → var(--color-accent) when text present
border-radius: --radius-md (8px)
width: 36px, height: 36px
Icon: send/arrow, 16px
Transition: background 200ms ease-out
```

**Keyboard hint:**
```
"Press Enter to send or Shift + Enter for new line"
Figtree 400, text-xs, var(--color-text-tertiary), centered, mt-12px
Keyboard badges: bg var(--color-bg-elevated), border 1px var(--color-border-default),
                 padding: px-8px py-4px, radius-sm, JetBrains Mono 500, text-xs
```

---

## 9. Interactive States — All Components

Every interactive element must implement ALL of these states. Never skip a state.

```
DEFAULT:    As specified above
HOVER:      Defined per component above, always 100ms ease-soft
FOCUS-VISIBLE: outline: 2px solid var(--color-accent), outline-offset: 2px
               Do NOT use outline: none without replacing it
ACTIVE:     scale(0.97), transition: 50ms ease-in
DISABLED:   opacity: 0.4, cursor: not-allowed, pointer-events: none
LOADING:    Spinner or skeleton, opacity: 0.7
```

---

## 10. Background Texture (Dark Mode Only)

Apply only to `--color-bg-page` surfaces (page backgrounds, NOT cards):

```css
background-image:
  radial-gradient(ellipse 80% 50% at 0% 0%, rgba(14, 165, 233, 0.05) 0%, transparent 55%),
  radial-gradient(ellipse 50% 40% at 100% 80%, rgba(35, 53, 77, 0.3) 0%, transparent 50%),
  url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.75' fill='%238BA3C5' fill-opacity='0.06'/%3E%3C/svg%3E");
```

This creates: subtle cyan glow top-left + navy depth bottom-right + faint dot grid.  
**Do NOT apply to cards, modals, or sidebar** — page bg only.

Light mode: No texture. Clean cream surface only.

---

## 11. Tailwind Config Additions

Add to `tailwind.config.ts`:

```js
theme: {
  extend: {
    colors: {
      'navy': {
        950: '#070D14',
        900: '#02122F',
        700: '#23354D',
        500: '#495B7D',
        300: '#8BA3C5',
      },
      'cream': {
        50:  '#F0ECDD',
        100: '#E8E2CE',
        200: '#D9D1B8',
        400: '#B5A882',
      },
      'accent': {
        400: '#38BDF8',
        500: '#0EA5E9',
        700: '#0369A1',
      },
    },
    fontFamily: {
      heading: ['var(--font-heading)', 'system-ui'],
      body:    ['var(--font-body)', 'system-ui'],
      mono:    ['var(--font-mono)', 'monospace'],
    },
    borderRadius: {
      'sm':   '4px',
      'md':   '8px',
      'lg':   '12px',
      'xl':   '16px',
      '2xl':  '24px',
    },
    transitionTimingFunction: {
      'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      'ease-spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      'ease-soft':     'cubic-bezier(0, 0.55, 0.45, 1)',
    },
    transitionDuration: {
      'fast':     '100ms',
      'normal':   '200ms',
      'moderate': '300ms',
    },
  },
},
```

---

## 12. DO / DON'T Reference

### ✅ DO

- Use `var(--color-*)` tokens everywhere — never hardcode hex in components
- Apply `font-heading` (Onest) for ALL headings, `font-body` (Figtree) for ALL UI text
- Use accent color (#0EA5E9) only: hero accent word, primary CTAs, active states, code text
- Apply dot grid texture to page bg in dark mode only
- Use `focus-visible` (not `focus`) for keyboard navigation styles
- Add `prefers-reduced-motion` override to all animation blocks
- Use the warm cream (#F0ECDD) as light mode page background — this is intentional and distinctive
- Ensure WCAG AA contrast: 4.5:1 minimum for body text, 3:1 for large text
- Use JetBrains Mono for ALL code snippets, keyboard shortcuts, step numbers

### ❌ DON'T

- Use Inter, Roboto, DM Sans, or any banned font
- Apply gradient text to hero headline — solid accent color only
- Use `transition: all` — always specify the property
- Add shadows to the page background itself
- Use cyan accent on more than 2–3 elements per section
- Use purple, teal, or any color outside the defined palette
- Apply card bg (#02122F) as page bg or vice versa — maintain the 3-level depth system
- Use `rgba(0,0,0,0.1)` as the only shadow
- Skip hover/focus/active states on any clickable element
- Center-align section content except in CTA and "How it works" sections
- Use the same section height for every section — vary density intentionally

---

## 13. Page Summary

| Page | Route | Key change |
|---|---|---|
| Landing | `/` | Full redesign of all 5 sections + hero |
| Auth / Sign In | `/sign-in` | Dark card redesign, remove dev-mode banner styling |
| Dashboard | `/dashboard` (or similar) | Sidebar, topbar, and prompt area redesign |

---

## 14. Implementation Notes

- **Theme:** Use `next-themes` with `attribute="data-theme"`. Default: `dark`.
- **Fonts:** Import via `next/font/google`, apply CSS variables, reference in Tailwind config.
- **Clerk Auth:** Override Clerk's default appearance using the `appearance` prop with matching tokens. Do not fight Clerk's structure — restyle it.
- **CSS Variables:** Define all tokens in `globals.css` under `:root {}` (dark) and `[data-theme="light"] {}`. This is the source of truth.
- **No inline Tailwind color classes for theme colors** — e.g., don't use `bg-navy-900` in components. Always map to semantic token via CSS variable. Tailwind color classes only in config.
- **Component order:** Style in this order — Layout pages → Shared components (Navbar, Footer) → Section components → Auth page → Dashboard.

---

*End of DESIGN.md v1.0*  
*Next step: Antigravity prompt chain (see PROMPTS.md)*