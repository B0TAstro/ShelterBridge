# ShelterBridge — Design Direction

This document defines the visual and UX direction for ShelterBridge. It is the
single source of truth for look, feel, and flow. Code should follow it; when it
and the code disagree, update one of them on purpose.

> **Not affiliated with Bethesda, ZeniMax, or Microsoft.** ShelterBridge uses an
> _original_ retro-bunker/terminal aesthetic. It must never ship official Fallout,
> Vault-Tec, Vault Boy, or Pip-Boy artwork, fonts, sounds, or extracted UI assets.

---

## 1. Design principles

1. **Local-first & reassuring.** Every screen should make the user feel their
   original save is safe. Show what will happen _before_ it happens.
2. **One clear action per screen.** The app is a guided flow, not a dashboard.
3. **Legible over flashy.** The retro effects are seasoning, never a barrier to
   reading data. Effects must be subtle and disable-able.
4. **Original, not a clone.** Genre-inspired (terminal, industrial), zero
   protected assets. Our own name, mascot, colors, wording.
5. **Simple first.** V1 ships a small, styled, honest tool — not every effect.

---

## 2. Visual identity

**Concept:** the control terminal of a fictional fallout shelter. Phosphor text
on deep panels, light CRT texture, industrial framing, calm system messages
addressing the user as _Overseer_ (our own flavor wording, generic enough to be
original).

**Mood words:** calm, sturdy, trustworthy, retro-futuristic, offline.

---

## 3. Color palette (design tokens)

Original values — deliberately _not_ the official game's greens. Use these as CSS
custom properties (see `src/theme/tokens.css` later).

| Token               | Hex                     | Usage                                   |
| ------------------- | ----------------------- | --------------------------------------- |
| `--sb-bg-deep`      | `#0A0F0B`               | App background (near-black, greenish)   |
| `--sb-bg-panel`     | `#101711`               | Panels / cards                          |
| `--sb-bg-panel-2`   | `#16211A`               | Raised panel / hover                    |
| `--sb-phosphor`     | `#4DE07A`               | Primary text & accents (original green) |
| `--sb-phosphor-dim` | `#2C7A47`               | Secondary text, borders                 |
| `--sb-amber`        | `#E8A33D`               | Warnings (Steam Cloud conflicts, etc.)  |
| `--sb-danger`       | `#E4572E`               | Errors (rare — we never delete)         |
| `--sb-text-soft`    | `#C8D6C0`               | Body text                               |
| `--sb-text-mute`    | `#7C8C78`               | Captions, metadata                      |
| `--sb-grid-line`    | `rgba(77,224,122,0.08)` | Grid / scanline overlay                 |
| `--sb-glow`         | `rgba(77,224,122,0.35)` | Focus / hover glow                      |

**Rules of thumb**

- Green = normal & success. Amber = "read carefully". Red = "something failed".
- Keep large surfaces dark; let phosphor pop on small areas (text, borders, icons).
- Never use red for a _destructive_ action button — there are none by design.

---

## 4. Typography

Free, open fonts only (self-host or Google Fonts — never a game font).

| Role                       | Font                                  | Notes                       |
| -------------------------- | ------------------------------------- | --------------------------- |
| Terminal / data / headings | `JetBrains Mono` (or `IBM Plex Mono`) | Monospace = terminal feel   |
| Long-form / guide text     | `Inter`                               | Readability for step guides |

- Base size 15–16px, line-height ~1.5 for body.
- Headings in monospace, uppercase, slight letter-spacing (`0.04em`).
- Numbers (caps, dwellers…) in monospace with tabular figures for alignment.

---

## 5. Layout & shape tokens

| Token             | Value                              | Usage                   |
| ----------------- | ---------------------------------- | ----------------------- |
| `--sb-radius`     | `6px`                              | Cards, buttons          |
| `--sb-radius-sm`  | `3px`                              | Inputs, chips           |
| `--sb-border`     | `1px solid var(--sb-phosphor-dim)` | Panel edges             |
| `--sb-space-unit` | `8px`                              | Spacing scale (×1,2,3…) |
| `--sb-maxw`       | `960px`                            | Content max width       |

- Fixed window, centered content column, generous padding.
- Panels have a thin phosphor border + a faint inner glow, optionally one
  "notched" corner for the industrial look.

---

## 6. Motion & animation

Subtle, purposeful, and **always** gated behind `prefers-reduced-motion`.

| Animation           | Where                            | Duration              |
| ------------------- | -------------------------------- | --------------------- |
| Typewriter reveal   | System log messages              | ~20ms/char            |
| Progress fill       | "Transfer capsule" during backup | tied to real progress |
| Soft glow on hover  | Buttons, selectable cards        | 150ms                 |
| Scanline overlay    | Whole app, very low opacity      | static/slow           |
| Boot flicker (once) | App launch splash                | ~400ms                |

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

