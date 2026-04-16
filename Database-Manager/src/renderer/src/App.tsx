import { useEffect, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
type RowData = Record<string, string | number | boolean | null>
type Tab = 'home' | 'query' | 'settings'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getCellClass(val: unknown): string {
  if (val === null || val === undefined) return 'cell-null'
  if (typeof val === 'number') return 'cell-num'
  if (typeof val === 'boolean') return 'cell-bool'
  return 'cell-str'
}

function getCellDisplay(val: unknown): string {
  if (val === null || val === undefined) return 'null'
  return String(val)
}

const QUICK_QUERIES = [
  "SELECT * FROM users",
  "SELECT COUNT(*) FROM orders WHERE status = 'pending'",
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables ORDER BY 3 DESC",
]

// ─── Icons ────────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 6l6-4 6 4v8H2V6z" />
  </svg>
)
const QueryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="12" height="10" rx="2" />
    <path d="M5 6.5h6M5 9.5h4" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.6 3.6l1 1M11.4 11.4l1 1M12.4 3.6l-1 1M4.6 11.4l-1 1" />
  </svg>
)

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ position: 'relative', width: 38, height: 22, cursor: 'pointer', display: 'inline-block' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ display: 'none' }} />
      <span style={{
        display: 'block', width: 38, height: 22, borderRadius: 11,
        background: checked ? 'var(--accent)' : 'var(--bg4)',
        border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
        transition: 'background 0.2s',
      }} />
      <span style={{
        position: 'absolute', top: 3, left: 3,
        width: 16, height: 16, borderRadius: '50%',
        background: checked ? '#0c0c0e' : 'var(--text-muted)',
        transform: checked ? 'translateX(16px)' : 'translateX(0)',
        transition: 'transform 0.2s, background 0.2s',
        pointerEvents: 'none',
      }} />
    </label>
  )
}

function SettingsRow({ label, desc, control }: { label: string; desc?: string; control: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  )
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage({
  onRunQuery,
}: {
  onRunQuery: (q: string) => void
}) {
  const recentItems = [
    { sql: 'SELECT * FROM users LIMIT 50', rows: 50, ms: 22, slow: false },
    { sql: 'SELECT COUNT(*) FROM orders', rows: 1, ms: 14, slow: false },
    { sql: 'SELECT * FROM products WHERE price > 100 ORDER BY price DESC', rows: 312, ms: 187, slow: true },
  ]

  return (
    <div style={{ overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 28, flex: 1 }}>
      {/* Hero */}
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
          Good evening
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6 }}>
          Ready to <strong style={{ fontWeight: 500 }}>query</strong>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Connected to postgres @ localhost:4000 · 3 tables available
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Queries today', value: '24', color: 'var(--accent)' },
          { label: 'Avg response', value: '38ms', color: 'var(--green)' },
          { label: 'Rows fetched', value: '14.2k', color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16,
            cursor: 'default', transition: 'border-color 0.15s',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick queries */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10 }}>
          Quick queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {QUICK_QUERIES.map((q, i) => (
            <button key={i} onClick={() => onRunQuery(q)} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, background 0.15s',
              width: '100%',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,212,191,0.3)'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(45,212,191,0.08)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.background = 'var(--bg2)'
              }}
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {q.length > 72 ? q.slice(0, 72) + '…' : q}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent queries */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10 }}>
          Recent queries
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Query', 'Rows', 'Time', 'Status'].map(h => (
                <th key={h} style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, textAlign: 'left', padding: '0 12px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentItems.map((r, i) => (
              <tr key={i}
                onClick={() => onRunQuery(r.sql)}
                style={{ cursor: 'pointer', borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-primary)', padding: '9px 12px', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.sql}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '9px 12px' }}>{r.rows}</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '9px 12px' }}>{r.ms}ms</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                    fontSize: 10, fontFamily: 'var(--mono)',
                    background: r.slow ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)',
                    color: r.slow ? 'var(--amber)' : 'var(--green)',
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
  )
}

