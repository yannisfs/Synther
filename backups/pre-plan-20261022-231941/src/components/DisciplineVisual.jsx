// Data-driven inline-SVG "schematic" rendered behind each discipline hero.
// No raster images: every visual is generated from geometry keyed by the
// discipline id, extending the small discipline glyphs in Icon.jsx into a
// full-bleed hero motif. Decorative only — the caller wraps it in an
// aria-hidden layer. stroke = currentColor, so the hero CSS controls hue
// and opacity; the canvas is 640 x 440 and anchored right (xMaxYMid slice)
// so the motif emerges from under the left-aligned text.
//
// The geometry is deliberately abstract and technical (hub-and-spoke, flow
// ring, chip, chart, branch tree, lens) to match Synther's datasheet
// aesthetic. No faux metrics, no fabricated diagrams — just the structural
// idea of each discipline.

const W = 640
const H = 440

// Faint engineering grid — the common base layer for every motif.
function Grid() {
  const cols = Array.from({ length: Math.ceil(W / 40) + 1 })
  const rows = Array.from({ length: Math.ceil(H / 40) + 1 })
  return (
    <g stroke="currentColor" strokeWidth="0.5" opacity="0.16">
      {cols.map((_, i) => (
        <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2={H} />
      ))}
      {rows.map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 40} x2={W} y2={i * 40} />
      ))}
    </g>
  )
}

// Small filled node helper.
function Node({ x, y, r = 5 }) {
  return <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />
}

