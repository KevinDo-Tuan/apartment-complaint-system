# Design Brief

## Direction

**Property Management System** — Professional, task-focused interface for apartment complaint management. Hosts and tenants collaborate to identify, track, and resolve housing issues efficiently.

## Tone

Brutally minimal — refined clarity without decoration. Function over form. Productive tools should disappear, leaving only data and decisions visible.

## Differentiation

Clean card-based interface with instant visual status differentiation (badges, colors, typography hierarchy) lets managers scan and resolve complaints at a glance—no decoration required.

## Color Palette

| Token                   | OKLCH            | Role                        |
| ----------------------- | ---------------- | --------------------------- |
| background              | 0.99 0.005 260   | Page base (light mode)      |
| foreground              | 0.15 0.01 260    | Primary text                |
| card                    | 1.0 0.0 0        | Card surfaces               |
| primary                 | 0.45 0.18 255    | Actions, CTA (slate-blue)   |
| primary-foreground      | 0.98 0.005 255   | Text on primary             |
| accent                  | 0.55 0.16 155    | Status indicators (teal)    |
| accent-foreground       | 0.98 0.005 155   | Text on accent              |
| muted                   | 0.95 0.01 260    | Disabled, secondary states  |
| muted-foreground        | 0.5 0.01 260     | Muted text                  |
| success                 | 0.55 0.18 150    | Resolved status             |
| warning                 | 0.7 0.15 85      | In-progress status          |
| destructive             | 0.55 0.22 25     | Critical/open status        |
| border                  | 0.9 0.01 260     | Dividers, outlines          |

## Typography

- Display: Space Grotesk — headers, labels, section titles
- Body: General Sans — paragraphs, descriptions, UI labels, complaint text
- Mono: JetBrains Mono — reference numbers, ticket IDs
- Scale: hero `text-5xl md:text-7xl`, h2 `text-3xl`, label `text-sm uppercase`, body `text-base`

## Elevation & Depth

One-level card elevation via subtle shadow only: borders define surfaces, not shadows. Cards use `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`. No blur, no layering tricks. Depth through composition, not effects.

## Structural Zones

| Zone           | Background               | Border                   | Notes                          |
| -------------- | ------------------------ | ------------------------ | ------------------------------ |
| Header         | card (white)             | border (light gray)      | Navigation, breadcrumbs        |
| Content Area   | background (off-white)   | —                        | Complaint cards, form sections |
| Card Content   | card (white)             | border (light gray)      | Elevated surfaces, 6px radius  |
| Footer         | muted/5% opacity         | border-t (light gray)    | Copyright, links only          |

## Spacing & Rhythm

Spacious: 2rem between major sections, 1rem between cards, 0.75rem between form groups. Dense micro-spacing inside cards (0.5rem padding groups). Breathing room improves scanning for high-cognitive-load task management.

## Component Patterns

- Buttons: solid primary/success/destructive bg, white text, `rounded-md`, no shadow; hover darkens L by 0.05
- Cards: white bg, 1px light gray border, `rounded-md`, shadow-sm; hover lifts slightly (translate -2px) over 200ms
- Badges: light background (`oklch(0.85...)`), colored foreground text, `rounded-full`, inline-block
- Status labels: small caps, bold weight, inline with complaint title

## Motion

- Entrance: `fade-in 300ms ease-out` on mount (cards, modals)
- Hover: `box-shadow` deepens, translateY -2px over 200ms on card-hover
- Decorative: none — animations serve UX feedback only

## Constraints

- No gradients, glassmorphism, or backdrop-blur
- No decorative animations or floating elements
- Card radius: 6px (professional, not rounded)
- All colors through CSS variables; zero hardcoded hex values
- Dark mode shares same palette structure, inverted L values
- Mobile-first responsive: `sm:` 640px, `md:` 768px, `lg:` 1024px

## Signature Detail

Card borders subtly define surfaces instead of shadows. This constraint forces intentional composition and spacing—the opposite of blurry, soft UI. Clarity and restraint are the signature.

