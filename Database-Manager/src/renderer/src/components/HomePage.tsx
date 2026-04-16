const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }
const SANS: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" }

const QUICK_QUERIES = [
  "SELECT * FROM users",
  "SELECT COUNT(*) FROM orders WHERE status = 'pending'",
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables ORDER BY 3 DESC",
]

function HomePage({ onRunQuery }: { onRunQuery: (q: string) => void }) {
  const recentItems = [
    { sql: 'SELECT * FROM users LIMIT 50', rows: 50, ms: 22, slow: false },
    { sql: 'SELECT COUNT(*) FROM orders', rows: 1, ms: 14, slow: false },
    { sql: 'SELECT * FROM products WHERE price > 100 ORDER BY price DESC', rows: 312, ms: 187, slow: true },
  ]

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: 32 }}>
      <div className="flex flex-col gap-7">
        {/* Hero */}
        <div>
          <div style={{ ...MONO, fontSize: 10, color: '#2dd4bf', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
            Good evening
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 300, color: '#e8e8ec', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6, ...SANS }}>
            Ready to <strong style={{ fontWeight: 500 }}>query</strong>
          </h1>
          <p style={{ fontSize: 13, color: '#888896', lineHeight: 1.6, ...SANS }}>
            Connected to postgres @ localhost:4000 · 3 tables available
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Queries today', value: '24', color: '#2dd4bf' },
            { label: 'Avg response', value: '38ms', color: '#4ade80' },
            { label: 'Rows fetched', value: '14.2k', color: '#fbbf24' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-[10px] cursor-default"
              style={{ background: '#18181d', border: '1px solid rgba(255,255,255,0.07)', padding: 16 }}
            >
              <div style={{ fontSize: 11, color: '#50505f', marginBottom: 8, letterSpacing: '0.04em', ...SANS }}>{s.label}</div>
              <div style={{ ...MONO, fontSize: 22, fontWeight: 500, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick queries */}
        <div>
          <div style={{ fontSize: 11, color: '#50505f', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10, ...SANS }}>
            Quick queries
          </div>
          <div className="flex flex-col gap-1.5">
            {QUICK_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => onRunQuery(q)}
                className="flex items-center gap-3 w-full text-left transition-all duration-150 rounded-lg cursor-pointer"
                style={{
                  background: '#18181d',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '10px 14px',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(45,212,191,0.3)'
                  el.style.background = 'rgba(45,212,191,0.08)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.borderColor = 'rgba(255,255,255,0.07)'
                  el.style.background = '#18181d'
                }}
              >
                <span style={{ ...MONO, fontSize: 12, color: '#888896', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {q.length > 72 ? q.slice(0, 72) + '…' : q}
                </span>
                <span style={{ color: '#50505f', fontSize: 16 }}>›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent queries */}
        <div>
          <div style={{ fontSize: 11, color: '#50505f', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10, ...SANS }}>
            Recent queries
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Query', 'Rows', 'Time', 'Status'].map(h => (
                  <th key={h} style={{ fontSize: 10, color: '#50505f', fontWeight: 500, textAlign: 'left', padding: '0 12px 8px', letterSpacing: '0.06em', textTransform: 'uppercase', ...SANS }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentItems.map((r, i) => (
                <tr
                  key={i}
                  onClick={() => onRunQuery(r.sql)}
                  className="cursor-pointer transition-colors duration-100"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#18181d')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...MONO, fontSize: 11, color: '#e8e8ec', padding: '9px 12px', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.sql}
                  </td>
                  <td style={{ fontSize: 12, color: '#888896', padding: '9px 12px', ...SANS }}>{r.rows}</td>
                  <td style={{ fontSize: 12, color: '#888896', padding: '9px 12px', ...SANS }}>{r.ms}ms</td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                      fontSize: 10, ...MONO,
                      background: r.slow ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)',
                      color: r.slow ? '#fbbf24' : '#4ade80',
                    }}>
                      {r.slow ? 'slow' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HomePage