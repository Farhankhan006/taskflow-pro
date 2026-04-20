# Design Brief: TaskFlow Pro

## Summary
Premium mobile-first task management app. Deep indigo/purple gradient brand palette. Dark mode primary aesthetic with glassmorphic overlays. Smooth cubic-bezier animations. Notion + Linear + Todoist level polish.

## Visual Direction
**Tone:** Sophisticated, calm, focused. Premium productivity tool for professionals and teams.
**Aesthetic:** Modern minimalism with luxury depth. Glassmorphism for floating elements. Gradient accents for brand expression.
**Differentiation:** Semi-transparent glass cards with backdrop blur, gradient text accents on CTAs, layered shadows for depth, smooth micro-interactions on all interactive elements.

## Palette (OKLCH)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | `0.50 0.15 270` | `0.70 0.18 260` | Buttons, active states, brand accent |
| Secondary | `0.42 0.18 295` | `0.55 0.15 295` | Supporting UI, secondary actions |
| Accent | `0.65 0.25 275` | `0.72 0.26 270` | CTAs, highlights, focus rings |
| Background | `0.97 0.01 280` | `0.12 0.01 270` | Page background |
| Card | `0.99 0 0` | `0.16 0.02 270` | Content containers |
| Foreground | `0.18 0.02 270` | `0.92 0.02 280` | Body text |
| Muted | `0.92 0.02 275` | `0.25 0.02 275` | Disabled, secondary text |
| Border | `0.90 0.02 280` | `0.22 0.02 270` | Dividers, outlines |
| Destructive | `0.55 0.22 25` | `0.65 0.19 22` | Delete, error states |
| Success | `0.68 0.18 30` | `0.70 0.20 30` | Completion, positive feedback |

## Typography
| Role | Font | Scale | Weight | Usage |
|------|------|-------|--------|-------|
| Display | General Sans | 32px / 28px / 24px | 700 | Page titles, hero text |
| Body | DM Sans | 16px / 14px | 400 / 500 | Body copy, labels |
| Mono | Geist Mono | 12px / 14px | 400 | Code, timestamps |

## Elevation & Depth
- **Cards**: `.glass` utility — `backdrop-filter: blur(8px)`, semi-transparent background, 1px subtle border
- **Modals**: `.glass` with `.shadow-elevated`
- **Inputs**: `.glass-sm` utility — reduced blur (4px), lighter background
- **Depth hierarchy**: `shadow-subtle` (default), `shadow-elevated` (lifted elements)

## Structural Zones
| Zone | Treatment | Usage |
|------|-----------|-------|
| App Header | `gradient-primary` bar, solid card background | Navigation, title |
| Main Content | `bg-background` with alternating `bg-card` sections | Task list, dashboard |
| Bottom Navigation | `.glass` frosted effect, 5 tabs (Dashboard, Tasks, Search, Analytics, Profile) | Primary nav |
| Task Cards | `.glass` with priority badges, due dates, category tags | Content item |
| Inputs/Forms | `.glass-sm` with subtle border, focus ring in accent color | Input fields, search |

## Spacing & Rhythm
- **Base unit**: 4px grid
- **Density**: 16px (primary), 12px (secondary), 8px (micro)
- **Mobile first**: Full-width containers with 16px padding on mobile, expand to 24px on desktop

## Component Patterns
- **Buttons**: Primary (gradient background), Secondary (muted background), Ghost (transparent)
- **Task Items**: Card with title, due date, priority badge (High/Med/Low), category tag, checkbox
- **Progress Indicators**: Circular progress for daily completion, linear bars for weekly trends
- **Badges**: Priority (red/yellow/blue), Category (distinct colors), Status (success/pending)

## Motion & Animation
| Animation | Timing | Usage |
|-----------|--------|-------|
| `fade-in` | 0.4s ease-out | Page/modal entrance |
| `slide-up` | 0.4s cubic-bezier(0.4, 0, 0.2, 1) | Task list items, bottom sheet |
| `scale-in` | 0.3s cubic-bezier(0.4, 0, 0.2, 1) | Buttons, interactive elements |
| `pulse-subtle` | 2s ease-in-out | Notification badges, activity indicators |

## Responsive Breakpoints
- **Mobile (base)**: 320px–424px, full-width cards, bottom navigation
- **Tablet (sm)**: 425px–768px, 2-column grid for task items
- **Desktop (md)**: 769px–1024px, 3-column grid, sidebar navigation
- **Large (lg)**: 1025px+, optimized for wider screens

## Constraints
- No neon or overly bright colors
- No border-radius 100% (rounded corners capped at 16px)
- Dark mode enforced on mobile, light mode as secondary
- All interactive elements require 44px minimum tap target
- Maximum 2 typefaces per view (General Sans + DM Sans)

## Signature Detail
**Gradient accent text** on key CTAs and headings — primary-to-secondary gradient that reinforces the brand. **Frosted glass navigation** on bottom bar with subtle backdrop blur creates premium, floating effect. **Smooth micro-interactions** on task completion — scale + fade animations that reward user action.

---

Generated: Apr 2026 | Framework: Tailwind CSS + OKLCH | Dark Mode: Primary
