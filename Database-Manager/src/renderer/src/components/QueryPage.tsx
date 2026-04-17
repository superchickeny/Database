import { useEffect, useRef, useState } from "react"
import { SANS, MONO, c, r } from './theme'

type RowData = Record<string, string | number | boolean | null>

type QueryPageProps = {
  initialQuery: string
  onQueryRan: (query: string, timeInMs: number, rowsReturned: number) => void
  url: string
}

function QueryPage({ initialQuery, onQueryRan, url }: QueryPageProps) {
  const [query, setQuery] = useState(initialQuery)
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<RowData[]>([])
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [inputFocused, setInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { if (initialQuery) setQuery(initialQuery) }, [initialQuery])

  const sendQuery = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    const t0 = Date.now()
    try {
      const res = await fetch(url, {
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
      setColumns(Object.keys(data[0]).reverse())
      setRows(data)
      setHistory(h => [q, ...h.filter(x => x !== q)].slice(0, 20))
      setHistoryIdx(-1)
      onQueryRan(q, elapsed, data.length)
    } catch {
      setError('Connection refused — is the server running on :4000?')
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
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: c.bg }}>

      {/* Query bar -------------------------------------------------------- */}
      <div
        className="flex items-center gap-2 shrink-0"
        style={{
          padding: '12px 16px',
          background: c.bg,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <div
          className="flex-1 flex items-center gap-3"
          style={{
            background: c.surface,
            border: `1px solid ${inputFocused ? c.accentSoft : c.border}`,
            borderRadius: r.sm,
            padding: '0 14px',
            transition: 'border-color 150ms',
            boxShadow: inputFocused ? `0 0 0 3px ${c.accentDim}` : 'none',
          }}
        >
          <span style={{
            ...MONO, fontSize: 10, color: c.accent,
            letterSpacing: '0.12em', flexShrink: 0, fontWeight: 500,
          }}>
            SQL
          </span>
          <div style={{ width: 1, height: 14, background: c.border, flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="SELECT * FROM users LIMIT 50"
            spellCheck={false}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              ...MONO, fontSize: 12.5, color: c.text,
              padding: '10px 0', caretColor: c.accent,
            }}
          />
          {loading && (
            <span style={{
              ...MONO, fontSize: 10.5, color: c.textFaint,
              flexShrink: 0, letterSpacing: '0.04em',
            }}>
              running…
            </span>
          )}
        </div>
        <button
          onClick={() => sendQuery(query)}
          disabled={loading}
          className="shrink-0 cursor-pointer disabled:cursor-not-allowed transition-opacity duration-150"
          style={{
            background: c.accent, color: c.bg,
            border: 'none', borderRadius: r.sm,
            padding: '9px 18px',
            ...SANS, fontSize: 12.5, fontWeight: 600,
            letterSpacing: '0.01em',
            opacity: loading ? 0.4 : 1,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          Run
          <span style={{ ...MONO, fontSize: 10, opacity: 0.65 }}>↵</span>
        </button>
      </div>

      {/* Body ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">

        {/* History sidebar */}
        {history.length > 0 && (
          <div
            className="flex flex-col overflow-hidden shrink-0"
            style={{
              width: 220,
              borderRight: `1px solid ${c.border}`,
              background: c.bg,
            }}
          >
            <div style={{
              padding: '14px 16px 10px',
              ...SANS, fontSize: 10.5, color: c.textFaint,
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
              borderBottom: `1px solid ${c.border}`,
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>History</span>
              <span style={{
                ...MONO, fontSize: 10, letterSpacing: 0,
                color: c.textFaint,
                padding: '1px 6px', border: `1px solid ${c.border}`, borderRadius: 4,
              }}>
                {history.length}
              </span>
            </div>
            <div className="overflow-y-auto flex-1">
              {history.map((h, i) => {
                const active = query === h
                return (
                  <button
                    key={i}
                    onClick={() => { setQuery(h); inputRef.current?.focus() }}
                    className="block w-full text-left cursor-pointer transition-colors duration-100"
                    style={{
                      padding: '9px 16px',
                      ...MONO, fontSize: 11, color: active ? c.accent : c.textDim,
                      background: active ? c.accentDim : 'none',
                      border: 'none',
                      borderLeft: `2px solid ${active ? c.accent : 'transparent'}`,
                      borderBottom: `1px solid ${c.border}`,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                    onMouseEnter={e => {
                      if (active) return
                      e.currentTarget.style.color = c.text
                      e.currentTarget.style.background = c.surface
                    }}
                    onMouseLeave={e => {
                      if (active) return
                      e.currentTarget.style.color = c.textDim
                      e.currentTarget.style.background = 'none'
                    }}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-auto flex flex-col">
          {error && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                margin: 16, padding: '12px 14px',
                background: c.errDim, border: `1px solid rgba(239,107,107,0.18)`,
                borderRadius: r.sm,
                ...MONO, fontSize: 12, color: c.err,
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'rgba(239,107,107,0.15)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, flexShrink: 0,
              }}>✕</span>
              {error}
            </div>
          )}

          {!error && columns.length === 0 && !loading && (
            <EmptyResults rowCount={rowCount} queryTime={queryTime} />
          )}

          {columns.length > 0 && (
            <ResultsTable columns={columns} rows={rows} />
          )}
        </div>
      </div>

      {/* Status bar ------------------------------------------------------- */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: 28,
          borderTop: `1px solid ${c.border}`,
          background: c.bg,
          padding: '0 16px',
          gap: 16,
        }}
      >
        {rowCount !== null && (
          <StatusItem label="rows" value={rowCount.toLocaleString()} />
        )}
        {queryTime !== null && (
          <StatusItem label="time" value={`${queryTime}ms`} />
        )}
        {columns.length > 0 && (
          <StatusItem label="cols" value={columns.length.toString()} />
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: error ? c.err : c.ok,
            boxShadow: error ? 'none' : `0 0 6px rgba(106,212,143,0.4)`,
          }} />
          <span style={{ ...MONO, fontSize: 10, color: c.textFaint }}>
            {url.replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>
    </div>
  )
}

/* --- internals ------------------------------------------------------- */

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
      <span style={{ ...MONO, fontSize: 10, color: c.textFaint, letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ ...MONO, fontSize: 10.5, color: c.textDim }}>
        {value}
      </span>
    </div>
  )
}

function EmptyResults({ rowCount, queryTime }: { rowCount: number | null; queryTime: number | null }) {
  const noResults = rowCount === 0
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ padding: 40 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        border: `1px solid ${c.border}`,
        background: c.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={c.textFaint} strokeWidth="1.3">
          <rect x="2.5" y="2.5" width="13" height="13" rx="2.5" />
          <path d="M5.5 7.5h7M5.5 10.5h4.5" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...SANS, fontSize: 13, color: c.textDim, marginBottom: 4 }}>
          {noResults ? 'Query returned no rows.' : 'Run a query to see results.'}
        </div>
        {noResults && queryTime !== null && (
          <div style={{ ...MONO, fontSize: 11, color: c.textFaint }}>
            Completed in {queryTime}ms
          </div>
        )}
      </div>
    </div>
  )
}

function ResultsTable({ columns, rows }: { columns: string[]; rows: RowData[] }) {
  return (
    <div className="overflow-x-auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: c.bg, position: 'sticky', top: 0, zIndex: 2 }}>
            <th style={{
              padding: '10px 14px', textAlign: 'right',
              ...SANS, fontSize: 10.5, fontWeight: 500, color: c.textFaint,
              borderBottom: `1px solid ${c.borderStrong}`,
              borderRight: `1px solid ${c.border}`,
              width: 52,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              #
            </th>
            {columns.map(col => (
              <th key={col} style={{
                padding: '10px 16px', textAlign: 'left',
                ...SANS, fontSize: 10.5, fontWeight: 500, color: c.textDim,
                borderBottom: `1px solid ${c.borderStrong}`,
                whiteSpace: 'nowrap',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: `1px solid ${c.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = c.surface)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{
                padding: '9px 14px', textAlign: 'right',
                ...MONO, fontSize: 10.5, color: c.textFaint,
                borderRight: `1px solid ${c.border}`,
              }}>
                {i + 1}
              </td>
              {columns.map(col => {
                const raw = row[col]
                const isNull = raw === null || raw === ''
                return (
                  <td key={col} style={{
                    padding: '9px 16px',
                    ...MONO, fontSize: 12,
                    color: isNull ? c.textFaint : c.text,
                    fontStyle: isNull ? 'italic' : 'normal',
                    whiteSpace: 'nowrap',
                    maxWidth: 320,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {isNull ? 'null' : String(raw)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default QueryPage