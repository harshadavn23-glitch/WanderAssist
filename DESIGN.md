# Design Brief: WanderAssist Professional Layout Polish

## Purpose & Context
Premium travel planning platform with professional-grade layout polish: consistent spacing grid (16/24/32px), refined typography hierarchy, polished card design, sidebar active states, and comprehensive loading/empty state patterns. Dark mode primary; light mode secondary.

## Tone & Differentiation
**Adventurous, editorial, premium-modern.** Warm amber accent on cool slate neutrals creates intuitive navigation hierarchy. Smooth motion rewards exploration. Signature: amber wayfinding — every actionable element glows warmly, users follow the light. Professional consistency across all surfaces.

## Color Palette

| Token | Light | Dark |
|-------|-------|------|
| Background | `0.97 0 0` (off-white) | `0.08 0.01 250` (deep charcoal) |
| Foreground | `0.12 0.02 260` (dark slate) | `0.95 0 0` (near-white) |
| Primary | `0.28 0.12 250` (ocean blue) | `0.62 0.18 250` (bright sky blue) |
| Accent | `0.68 0.18 70` (sunset gold) | `0.74 0.2 70` (vivid gold) |
| Muted | `0.93 0.01 250` (light grey) | `0.16 0.02 250` (dark slate) |
| Destructive | `0.55 0.22 25` (red) | `0.65 0.22 22` (vibrant red) |
| Border | `0.88 0.01 250` (light slate) | `0.22 0.02 250` (mid slate) |

## Typography
**Display**: Space Grotesk (bold, geometric, modern). **Body**: Nunito (warm, friendly, approachable). **Mono**: Geist Mono (codes, Surprise Plan tokens). **Hierarchy**: 12px labels / 14px body / 16px card titles / 18px section headers / 24px page headers / 32px hero text. Line-height ≥1.5.

## Shape Language & Spacing
**Radius**: 10px default (0.625rem) for cards/buttons. **Spacing Grid**: 4px base with 16px (1rem) small / 24px (1.5rem) medium / 32px (2rem) large / 48px (3rem) xl. **Shadows**: 1px/3px subtle → 2px/8px card → 4px/24px elevated → 8px/48px hero. **Transitions**: 0.3s cubic-bezier(0.4, 0, 0.2, 1).

## Structural Zones

| Zone | Surface | Border | Purpose |
|------|---------|--------|---------|
| Header/Nav | `bg-card border-b` | `border-border` | Navigation, theme toggle, logo |
| Hero | `bg-gradient-to-br from-primary/5` | — | CTA, Surprise Plan, destination picker |
| Content | Alternate `bg-background` / `bg-muted/30` | — | Search, packages, map, results |
| Card | `bg-card border rounded-lg shadow-card` | `border-border` | Destination, tour, booking details |
| Sidebar | `bg-sidebar border-r` | `border-sidebar-border` | Navigation links; active: bold + left border accent |
| Form | `bg-input border-2 border-border` | Focus: `border-accent ring-accent/20` | Inputs, textarea, selects (40px height) |
| Modal | `bg-popover border rounded-lg shadow-elevated` | `border-border` | Payment, confirmation, chat |
| Footer | `bg-muted/40 border-t` | `border-border` | Social, credits, legal |
| Loading | Skeleton cards + spinner overlay | — | Shimmer animation; centered "Processing..." |
| Empty | Centered icon (80px) + heading + CTA | — | No bookings, no results, no data |

## Component Patterns
**Buttons**: 40px height / 14px semi-bold font / rounded-lg / 4px padding horizontal. Variants: `.btn-primary` (blue bg, white text), `.btn-secondary` (border, text), `.btn-accent` (gold), `.btn-destructive` (red), `.btn-ghost` (transparent). Hover: brightness-95; Active: scale-95. **Forms**: Labels 12px / muted foreground. Inputs 40px height, 12px placeholder text, 2px focus border (accent). Error text 12px semi-bold red. **Sidebar active**: Bold text + 4px left gold border + light background tint. Inactive hover: subtle background. **Cards**: `.card-base` = `bg-card border border-border rounded-lg shadow-card transition-smooth`. Hover adds `shadow-elevated`.

## Loading & Empty States
**Loading**: Skeleton cards (gray shimmer animate-pulse). Async operations: centered spinner overlay + "Processing..." text. **Empty**: Centered layout with 80px icon, 18px/600 heading, descriptive text, CTA button. Applied to booking history, search results, list views.

## Motion & Animation
**Entrance**: `animate-fade-in` (0.4s) on load; `animate-slide-up` (0.3s) for lists. **Hover**: `card-hover` → `shadow-elevated` + `scale(1.02)`. **Interaction**: Button press scales down (active:scale-95), release scales back. **Transition**: All interactive elements use `transition-smooth` (0.3s cubic-bezier). **Feedback**: Form focus rings, button state changes, modal fade-in (0.2s).

## Constraints
- No generic blues or bootstrap defaults — amber + slate only.
- Spacing grid locked to 4px base (16/24/32/48px multiples).
- Card shadows never overshadow content; graduated elevation only.
- All text passes AA+ contrast (OKLCH L delta ≥0.7 for foreground-on-background).
- Motion ≤0.4s to avoid sluggish feel; all transitions use easing curve.
- Form inputs always 40px height with consistent focus treatment.
- Sidebar active states use left border accent (4px) + bold text; no background alone.

## Signature Details
**Amber wayfinding**: Every actionable element (CTA, active state, badges) uses warm amber — creates "breadcrumb psychology" guiding users through booking flow. **Professional consistency**: Spacing grid, shadow hierarchy, and typography tiers applied uniformly across all pages. **Responsive polish**: Loading states, empty states, and skeleton cards elevate user experience during async operations.

## Accessibility
Semantic HTML, sufficient color contrast (tested via OKLCH), keyboard navigation via Radix, focus rings use accent color (4px outline), form labels associated with inputs, error messages paired with inputs, loading states announced with role="status", empty states have descriptive headings and actionable CTAs.

## Implementation Notes
All tokens are CSS custom properties (`:root` light, `.dark` dark mode). Utility classes available globally (`.gap-sm`, `.gap-md`, `.gap-lg`, `.px-md`, `.py-lg`, `.btn-primary`, `.form-input`, `.empty-state`, `.skeleton-card`, `.loading-spinner`). Components consume via Tailwind semantic classes and professional utilities. No hardcoded colors or spacing — all derived from design tokens.
