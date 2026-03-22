# Design System Document: The Editorial Architect

## 1. Overview & Creative North Star
**Creative North Star: "The Authoritative Curator"**
This design system moves away from the cluttered, "marketplace" feel of traditional learning platforms. Instead, it adopts the persona of a high-end architectural journal. We are not just selling courses; we are certifying expertise. The system breaks the "template" look through **intentional asymmetry**, **exaggerated white space**, and **tonal layering**. By prioritizing depth and typography over borders and boxes, we create a digital environment that feels premium, quiet, and focused—essential for high-level technical certification.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in a sophisticated intellectualism, using deep midnight blues and "ServiceNow" greens to signal both institutional trust and modern agility.

### Palette Strategy
- **Primary (`#001b44`) & Primary Container (`#002f6c`):** Use these for foundational depth. The high contrast between `on-primary` (white) and `primary` creates an immediate sense of authority.
- **Secondary (`#4a6700`) & Secondary Container (`#bdf14f`):** This is our "Action Green." Use it sparingly for critical conversion points and success states.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. 
- Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a clear but soft structural break.
- **Glass & Gradient Rule:** For hero sections, use a subtle linear gradient transitioning from `primary` to `primary-container`. This provides a "visual soul" that flat hex codes cannot achieve.
- **Surface Nesting:** Treat the UI as stacked sheets of fine paper. 
    *   **Level 0 (Background):** `surface` (`#f8f9fa`)
    *   **Level 1 (Sections):** `surface-container-low` (`#f3f4f5`)
    *   **Level 2 (Cards/Modules):** `surface-container-lowest` (`#ffffff`)

---

## 3. Typography: Editorial Authority
We pair the structural precision of **Manrope** for display with the high-readability utilitarianism of **Inter**.

- **Display (Manrope):** Used for "The Big Hook." Set `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create a bold, editorial impact.
- **Headlines (Manrope):** These guide the user through the curriculum. Use `headline-md` (1.75rem) for course titles to maintain a premium feel.
- **Body (Inter):** All instructional content uses `body-lg` (1rem). The generous line-height of Inter ensures that complex technical documentation remains approachable.
- **Labels (Inter):** Use `label-md` (0.75rem) in all-caps with increased letter-spacing (0.05em) for category tags (e.g., "ITSM," "ARCHITECT").

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are banned in favor of **Tonal Layering** and **Ambient Light**.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-high` background provides all the "lift" required.
- **Ambient Shadows:** For floating elements (like a sticky "Enroll Now" bar), use a multi-layered shadow: `0px 20px 40px rgba(25, 28, 29, 0.06)`. It should feel like a soft glow of light, not a dark smudge.
- **Glassmorphism:** Use `surface-container-lowest` at 80% opacity with a `24px` backdrop-blur for navigation bars. This allows the course content to bleed through as the user scrolls, creating a sense of continuity.
- **The "Ghost Border" Fallback:** If a divider is essential for accessibility, use the `outline-variant` token at **15% opacity**. Never use a 100% opaque stroke.

---

## 5. Components: Precision Primitives

### Buttons
- **Primary:** Background: `secondary` (`#4a6700`), Text: `on-secondary` (`#ffffff`). Corner radius: `md` (0.375rem). Use for "Start Certification."
- **Secondary:** Background: `primary-fixed`, Text: `on-primary-fixed`. Use for "View Syllabus."
- **Tertiary:** No background, `primary` text. Use for "Learn More."

### Course Cards & Progress Trackers
- **Cards:** Forbid divider lines. Use `surface-container-lowest` for the card body on a `surface-container-low` background. 
- **The Thumbnail:** Use a `0.75rem` (xl) corner radius. Overlay a glassmorphic badge (`surface-variant` at 60% opacity) in the top-right for course duration.
- **Progress Trackers:** Instead of a thin line, use a thick `6px` bar using `secondary-container` as the track and `secondary` as the fill.

### Input Fields
- Avoid "box" inputs. Use a "Bottom Line" approach or a very subtle `surface-container-high` fill with a `0px` border. 
- Error states use `error` (`#ba1a1a`) text and a `surface-container-highest` background to draw the eye without breaking the aesthetic.

### Additional Signature Component: The "Breadcrumb Trail"
A vertical lesson navigation layout on the left-hand side of the screen. Use `title-sm` for active lessons and `label-md` for upcoming ones. Instead of icons, use a simple `secondary` colored vertical line (`2px` wide) that grows as the student completes the video.

---

## 6. Do's and Don'ts

### Do
- **Do use asymmetrical layouts.** Place a large headline on the left and a floating glassmorphic card on the right that overlaps the hero section.
- **Do embrace white space.** Use the `spacing-24` (6rem) token between major sections to let the content breathe.
- **Do use "Surface Shifts."** Change the entire background color from `surface` to `primary` for a "Deep Work" section or a final exam.

### Don't
- **Don't use 1px borders.** It makes the system look like a generic bootstrap site.
- **Don't use pure black.** Always use `on-surface` (`#191c1d`) for text to maintain a high-end, softened contrast.
- **Don't use traditional "Success" Green.** Stick to the brand's `secondary` green (`#4a6700`) to ensure the identity remains cohesive and professional.