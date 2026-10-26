import useReveal from '../hooks/useReveal.js'
import { capabilities } from '../data/content.js'

/**
 * A small, abstract, data-driven chart. No photography - just the
 * signal. Supports a bar chart or a descending line, drawn from a
 * `data` array so each case study carries its own evidence shape.
 */
function MiniChart({ type, data }) {
  const w = 220
  const h = 72
  const pad = 4
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const stepX = (w - pad * 2) / (data.length - 1)

  const points = data.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (h - pad * 2) * (1 - (v - min) / span)
    return [x, y]
  })

  if (type === 'line') {
    const path = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(' ')
    const area = `${path} L${points[points.length - 1][0].toFixed(1)} ${h - pad} L${points[0][0].toFixed(1)} ${h - pad} Z`
    return (
      <svg className="chart" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
        <path d={area} fill="url(#chartFade)" opacity="0.35" />
        <path d={path} fill="none" stroke="var(--blue-600)" strokeWidth="1.5" />
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="2.5"
          fill="var(--blue-600)"
        />
        <defs>
          <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue-600)" />
            <stop offset="100%" stopColor="var(--blue-600)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  // bars
  const bw = (w - pad * 2) / data.length - 4
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      {points.map(([x, y], i) => (
        <rect
          key={i}
          x={x - bw / 2}
          y={y}
          width={bw}
          height={h - pad - y}
          fill={i === data.length - 1 ? 'var(--blue-600)' : 'var(--navy-600)'}
        />
      ))}
    </svg>
  )
}

function Case({ item, i }) {
  const ref = useReveal({ threshold: 0.12 })
  return (
    <article
      className="case reveal"
      ref={ref}
      style={{ transitionDelay: `${i * 70}ms` }}
    >
      <div className="case__index mono">{String(i + 1).padStart(2, '0')}</div>

      <div className="case__body">
        <span className="case__sector mono">{item.sector}</span>
        <h3 className="case__title">{item.title}</h3>
        <p className="case__desc">{item.description}</p>
        <div className="case__metric">
          <span className="case__metric-value">{item.metric}</span>
          <span className="case__metric-label mono">{item.metricLabel}</span>
        </div>
      </div>

      <div className="case__chart">
        <div className="chart-frame">
          <span className="corner corner--tl" aria-hidden="true" />
          <span className="corner corner--tr" aria-hidden="true" />
          <span className="corner corner--bl" aria-hidden="true" />
          <span className="corner corner--br" aria-hidden="true" />
          <MiniChart type={item.chart} data={item.data} />
        </div>
      </div>
    </article>
  )
}

export default function Capabilities() {
  const ref = useReveal()
  return (
    <section className="section cases" id="capabilities">
      <div className="container">
        <div className="cases__head section-head reveal" ref={ref}>
          <p className="eyebrow">Selected work</p>
          <h2 className="section-title">
            Where disparate systems and data became a single decision.
          </h2>
          <p className="section-lead">
            A sample of engagements where the engineering work and the
            decision it supported are inseparable.
          </p>
        </div>

        <div className="cases__list">
          {capabilities.map((c, i) => (
            <Case key={c.title} item={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}