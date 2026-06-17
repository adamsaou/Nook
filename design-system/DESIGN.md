# Nook — Design Spec (source of truth)

Use the **Feel** + **Principles** below as the header of every design brief, for both
Claude Design generations and in-code work. Write it once, never re-explain the taste.

## Feel
Calm. Slick. Minimal. Nook should make a person feel **calm and human**, not technical or
overwhelmed. Slickness comes from restraint and precision, never from adding things.

## Brand tokens
- Cream `#FFF8E7` — background
- Black `#000000` — foreground
- Accent Green `#16F5A3` — a **whisper**, never loud (dot, ring, hover tint only)
- White `#FFFFFF` — surface
- Font: Geist (sans) + Geist Mono
- Signature: `Nook.` wordmark with the green dot; dotted backdrop + soft top accent glow.

## Art direction — "Nook Riso" (paper & risograph, kept minimal)
The substrate is paper; the UI stays clean on top. Warmth comes from a quiet analog base
layer, not from clutter. **Discipline: grain and the print-offset are a whisper, used on one
or two hero moments, never everywhere** (that would break calm + minimal).
- **Paper:** cream background carries a very subtle grain/noise (~3–5% opacity) for tactility.
- **Halftone:** the existing dotted backdrop *is* the riso halftone motif — reuse it, faded toward edges; optional dot texture behind a hero.
- **Ink (green #16F5A3):** the riso "spot color", used sparingly. Signature move: the `Nook.` wordmark / page-title dot gets a subtle green **print-offset** (a ~2px offset green duplicate behind the black), like slight riso misregistration.
- **Key ink (black):** text and any line art.
- **Illustration:** simple riso-style spot art (flat shapes, halftone shading, black line + green spot) for hero moments only — e.g. a cozy reading nook. Calm, not busy.
- **Type:** clean Geist on textured paper — that contrast is the "warm + slick" balance.
- **Motion tie-in:** "ink settling" — content fades in with a tiny blur bleed (pairs with the View Transitions blur keyframe); the print-offset can settle into registration on first load.
- **Per surface:** Landing = full signature treatment (spot illustration, offset wordmark, halftone hero, grain). In-app = quiet (grain base + cream surfaces + green accents only; stay uncluttered for focus). Transitions = soft blur-bleed cross-fade.

## Calm Technology principles → Nook
1. **Smallest possible attention** → one focal action per screen; the default path is a single tap.
2. **Communicate without speaking** → status via quiet visual cues (soft color, gentle motion), not alerts or noise.
3. **Use the periphery** → presence, counts, who's-speaking inform at the edges; move to center only when relevant, then back.
4. **Amplify best of tech + humanity** → warm, human copy; the machine stays out of the way; don't make humans act like machines.
5. **Work even when it fails** → graceful degradation: mic denied = stay in the room calmly; voice fails = text chat still works; calm error copy, never alarm-red.
6. **Minimum technology** → ship the smallest feature set that solves the problem. No dashboards, no clutter.
7. **Respect social norms** → introduce features gently, lean on familiar patterns before new ones.
8. **Can communicate, needn't speak** → prefer ambient/visual feedback over literal voice or notifications.

## Motion system (advanced, but calm)
The rule: motion should feel like **breathing**, not like a notification. Smooth = imperceptible and
purposeful, not flashy.
- **Easing & timing:** gentle ease-out (e.g. `cubic-bezier(0.22, 1, 0.36, 1)`), durations 150–400ms. Nothing bouncy, no overshoot.
- **Page transitions:** soft cross-fade via the **View Transitions API**; the `Nook.` wordmark persists across routes (shared element) so navigation feels continuous, nothing "pops."
- **First load / splash:** a one-time calm brand reveal (wordmark fades and settles, the green dot lands last). NOT a spinner. Must be sub-second, non-blocking, and only on a true first visit — a splash that makes someone wait would violate "smallest attention."
- **Loading states:** ambient skeletons that breathe (subtle opacity pulse), content fades in. No harsh spinners that nag.
- **Micro-interactions:** small lifts (`translateY -2/3px`), soft shadow grow, focus rings that ease in, quiet green hover tint.
- **Periphery updates:** counts/presence fade or slide in subtly, never flash for attention.
- **Always respect `prefers-reduced-motion`** — calm tech respects the person; reduce or disable motion when the OS asks.

## Do
Whitespace as a feature. Type + space carry the design. Restraint. Soft motion. Kind copy.

## Don't
Dense dashboards. Multiple bright CTAs. Harsh contrast. Loud badges. Spinners that nag. Jargon in UI copy. Motion that grabs the eye.

## Reference anchors
Things 3, Linear, Arc / Raycast, Stripe / Apple, Headspace / Calm. Foundation: Vercel / Geist (already our font). Philosophy: calmtech.com (Amber Case).
