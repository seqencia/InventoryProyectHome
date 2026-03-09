# Design System

Style: **Windows 11 Fluent Design** — frosted glass, soft shadows, pill tabs, Windows blue accent.

---

## Colors

| Token | Value | Usage |
|---|---|---|
| Primary | `#0078d4` | Buttons, active tab, links, chart bars |
| Primary hover | `#106ebe` | Button hover state |
| Success | `#107c10` | Confirm sale button, success states |
| Warning | `#8a5700` | Low-stock text |
| Danger text | `#a4262c` | Error states, danger buttons |
| Purple | `#6a1b9a` / `#7519b5` | Regalía, Devuelta status, profit card |
| Page bg | `#f3f3f3` | Body background |
| Card bg | `#ffffff` | All card/panel backgrounds |
| Border | `#f0f0f0` / `#e5e5e5` | Card borders, table separators |
| Text primary | `#1a1a1a` | Main content |
| Text secondary | `#5c5c5c` | Labels, secondary info |
| Text muted | `#9e9e9e` | Hints, empty states, table headers |

## Status badge palette

| Status | Background | Text |
|---|---|---|
| Completada / Disponible / success | `#e8f5e9` | `#2e7d32` |
| Cancelada / danger | `#ffebee` | `#a4262c` |
| Pendiente / warning | `#fff8e1` | `#8a5700` |
| Devuelta / regalía | `#f3e5f5` | `#6a1b9a` |
| Parcial | `#fff3e0` | `#e65100` |
| Tarjeta / info | `#e3f2fd` | `#1565c0` |
| Transferencia | `#ede7f6` | `#6a1b9a` |

---

## Typography

- **Font family**: `'Segoe UI', system-ui, -apple-system, sans-serif`
- **Section titles**: 18px, weight 700, `#1a1a1a`, `letterSpacing: '-0.3px'`
- **Card headers**: 13–14px, weight 600, `#5c5c5c`
- **Table headers**: 11px, weight 700, `#9e9e9e`, `textTransform: 'uppercase'`, `letterSpacing: '0.5px'`
- **Body text**: 13px
- **Hints**: 11px, `#9e9e9e`
- **Monospace** (receipt): `'Courier New', Courier, monospace`

---

## Layout & Spacing

- **Page padding**: `24px`
- **Card border-radius**: `12px`
- **Card shadow**: `0 2px 8px rgba(0,0,0,0.07)`
- **Modal shadow**: `0 24px 64px rgba(0,0,0,0.18)`
- **Grid gap**: `16px` (standard), `12px` (form grids)

---

## Navbar

```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(0, 0, 0, 0.08);
height: 50px;
position: sticky; top: 0; z-index: 100;
```

- Active tab: pill shape, `background: #0078d4`, `borderRadius: '20px'`, white text
- Inactive tab: transparent bg, `#5c5c5c` text

---

## Global CSS classes (injected via `<style>` in `app.js`)

All interactive hover/focus effects require CSS classes because inline styles cannot target pseudo-classes.

| Class | Effect |
|---|---|
| `.fl-input`, `.fl-select` | Focus ring: `border-color: #0078d4`, `box-shadow: 0 0 0 3px rgba(0,120,212,0.14)` |
| `.fl-btn-primary` | Hover: `background: #106ebe`, drop shadow |
| `.fl-btn-secondary` | Hover: `background: #eff6fc`, blue border/text |
| `.fl-btn-ghost` | Hover: `background: rgba(0,0,0,0.05)` |
| `.fl-btn-danger` | Hover: red fill |
| `.fl-tr` | Row hover: `background: #f5f5f5` on all `td` |
| `.fl-tr-amber` | Row hover: `background: #fffbf0` |
| `.fl-product-row` | Hover: `background: #f5f5f5` |
| `.fl-card` | Hover: `box-shadow: 0 6px 24px rgba(0,0,0,0.12)` |
| `.fl-tab` | Hover: `background: rgba(255,255,255,0.18)` |
| `.fl-option` | Hover: `background: #f0f7ff` |

---

## Buttons

| Variant | Style |
|---|---|
| Primary | `background: #0078d4`, white text, `borderRadius: 8px` |
| Secondary | `background: white`, `border: 1px solid #d1d1d1`, `#1a1a1a` text |
| Ghost | `background: transparent`, no border |
| Danger | `background: white`, `border: 1px solid #ef9a9a`, `#a4262c` text |
| Confirm sale | `background: #107c10`, white text |

---

## Modals

All modals use frosted glass overlay:
```js
background: 'rgba(0,0,0,0.4)'
backdropFilter: 'blur(8px)'
WebkitBackdropFilter: 'blur(8px)'
```

Modal content: `background: white`, `borderRadius: 12px`, scrollable body (`overflowY: 'auto'`), fixed header + footer with `borderTop/Bottom: '1px solid #f0f0f0'`.

Clicking outside the modal (on the overlay) closes it via `onClick={(e) => e.target === e.currentTarget && onCancel()}`.

---

## Rules

- **Inline styles only** — no CSS files, no Tailwind, no UI libraries
- All hover/focus that requires pseudo-selectors → use a CSS class from the global sheet
- New interactive elements should add `className="fl-btn-primary"` (or appropriate variant) alongside the `style` prop
- All UI text in **Spanish**
- Emojis used as tab icons only
