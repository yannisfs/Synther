// Minimal inline-SVG icon set (stroke = currentColor).
// Avoids pulling in an icon dependency; only the paths the site uses.
// A value may be a single path string or an array of path strings
// (multi-path icons such as the Lucide Cog gear).
const PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  mail: 'M3 7l9 6 9-6M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7',
  pin: 'M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 2',
  check: 'M20 6L9 17l-5-5',
  // Lucide `X` (v0.460, ISC) - the dismiss glyph for the compact cookie
  // banner. Same weight as the other stroke icons.
  x: 'M18 6 6 18M6 6l12 12',
  // Lucide `SlidersHorizontal` (v0.460, ISC) - the floating "Cookie
  // settings" button glyph. Three horizontal rails with circular knobs.
  settings: [
    'M21 4h-7',
    'M10 4H3',
    'M21 12h-9',
    'M8 12H3',
    'M21 20h-5',
    'M12 20H3',
    'M14 2v4',
    'M8 10v4',
    'M16 18v4',
  ],
  // Discipline glyphs — minimal geometric line art (hub-and-spoke / flow /
  // chip / chart / branch / lens), kept technical to match the datasheet
  // aesthetic. Used on capability pages and the related-discipline grid.
  'disc-systems': [
    'M12 12h.01',
    'M5 5h.01',
    'M19 5h.01',
    'M12 19h.01',
    'M5.5 5.5L11 11',
    'M18.5 5.5L13 11',
    'M12 13v5',
  ],
  'disc-process': [
    'M5 12a7 7 0 0 1 12-5',
    'M17 4v3.5h-3.5',
    'M19 12a7 7 0 0 1-12 5',
    'M7 20v-3.5h3.5',
  ],
  'disc-development': [
    'M8 8h8v8H8z',
    'M12 8V5',
    'M12 19v-3',
    'M8 12H5',
    'M19 12h-3',
    'M8 8V5.5',
    'M16 8V5.5',
    'M8 16v2.5',
    'M16 16v2.5',
  ],
  'disc-data': [
    'M4 4v16h16',
    'M8 16v-4',
    'M12 16V9',
    'M16 16v-7',
  ],
  'disc-decision': [
    'M12 3v6',
    'M12 9l-5 5',
    'M12 9l5 5',
    'M7 14v3',
    'M17 14v3',
    'M7 17h.01',
    'M17 17h.01',
  ],
  'disc-consulting': [
    'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z',
    'M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  ],
  // Lucide `Cog` (v0.460, ISC) - the same gear Riviera uses for its menu
  // toggle. Outer ring + hub + eight radial teeth; 8-fold rotational
  // symmetry, so the 180° spin-on-open lands on an identical shape.
  cog: [
    'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
    'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    'M12 2v2',
    'M12 22v2',
    'm17 20.66-1-1.73',
    'M11 10.27 7 3.34',
    'm20.66 17-1.73-1',
    'm3.34 7 1.73 1',
    'M14 12h8',
    'M2 12h2',
    'm20.66 7-1.73 1',
    'm3.34 17 1.73-1',
    'm17 3.34-1 1.73',
    'm11 13.73-4 6.93',
  ],
}

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.5 }) {
  const d = PATHS[name]
  if (!d) return null
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}