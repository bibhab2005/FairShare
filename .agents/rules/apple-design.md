---
description: Automatically enforce Apple fluid design principles across all web UI, CSS, components, gestures, and animations
globs: ["**/*.{html,css,js,jsx,ts,tsx,vue,svelte}"]
---

# Apple Design System & Fluid Motion Rules

When creating, auditing, modifying, or styling any user interface elements, components, transitions, gestures, or visual layouts in this workspace:

1. **Active Skill Integration**:
   - Reference and adhere to the guidelines in the global `apple-design` skill (`~/.gemini/config/skills/apple-design/SKILL.md`).

2. **Core Interaction Physics & Timing**:
   - **Instant Press Feedback**: Interactive elements (buttons, cards, links, chips, tabs) MUST react immediately on touch-down / pointer-down (e.g. `:active { transform: scale(0.97); transition: transform 100ms cubic-bezier(0.2, 0.8, 0.2, 1); }`). Never wait for pointer-up/click to show press feedback.
   - **Direct Manipulation & 1:1 Tracking**: Dragged elements (drawers, sheets, sliders, carousels) must stay glued to the cursor/finger offset with pointer capture, tracking 1:1.
   - **Interruptibility**: Animations must be reversible and interruptible mid-flight from their live presentation value without jarring resets or hard cuts.
   - **Springs Over Fixed Curves**: Prefer physics-based springs over static cubic-bezier ease curves. Critically damped `damping: 1.0, response: 0.3-0.4` (or framer-motion `bounce: 0, duration: 0.35`) for standard transitions; underdamped `damping: ~0.8` (or `bounce: 0.15-0.2`) for momentum-driven releases and flicks.
   - **Momentum & Rubber-Banding**: Boundary overflows must rubber-band softly (constant ~0.55) rather than hit a rigid hard stop.

3. **Visual Aesthetics & Materials**:
   - **Glass & Depth**: Use single translucent functional layers (`backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);`) with semi-transparent background and crisp subtle light edges (`border: 1px solid rgba(255,255,255,0.4)` or `border: 1px solid rgba(0,0,0,0.06)`). Never stack light translucent glass on light translucent glass.
   - **Optical Typography**: Display headings require tight negative letter-spacing (`letter-spacing: -0.025em; line-height: 1.1;`). Body text stays near 0 tracking with comfortable leading (`1.5-1.6`). Use the Apple system font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif`).
   - **Soft Diffused Elevation**: Avoid harsh dark drop shadows. Use multi-layered ambient light shadows.

4. **Accessibility First**:
   - Always implement `@media (prefers-reduced-motion: reduce)` replacing springs/slides with clean opacity cross-fades.
   - Provide `@media (prefers-reduced-transparency: reduce)` with solid backgrounds, and `@media (prefers-contrast: more)`.
