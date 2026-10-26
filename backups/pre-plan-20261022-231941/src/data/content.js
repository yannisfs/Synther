// Structural (non-text) data for Synther. All user-facing copy lives in
// src/locales/en.json and is read via react-i18next's t(). This file keeps
// only ids, hrefs, icon names, numeric values and the contact email — the
// things that are not translated.

export const company = {
  email: 'contact@synther.eu',
}

export const nav = [
  { key: 'offerings', href: '#offerings' },
  { key: 'approach', href: '#approach' },
  { key: 'help', href: '/help' },
]

export const stats = [
  { key: 'systems', value: '40+' },
  { key: 'sectors', value: '12' },
  { key: 'efficiency', value: '3.2×' },
  { key: 'uptime', value: '99.95%' },
]

export const offerings = [
  { id: 'systems-engineering', icon: 'disc-systems' },
  { id: 'process-optimization', icon: 'disc-process' },
  { id: 'development', icon: 'disc-development' },
  { id: 'data-analytics', icon: 'disc-data' },
  { id: 'decision-making', icon: 'disc-decision' },
  { id: 'consulting', icon: 'disc-consulting' },
]

// Labeled key/value strip at the foot of the hero - a structured "spec sheet"
// rather than a tagline eyebrow. Text comes from locales.heroMeta.<key>.
export const heroMeta = [{ key: 'disciplines' }]

// Contact "direct" sidebar rows. The email value is data (an address, not
// translatable prose); region/response values come from the locale.
export const contactDirect = [
  { icon: 'mail', key: 'email', href: `mailto:${company.email}` },
  { icon: 'pin', key: 'region' },
  { icon: 'clock', key: 'response' },
]

// Project-type option keys for the contact form select. Labels come from
// locales.contact.projectTypes.<key>.
export const projectTypes = [
  'systems-engineering',
  'process-optimization',
  'development',
  'data-analytics',
  'decision-making',
  'consulting',
  'other',
]

export const approach = [
  { step: '01' },
  { step: '02' },
  { step: '03' },
  { step: '04' },
  { step: '05' },
  { step: '06' },
]

// Currently unused: the Capabilities section is not rendered. Kept as
// data-only (chart values are not localised copy).
export const capabilities = [
  {
    title: 'Convergent control system',
    sector: 'Industrial automation',
    description:
      'Model-based setpoint optimization across a multi-stage production line, replacing manual tuning with a closed-loop controller that converges on the globally optimal operating point.',
    metric: '+18%',
    metricLabel: 'line throughput',
    chart: 'bars',
    data: [42, 38, 46, 41, 52, 49, 58, 63, 67],
  },
  {
    title: 'Telemetry analytics platform',
    sector: 'Energy infrastructure',
    description:
      'Real-time anomaly detection across a 2,400-node grid. Statistical models separate signal from drift, surfacing failures before they cascade.',
    metric: '−63%',
    metricLabel: 'unplanned downtime',
    chart: 'line',
    data: [88, 81, 76, 72, 61, 54, 47, 39, 33],
  },
  {
    title: 'Decision intelligence layer',
    sector: 'Manufacturing operations',
    description:
      'Scenario modelling that quantifies the downstream cost of every operational decision, giving leadership an evidence base for working-capital allocation.',
    metric: '€4.1M',
    metricLabel: 'exposure removed / quarter',
    chart: 'bars',
    data: [12, 18, 15, 24, 31, 28, 39, 44, 41],
  },
  {
    title: 'Special-purpose machine platform',
    sector: 'Mechanical engineering',
    description:
      'A custom production machine designed from first principles - mechanical, mechatronic and control engineering in one loop, validated against real production conditions before hand-off.',
    metric: '−38%',
    metricLabel: 'cycle time per part',
    chart: 'bars',
    data: [62, 58, 54, 49, 47, 43, 41, 39, 38],
  },
]