const MOTIFS = {
  // Systems engineering — hub-and-spoke network: a central node linked to
  // six satellites, ringed by two orbits. The "interfaces carry the risk"
  // idea drawn as a connected system.
  'systems-engineering': () => {
    const cx = 430
    const cy = 220
    const R = 150
    const angles = [-90, -30, 30, 90, 150, 210]
    const nodes = angles.map((a) => ({
      x: cx + R * Math.cos((a * Math.PI) / 180),
      y: cy + R * Math.sin((a * Math.PI) / 180),
    }))
    return (
      <g>
        <circle cx={cx} cy={cy} r={70} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" opacity="0.6" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        {nodes.map((n, i) => (
          <line key={`l${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="currentColor" strokeWidth="1.1" opacity="0.7" />
        ))}
        {nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length]
          return (
            <line key={`e${i}`} x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
          )
        })}
        {nodes.map((n, i) => (
          <Node key={`n${i}`} x={n.x} y={n.y} r={5} />
        ))}
        <Node x={cx} y={cy} r={8} />
      </g>
    )
  },

  // Process optimization — a circular flow: four stage nodes on a ring with
  // directional arcs, an inner orbit. Continuous improvement as a loop.
  'process-optimization': () => {
    const cx = 430
    const cy = 220
    const R = 140
    const stages = [
      { x: cx, y: cy - R },
      { x: cx + R, y: cy },
      { x: cx, y: cy + R },
      { x: cx - R, y: cy },
    ]
    return (
      <g>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
        <circle cx={cx} cy={cy} r={70} fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.5" />
        {/* Directional chevrons along the ring */}
        {stages.map((s, i) => {
          const a = (i * 90 + 45) * Math.PI / 180
          const px = cx + R * Math.cos(a)
          const py = cy + R * Math.sin(a)
          const rot = (i * 90 + 135)
          return (
            <path
              key={`c${i}`}
              d="M -7 -5 L 0 0 L -7 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              opacity="0.8"
              transform={`translate(${px} ${py}) rotate(${rot})`}
            />
          )
        })}
        {stages.map((s, i) => (
          <Node key={`s${i}`} x={s.x} y={s.y} r={6} />
        ))}
        <Node x={cx} y={cy} r={5} />
      </g>
    )
  },

  // Development — a chip die with pin traces radiating out, vias at the
  // corners, an internal trace. The build artifact itself.
  development: () => {
    const x = 370
    const y = 150
    const s = 120
    const cx = x + s / 2
    const cy = y + s / 2
    const pins = [
      { x1: cx, y1: y, x2: cx, y2: y - 60 },
      { x1: x + s, y1: cy, x2: x + s + 60, y2: cy },
      { x1: cx, y1: y + s, x2: cx, y2: y + s + 60 },
      { x1: x, y1: cy, x2: x - 60, y2: cy },
      { x1: x, y1: y, x2: x - 40, y2: y - 40 },
      { x1: x + s, y1: y, x2: x + s + 40, y2: y - 40 },
      { x1: x, y1: y + s, x2: x - 40, y2: y + s + 40 },
      { x1: x + s, y1: y + s, x2: x + s + 40, y2: y + s + 40 },
    ]
    return (
      <g>
        <rect x={x} y={y} width={s} height={s} rx="3" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.8" />
        <rect x={x + 18} y={y + 18} width={s - 36} height={s - 36} rx="2" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        {pins.map((p, i) => (
          <line key={`p${i}`} {...p} stroke="currentColor" strokeWidth="1.1" opacity="0.65" />
        ))}
        {pins.map((p, i) => (
          <Node key={`pd${i}`} x={p.x2} y={p.y2} r={3.5} />
        ))}
        {/* Internal trace */}
        <path d={`M ${x + 30} ${cy} L ${cx} ${cy} L ${cx} ${y + 30}`} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <Node x={cx} y={cy} r={4} />
      </g>
    )
  },

  // Data & analytics — axes, a bar series, a trend line and scatter points.
  'data-analytics': () => {
    const baseY = 330
    const left = 300
    const bars = [120, 90, 150, 110, 170]
    const bw = 26
    const gap = 22
    const tops = bars.map((h, i) => ({
      x: left + 40 + i * (bw + gap) + bw / 2,
      y: baseY - h,
    }))
    return (
      <g>
        <line x1={left} y1={baseY} x2={left + 320} y2={baseY} stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
        <line x1={left} y1={90} x2={left} y2={baseY} stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
        {bars.map((h, i) => {
          const bx = left + 40 + i * (bw + gap)
          return (
            <rect key={`b${i}`} x={bx} y={baseY - h} width={bw} height={h} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
          )
        })}
        <polyline
          points={tops.map((t) => `${t.x},${t.y}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity="0.85"
        />
        {tops.map((t, i) => (
          <Node key={`t${i}`} x={t.x} y={t.y} r={4} />
        ))}
        {/* Axis ticks */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`tk${i}`} x1={left - 6} y1={90 + i * 60} x2={left} y2={90 + i * 60} stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        ))}
      </g>
    )
  },

  // Decision-making — a branching tree from a root through two levels to
  // four leaves. The cost-of-each-path idea as a decision structure.
  'decision-making': () => {
    const root = { x: 300, y: 320 }
    const mid = [{ x: 410, y: 210 }, { x: 410, y: 300 }]
    const leaves = [
      { x: 520, y: 130 },
      { x: 540, y: 230 },
      { x: 520, y: 300 },
      { x: 540, y: 370 },
    ]
    const branches = [
      [root, mid[0]],
      [root, mid[1]],
      [mid[0], leaves[0]],
      [mid[0], leaves[1]],
      [mid[1], leaves[2]],
      [mid[1], leaves[3]],
    ]
    return (
      <g>
        {branches.map((b, i) => (
          <line key={`b${i}`} x1={b[0].x} y1={b[0].y} x2={b[1].x} y2={b[1].y} stroke="currentColor" strokeWidth="1.1" opacity="0.65" />
        ))}
        <Node x={root.x} y={root.y} r={7} />
        {mid.map((m, i) => (
          <Node key={`m${i}`} x={m.x} y={m.y} r={5} />
        ))}
        {leaves.map((l, i) => (
          <Node key={`l${i}`} x={l.x} y={l.y} r={4} />
        ))}
      </g>
    )
  },

  // Consulting — a lens / aperture: concentric rings, a focal cross, a scan
  // line. The focused, independent-review idea as optics.
  consulting: () => {
    const cx = 430
    const cy = 220
    return (
      <g>
        <circle cx={cx} cy={cy} r={140} fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        <circle cx={cx} cy={cy} r={100} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx={cx} cy={cy} r={60} fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
        {/* Aperture blades */}
        {[0, 60, 120, 180, 240, 300].map((a, i) => {
          const rad = (a * Math.PI) / 180
          const x1 = cx + 60 * Math.cos(rad)
          const y1 = cy + 60 * Math.sin(rad)
          const x2 = cx + 100 * Math.cos(rad + 0.5)
          const y2 = cy + 100 * Math.sin(rad + 0.5)
          return (
            <line key={`ab${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.5" />
          )
        })}
        {/* Focal cross */}
        <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
        <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
        {/* Scan line */}
        <line x1={cx - 140} y1={cy - 30} x2={cx - 70} y2={cy - 30} stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1={cx + 70} y1={cy - 30} x2={cx + 140} y2={cy - 30} stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <Node x={cx} y={cy} r={4} />
      </g>
    )
  },
}

export default function DisciplineVisual({ id }) {
  const render = MOTIFS[id] || MOTIFS['systems-engineering']
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMid slice"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Grid />
      {render()}
    </svg>
  )
}