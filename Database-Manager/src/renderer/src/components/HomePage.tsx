import { SANS, MONO, c, r } from './theme'

const QUICK_QUERIES = [
  "SELECT * FROM users",
]

type Query = {
  query: string
  timeInMs: number
  rowCount: number
  slow?: boolean
}

type HomePageProps = {
  onRunQuery: (q: string) => void
  queries: Query[]
}

function HomePage({ onRunQuery, queries}: HomePageProps) {
  const hour = new Date().getHours()
  const greeting =
    hour < 5 ? 'Good night' :
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' : 'Good evening'

  const totalQueries = queries.length
  const avgMs = totalQueries > 0
    ? (queries.reduce((s, q) => s + q.timeInMs, 0) / totalQueries).toFixed(1)
    : '—'
  const totalRows = queries.reduce((s, q) => s + q.rowCount, 0)

  const stats = [
    { label: 'Queries',   value: totalQueries.toString(), unit: 'session' },
    { label: 'Avg. time', value: avgMs,                   unit: 'ms' },
    { label: 'Rows',      value: totalRows.toLocaleString(), unit: 'fetched' },
  ]

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: c.bg }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 40px 64px' }}>

        {/* Hero ---------------------------------------------------------- */}
        <header style={{ marginBottom: 40 }}>
          <div style={{
            ...MONO, fontSize: 10.5, color: c.textFaint,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: c.accent, boxShadow: `0 0 8px ${c.accentSoft}`,
            }} />
            {greeting}
          </div>
          <h1 style={{
            ...SANS, fontSize: 30, fontWeight: 300, color: c.text,
            letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0,
          }}>
            Ready to <span style={{ fontWeight: 500, color: c.accent }}>query</span>.
          </h1>
          <p style={{
            ...SANS, fontSize: 13.5, color: c.textDim,
            margin: '10px 0 0', lineHeight: 1.5,
          }}>
            Pick up where you left off, or start something new.
          </p>
        </header>

        {/* Stats --------------------------------------------------------- */}
        <section style={{ marginBottom: 40 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            border: `1px solid ${c.border}`, borderRadius: r.md,
            background: c.surface, overflow: 'hidden',
          }}>
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: '18px 20px',
                  borderLeft: i === 0 ? 'none' : `1px solid ${c.border}`,
                }}
              >
                <div style={{
                  ...SANS, fontSize: 10.5, color: c.textFaint,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  {s.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ ...MONO, fontSize: 22, fontWeight: 500, color: c.text, letterSpacing: '-0.02em' }}>
                    {s.value}
                  </span>
                  <span style={{ ...MONO, fontSize: 11, color: c.textFaint }}>
                    {s.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick queries ------------------------------------------------- */}
        <section style={{ marginBottom: 40 }}>
          <SectionLabel>Quick queries</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {QUICK_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => onRunQuery(q)}
                className="cursor-pointer transition-colors duration-150"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', textAlign: 'left',
                  background: c.surface, border: `1px solid ${c.border}`,
                  borderRadius: r.sm, padding: '11px 14px',
                  color: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = c.accentSoft
                  e.currentTarget.style.background = c.accentDim
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = c.border
                  e.currentTarget.style.background = c.surface
                }}
              >
                <span style={{
                  ...MONO, fontSize: 10, color: c.accent,
                  letterSpacing: '0.1em', flexShrink: 0,
                }}>
                  SQL
                </span>
                <span style={{
                  ...MONO, fontSize: 12.5, color: c.text,
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {q}
                </span>
                <span style={{ ...MONO, fontSize: 11, color: c.textFaint, flexShrink: 0 }}>
                  ↵
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Recent queries ------------------------------------------------ */}
        <section>
          <SectionLabel count={queries.length}>Recent queries</SectionLabel>

          {queries.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{
              border: `1px solid ${c.border}`, borderRadius: r.md,
              background: c.surface, overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Query', 'Rows', 'Time', 'Status'].map((h, i) => (
                      <th key={h} style={{
                        ...SANS, fontSize: 10.5, color: c.textFaint,
                        fontWeight: 500, textAlign: i === 0 ? 'left' : 'right',
                        padding: '11px 16px',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        borderBottom: `1px solid ${c.border}`,
                        width: i === 0 ? 'auto' : i === 3 ? 80 : 90,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queries.map((row, i) => (
                    <tr
                      key={i}
                      onClick={() => onRunQuery(row.query)}
                      className="cursor-pointer transition-colors duration-100"
                      style={{
                        borderTop: i === 0 ? 'none' : `1px solid ${c.border}`,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = c.surface2)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{
                        ...MONO, fontSize: 12, color: c.text,
                        padding: '11px 16px',
                        maxWidth: 340,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {row.query}
                      </td>
                      <td style={{
                        ...MONO, fontSize: 12, color: c.textDim,
                        padding: '11px 16px', textAlign: 'right',
                      }}>
                        {row.rowCount.toLocaleString()}
                      </td>
                      <td style={{
                        ...MONO, fontSize: 12, color: c.textDim,
                        padding: '11px 16px', textAlign: 'right',
                      }}>
                        {row.timeInMs}<span style={{ color: c.textFaint }}>ms</span>
                      </td>
                      <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                        <StatusPill slow={!!row.slow} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/* --- tiny internals ------------------------------------------------- */

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 14,
    }}>
      <span style={{
        ...SANS, fontSize: 10.5, color: c.textFaint,
        letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
      }}>
        {children}
      </span>
      {count !== undefined && (
        <span style={{
          ...MONO, fontSize: 10, color: c.textFaint,
          padding: '1px 7px', border: `1px solid ${c.border}`, borderRadius: 4,
        }}>
          {count}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: c.border }} />
    </div>
  )
}

function StatusPill({ slow }: { slow: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 4,
      ...MONO, fontSize: 10, letterSpacing: '0.02em',
      background: slow ? c.warnDim : c.okDim,
      color: slow ? c.warn : c.ok,
      border: `1px solid ${slow ? 'rgba(229,185,92,0.2)' : 'rgba(106,212,143,0.2)'}`,
    }}>
      <span style={{
        width: 4, height: 4, borderRadius: '50%',
        background: slow ? c.warn : c.ok,
      }} />
      {slow ? 'slow' : 'ok'}
    </span>
  )
}

function EmptyState() {
  return (
    <div style={{
      border: `1px dashed ${c.border}`, borderRadius: r.md,
      padding: '36px 24px', textAlign: 'center',
      background: c.surface,
    }}>
      <div style={{
        ...SANS, fontSize: 13, color: c.textDim, marginBottom: 4,
      }}>
        No queries yet.
      </div>
      <div style={{
        ...MONO, fontSize: 11, color: c.textFaint,
      }}>
        Run your first query to see it here.
      </div>
    </div>
  )
}

export default HomePage