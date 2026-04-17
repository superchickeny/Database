// Design tokens — single source of truth.
// Import Geist + Geist Mono in index.html:
//   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" />

export const FONT_SANS = "'Geist', ui-sans-serif, system-ui, sans-serif"
export const FONT_MONO = "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace"

export const SANS: React.CSSProperties = { fontFamily: FONT_SANS }
export const MONO: React.CSSProperties = { fontFamily: FONT_MONO }

// Neutral ramp — near-black → near-white. Warm-cool balanced.
export const c = {
  bg:        '#0a0a0b',   // app background
  surface:   '#111113',   // elevated surface (cards, rows)
  surface2:  '#16161a',   // hovered surface
  border:    'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.10)',

  text:      '#ededef',   // primary text
  textDim:   '#8a8a93',   // secondary text
  textFaint: '#51515a',   // tertiary / labels
  textGhost: '#2a2a2f',   // barely-visible

  // Single accent. Everything else is neutral unless it carries semantic meaning.
  accent:    '#34d3be',
  accentDim: 'rgba(52,211,190,0.12)',
  accentSoft:'rgba(52,211,190,0.25)',

  // Semantic — used sparingly, only where status is the information.
  warn:      '#e5b95c',
  warnDim:   'rgba(229,185,92,0.10)',
  ok:        '#6ad48f',
  okDim:     'rgba(106,212,143,0.10)',
  err:       '#ef6b6b',
  errDim:    'rgba(239,107,107,0.08)',
}

// Radius scale — keep to two values.
export const r = { sm: 6, md: 8 }

// Reusable helpers
export const divider: React.CSSProperties = {
  borderTop: `1px solid ${c.border}`,
}