Rule: no animation should delay the user's ability to read or click.

---

## 7. Core UI components

Build these as small, reusable React components (`src/components/`). Names are
proposals.

| Component       | Purpose                                                      |
| --------------- | ------------------------------------------------------------ |
| `TerminalPanel` | Framed container (border + glow, optional notched corner)    |
| `VaultCard`     | Save inspection card: name, slot, dwellers, caps, resources… |
| `SlotSelector`  | Pick target slot 1/2/3 (three "bays")                        |
| `StepGuide`     | Numbered, checkable steps (iPhone transfer)                  |
| `SystemLog`     | Typewriter output area (`Scanning vault data...`)            |
| `WarningBanner` | Amber banner (Steam Cloud conflict, compatibility)           |
| `PrimaryButton` | Industrial button with tactile hover/focus                   |
| `GhostButton`   | Secondary / cancel                                           |
| `HashChip`      | Monospace short hash with copy-on-click                      |
| `SafetyNote`    | Persistent "your original is untouched" reassurance line     |

---

## 8. Screens

Six primary screens, matching the README flow.

1. **Home / Source** — choose: _Scan this computer_, _Import .sav_,
   _Import folder_, _Open backup_. Big, calm, one panel.
2. **Inspection** — `VaultCard` + `HashChip` + validation status
   ("Looks like a valid Fallout Shelter save ✓").
3. **Destination & Slot** — pick destination (iPhone / local folder) and
   `SlotSelector` (1/2/3). Shows the resulting filename (e.g. `Vault2.sav`).
4. **Backup & Prepare** — runs the safety sequence with `SystemLog` +
   progress; ends with a transfer report and "Open backup folder".
5. **Guided Transfer** — `StepGuide` for the iPhone/Finder steps.
6. **History / Settings** — local transfer history + preferences (theme,
   reduce-motion, default backup location).

Every screen keeps a `SafetyNote` visible.

---

## 9. UX flow

```text
Import save
  → Analyze (decrypt + validate)
  → Preview Vault (VaultCard)
  → Choose destination
  → Choose target slot
  → Safe backup (never touches the original)
  → Assisted transfer (guided steps)
  → Record in history
```

- The flow is linear with a visible progress indicator (step 1..n).
- The user can go back at any step; nothing is written until "Backup & Prepare".
- Destructive-looking wording is avoided everywhere ("prepare a copy", not "move").

---

## 10. Voice & tone (system messages)

Original, in-universe but generic. Reassuring, never alarmist.

```text
Scanning vault data...
Save validated. Original left untouched.
Creating backup capsule...
Verifying checksum...
Transfer capsule prepared for Slot 2.
All done, Overseer.
```

Warnings (amber) are factual: _"Importing into Steam may conflict with Steam
Cloud. Your backup is kept regardless."_

---

## 11. V1 recommendations (ship small, ship styled)

**Do in V1**

- Palette + one monospace font + `TerminalPanel` + `VaultCard`.
- A single subtle scanline overlay + typewriter on `SystemLog`.
- The linear flow with the persistent `SafetyNote`.

**Defer**

- Custom mascot, boot splash flicker, sound, multiple themes.
- Heavy CRT curvature / bloom (eye fatigue, low value).
- Any per-field experimental save parsing (only show reliably-parsed fields).

Rationale: ~20% of the effects deliver ~80% of the atmosphere. Keep the rest as
polish once the flow works on real saves.

---

## 12. Accessibility

- Respect `prefers-reduced-motion` (kill all animation).
- Maintain contrast: phosphor `#4DE07A` on `#0A0F0B` passes AA for text sizes we
  use; check amber/red on dark too.
- Full keyboard navigation; visible focus ring (use `--sb-glow`).
- Don't rely on color alone — pair amber/red with an icon + label.

---

## 13. Files to create later (design implementation)

Not now — this is the map for when we build the UI.

```text
src/theme/tokens.css        # the CSS custom properties from §3–§6
src/theme/global.css        # base styles, font imports, scanline overlay
src/components/TerminalPanel.tsx
src/components/VaultCard.tsx
src/components/SlotSelector.tsx
src/components/StepGuide.tsx
src/components/SystemLog.tsx
src/components/WarningBanner.tsx
src/components/PrimaryButton.tsx
src/screens/Home.tsx
src/screens/Inspection.tsx
src/screens/Destination.tsx
src/screens/BackupPrepare.tsx
src/screens/GuidedTransfer.tsx
src/screens/History.tsx
```