function QueryPage({
  initialQuery,
  onQueryRan,
}: {
  initialQuery: string
  onQueryRan: (q: string) => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<RowData[]>([])
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { if (initialQuery) setQuery(initialQuery) }, [initialQuery])

  const sendQuery = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    const t0 = Date.now()
    try {
      const res = await fetch('http://localhost:4000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const json = await res.json()
      const elapsed = Date.now() - t0
      const data: RowData[] = json.rows || []
      setQueryTime(elapsed)
      setRowCount(data.length)
      if (data.length === 0) { setColumns([]); setRows([]); return }
      setColumns(Object.keys(data[0]))
      setRows(data)
      setHistory(h => [q, ...h.filter(x => x !== q)].slice(0, 20))
      setHistoryIdx(-1)
      onQueryRan(q)
    } catch {
      setError('connection refused — is the server running on :4000?')
      setColumns([]); setRows([]); setRowCount(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { sendQuery(query); return }
    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault()
      const idx = Math.min(historyIdx + 1, history.length - 1)
      setHistoryIdx(idx); setQuery(history[idx])
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = historyIdx - 1
      if (idx < 0) { setHistoryIdx(-1); setQuery(''); return }
      setHistoryIdx(idx); setQuery(history[idx])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Query bar */}
      <div style={{ flexShrink: 0, padding: '10px 14px', background: 'var(--bg1)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 14px',
        }}
          onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,212,191,0.3)'}
          onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
        >
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em', flexShrink: 0 }}>SQL</span>
          <div style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="SELECT * FROM users LIMIT 50"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--text-primary)',
              padding: '10px 0', caretColor: 'var(--accent)',
            }}
          />
          {loading && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)', flexShrink: 0 }}>running…</span>
          )}
        </div>
        <button
          onClick={() => sendQuery(query)}
          disabled={loading}
          style={{
            flexShrink: 0, background: 'var(--accent)', color: '#0c0c0e',
            border: 'none', borderRadius: 7, padding: '9px 20px',
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.4 : 1, transition: 'opacity 0.15s',
          }}
        >
          {loading ? '…' : 'Run ↵'}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* History sidebar */}
        {history.length > 0 && (
          <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px 8px', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 500, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              History
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {history.map((h, i) => (
                <button key={i} onClick={() => { setQuery(h); inputRef.current?.focus() }}
                  style={{
                    display: 'block', width: '100%', padding: '9px 14px',
                    fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)',
                    background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    transition: 'color 0.1s, background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'rgba(45,212,191,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none' }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {error && (
            <div style={{ margin: 14, padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>✕</span>{error}
            </div>
          )}

          {!error && columns.length === 0 && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.4}>
                  <rect x="2" y="2" width="14" height="14" rx="3" /><path d="M5 7h8M5 11h5" />
                </svg>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {rowCount === 0 ? 'query returned no rows' : 'run a query to see results'}
              </span>
              {rowCount === 0 && queryTime !== null && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{queryTime}ms</span>
              )}
            </div>
          )}

          {columns.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--bg1)', position: 'sticky', top: 0, zIndex: 2 }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 400, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', width: 48, borderRight: '1px solid var(--border)', fontSize: 11 }}>#</th>
                    {columns.map(col => (
                      <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 400, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 11, letterSpacing: '0.03em' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '8px 16px', fontFamily: 'var(--mono)', color: 'var(--text-muted)', borderRight: '1px solid var(--border)', fontSize: 11 }}>{i + 1}</td>
                      {columns.map(col => {
                        const val = row[col] === '' ? null : row[col]
                        return (
                          <td key={col} style={{ padding: '8px 16px', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}
                            className={getCellClass(val)}
                          >
                            {getCellDisplay(val)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ flexShrink: 0, height: 26, borderTop: '1px solid var(--border)', background: 'var(--bg1)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16 }}>
        {rowCount !== null && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{rowCount.toLocaleString()} row{rowCount !== 1 ? 's' : ''}</span>}
        {queryTime !== null && <><div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.4 }} /><span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>{queryTime}ms</span></>}
        {columns.length > 0 && <><div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.4 }} /><span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>{columns.length} col{columns.length !== 1 ? 's' : ''}</span></>}
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--bg4)', marginLeft: 'auto' }}>localhost:4000</span>
      </div>
    </div>
  )
}

function SettingsPage() {
  const [autoRun, setAutoRun] = useState(true)
  const [showRowNums, setShowRowNums] = useState(true)
  const [highlightNull, setHighlightNull] = useState(true)

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7,
    color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 12,
    padding: '7px 28px 7px 10px', cursor: 'pointer', outline: 'none', minWidth: 120,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7,
    color: 'var(--text-primary)', fontFamily: 'var(--mono)', fontSize: 12,
    padding: '7px 12px', outline: 'none', width: 220,
  }

  const btnStyle: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7,
    color: 'var(--text-primary)', fontFamily: 'var(--sans)', fontSize: 12,
    padding: '7px 16px', cursor: 'pointer',
  }

  const kbdStyle: React.CSSProperties = {
    display: 'inline-block', background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-secondary)', padding: '2px 6px',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em',
    textTransform: 'uppercase', fontWeight: 500, marginBottom: 12,
    paddingBottom: 8, borderBottom: '1px solid var(--border)',
  }

  return (
    <div style={{ overflowY: 'auto', padding: '28px 32px', flex: 1 }}>

      {/* Connection */}
      <div style={{ marginBottom: 32 }}>
        <div style={sectionTitleStyle}>Connection</div>
        <SettingsRow label="Server URL" desc="The backend query endpoint"
          control={<input style={inputStyle} defaultValue="http://localhost:4000/query" />}
        />
        <SettingsRow label="Status" desc="Current connection state"
          control={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
              connected
            </div>
          }
        />
        <SettingsRow label="Reconnect" desc="Test and re-establish the connection"
          control={<button style={btnStyle}>Test connection</button>}
        />
      </div>

      {/* Editor */}
      <div style={{ marginBottom: 32 }}>
        <div style={sectionTitleStyle}>Editor</div>
        <SettingsRow label="Row limit" desc="Maximum rows returned per query"
          control={<select style={selectStyle}><option>100</option><option defaultValue="500">500</option><option>1000</option><option>5000</option><option>Unlimited</option></select>}
        />
        <SettingsRow label="Query timeout" desc="Cancel queries exceeding this duration"
          control={<select style={selectStyle}><option>5s</option><option>30s</option><option>60s</option><option>None</option></select>}
        />
        <SettingsRow label="Font size" desc="Results table and editor font size"
          control={<select style={selectStyle}><option>11px</option><option>12px</option><option>13px</option><option>14px</option></select>}
        />
        <SettingsRow label="Auto-run on ↵" desc="Execute query when Enter is pressed"
          control={<Toggle checked={autoRun} onChange={setAutoRun} />}
        />
      </div>

      {/* Display */}
      <div style={{ marginBottom: 32 }}>
        <div style={sectionTitleStyle}>Display</div>
        <SettingsRow label="Show row numbers" desc="Display row index in results"
          control={<Toggle checked={showRowNums} onChange={setShowRowNums} />}
        />
        <SettingsRow label="Highlight null values" desc="Show null cells in muted italic style"
          control={<Toggle checked={highlightNull} onChange={setHighlightNull} />}
        />
        <SettingsRow label="Query history limit" desc="Number of past queries to retain"
          control={<select style={selectStyle}><option>10</option><option>20</option><option>50</option><option>100</option></select>}
        />
      </div>

      {/* Shortcuts */}
      <div style={{ marginBottom: 32 }}>
        <div style={sectionTitleStyle}>Keyboard shortcuts</div>
        <SettingsRow label="Run query" control={<span style={kbdStyle}>↵</span>} />
        <SettingsRow label="Previous query" control={<span style={kbdStyle}>↑</span>} />
        <SettingsRow label="Next query" control={<span style={kbdStyle}>↓</span>} />
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg0: #0c0c0e;
    --bg1: #111115;
    --bg2: #18181d;
    --bg3: #1f1f26;
    --bg4: #26262f;
    --border: rgba(255,255,255,0.07);
    --border-strong: rgba(255,255,255,0.12);
    --text-primary: #e8e8ec;
    --text-secondary: #888896;
    --text-muted: #50505f;
    --accent: #2dd4bf;
    --accent-dim: rgba(45,212,191,0.12);
    --accent-border: rgba(45,212,191,0.3);
    --green: #4ade80;
    --amber: #fbbf24;
    --red: #f87171;
    --blue: #60a5fa;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'DM Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg0); font-family: var(--sans); }

  .cell-null { color: var(--text-muted) !important; font-style: italic; }
  .cell-num  { color: var(--green) !important; }
  .cell-bool { color: var(--blue) !important; }
  .cell-str  { color: var(--text-primary) !important; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
`

export default function App(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('home')
  const [pendingQuery, setPendingQuery] = useState('')

  const handleRunQuery = (q: string) => {
    setPendingQuery(q)
    setTab('query')
  }

  const tabs: { id: Tab; label: string; Icon: React.FC }[] = [
    { id: 'home', label: 'Home', Icon: HomeIcon },
    { id: 'query', label: 'Query', Icon: QueryIcon },
    { id: 'settings', label: 'Settings', Icon: SettingsIcon },
  ]

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100vh', width: '100%',
        background: 'var(--bg0)', color: 'var(--text-primary)',
        fontFamily: 'var(--sans)', overflow: 'hidden',
      }}>
        {/* Title bar */}
        <div style={{ height: 40, background: 'var(--bg1)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0, WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <div style={{ display: 'flex', gap: 6, WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {['#ff5f57', '#febc2e', '#28c840'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', margin: '0 auto' }}>
            querykit
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>localhost:4000</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ height: 44, background: 'var(--bg1)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', padding: '0 12px', gap: 2, flexShrink: 0 }}>
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px',
              fontSize: 13, fontWeight: 400, color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer', border: 'none', background: 'none',
              borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s', fontFamily: 'var(--sans)',
              position: 'relative', top: 1,
            }}>
              <span style={{ opacity: tab === id ? 1 : 0.6 }}><Icon /></span>
              {label}
            </button>
          ))}
        </div>

        {/* Pages */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'home' && <HomePage onRunQuery={handleRunQuery} />}
          {tab === 'query' && <QueryPage initialQuery={pendingQuery} onQueryRan={() => {}} />}
          {tab === 'settings' && <SettingsPage />}
        </div>
      </div>
    </>
  )
}