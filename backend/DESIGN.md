# Midnight Gold: Elite High-Value Design System

## 1. Vision & Emotional North Star: "The Private Vault"
This design system is built for the elite tier of the gig economy. Our North Star is **The Private Vault**: an experience that feels exclusive, secure, and extremely high-value. It rejects the "utility" feel of standard apps in favor of a luxury boutique aesthetic. Every interaction should feel like unlocking a premium opportunity.

The design philosophy is **"Subterranean Luxury"**—where deep, dark backgrounds allow golden accents to glow with a physical, metallic intensity. It is optimized for OLED screens, maximizing contrast and power efficiency while providing a stunning visual impact.

---

## 2. Colors: The Contrast of Wealth
The palette is intentionally restricted to create a singular brand identity.

### Surface Hierarchy
- **Core Background:** `#0F1115` (Matte Obsidian). This is the base layer for all screens.
- **Card/Container Surface:** `#1A1D23` (Deep Charcoal). Used for interactive cards to provide a subtle lift from the background.
- **Glass Surfaces:** Semi-transparent versions of Obsidian with `20px` backdrop blur for navigation and floating panels.

### The Signature Gold
- **Metallic Gradient:** `Linear Gradient: #B8860B (0%) → #D4AF37 (50%) → #FFD700 (100%)` at 135°. This must be used for primary CTAs, active states, and high-value status indicators.
- **Muted Gold:** `rgba(212, 175, 55, 0.2)` for borders and secondary highlights to prevent "Gold Fatigue."

---

## 3. Typography: Authoritative & Modern
We use a high-contrast type strategy to ensure legibility in dark mode.

- **Display & Headlines:** **Sora.** Bold weights (700-800). Use tight letter spacing (-0.02em) to make headlines feel compact and architectural.
- **Body & Metadata:** **Inter.** Semi-bold (600). Inter provides the technical precision needed for job details and earnings data.

Typography is always rendered in **Snow White (#F9FAFB)** or **Metallic Gold**. Never use mid-grey text on dark backgrounds; it feels cheap.

---

## 4. Elevation & Light
In a dark system, depth is created by **Glow and Translucency**, not just shadows.

- **Deep Ambient Shadows:** Use shadows with no color, only black: `Offset: 0, 15px; Blur: 45px; Color: rgba(0, 0, 0, 0.8)`.
- **Top-Light Glow:** Every job card must have a `1px` top border with a subtle gradient: `rgba(212, 175, 55, 0.4) → transparent`. This mimics a spotlight hitting the edge of a physical object.
- **Glassmorphism:** Navigation bars and bottom sheets must use `backdrop-filter: blur(20px)` and a `0.5px` border in `rgba(255, 255, 255, 0.1)`.

---

## 5. Components: Elite Functionalism

### The "High-Value" Job Card
- **Background:** `#1A1D23`.
- **Border:** `1px solid rgba(212, 175, 55, 0.2)`.
- **Shadow:** `0 10px 30px rgba(0, 0, 0, 0.5)`.
- **Header:** Title in Sora Bold, Gold Gradient.

### Navigation (The Glass Bar)
- **Position:** Floating, 24px from bottom.
- **Background:** `rgba(26, 29, 35, 0.85)`.
- **Blur:** `20px`.
- **Active State:** The icon container transforms into a solid Gold Pill with Black icon.

---

## 6. Do’s and Don'ts

### Do
- **Do** use large border radii (`24px` to `32px`) for a soft, premium feel.
- **Do** prioritize large job titles—they are the hero of the "Find Gig" screen.
- **Do** use "Metallic Sheen" animations (shimmering gold) for loading states.

### Don't
- **Don't** use standard "blue" or "green" colors. Use Gold for Success and Dark Red for Errors.
- **Don't** use 1px divider lines. Use spatial gaps or tonal shifts.
- **Don't** clutter the screen with secondary information. Keep the UI "Breathe-able."
