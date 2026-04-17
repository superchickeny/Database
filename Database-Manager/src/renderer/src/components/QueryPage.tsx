import { useEffect, useRef, useState } from "react"

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }
const SANS: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" }

type RowData = Record<string, string | number | boolean | null>

type QueryPageProps = {
    initialQuery: string
    onQueryRan: (query: string, timeInMs: number, rowsReturned: number) => void
    url: string
};

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
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Query bar */}
            <div
                className="flex items-center gap-2.5 shrink-0"
                style={{ padding: '10px 14px', background: '#111115', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div
                    className="flex-1 flex items-center gap-2.5 rounded-lg transition-colors duration-150"
                    style={{ background: '#18181d', border: '1px solid rgba(255,255,255,0.07)', padding: '0 14px' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(45,212,191,0.3)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                >
                    <span style={{ ...MONO, fontSize: 10, color: '#2dd4bf', letterSpacing: '0.1em', flexShrink: 0 }}>SQL</span>
                    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="SELECT * FROM users LIMIT 50"
                        style={{
                            flex: 1, background: 'none', border: 'none', outline: 'none',
                            ...MONO, fontSize: 12.5, color: '#e8e8ec',
                            padding: '10px 0', caretColor: '#2dd4bf',
                        }}
                    />
                    {loading && (
                        <span style={{ fontSize: 11, color: '#50505f', ...MONO, flexShrink: 0 }}>running…</span>
                    )}
                </div>
                <button
                    onClick={() => sendQuery(query)}
                    disabled={loading}
                    className="shrink-0 rounded-[7px] transition-opacity duration-150 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                        background: '#2dd4bf', color: '#0c0c0e',
                        border: 'none', padding: '9px 20px',
                        ...SANS, fontSize: 13, fontWeight: 500,
                        opacity: loading ? 0.4 : 1,
                    }}
                >
                    {loading ? '…' : 'Run ↵'}
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* History sidebar */}
                {history.length > 0 && (
                    <div
                        className="flex flex-col overflow-hidden shrink-0"
                        style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.07)', background: '#111115' }}
                    >
                        <div style={{ padding: '12px 14px 8px', fontSize: 10, color: '#50505f', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, ...SANS }}>
                            History
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {history.map((h, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setQuery(h); inputRef.current?.focus() }}
                                    className="block w-full text-left cursor-pointer transition-colors duration-100"
                                    style={{
                                        padding: '9px 14px',
                                        ...MONO, fontSize: 11, color: '#50505f',
                                        background: 'none', border: 'none',
                                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget
                                        el.style.color = '#2dd4bf'
                                        el.style.background = 'rgba(45,212,191,0.08)'
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget
                                        el.style.color = '#50505f'
                                        el.style.background = 'none'
                                    }}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="flex-1 overflow-auto flex flex-col">
                    {error && (
                        <div
                            className="flex items-center gap-2.5 rounded-lg m-3.5"
                            style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', ...MONO, fontSize: 12, color: '#f87171' }}
                        >
                            <span>✕</span>{error}
                        </div>
                    )}

                    {!error && columns.length === 0 && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <div
                                className="flex items-center justify-center rounded-full"
                                style={{ width: 40, height: 40, border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.4}>
                                    <rect x="2" y="2" width="14" height="14" rx="3" /><path d="M5 7h8M5 11h5" />
                                </svg>
                            </div>
                            <span style={{ fontSize: 13, color: '#50505f', ...SANS }}>
                                {rowCount === 0 ? 'query returned no rows' : 'run a query to see results'}
                            </span>
                            {rowCount === 0 && queryTime !== null && (
                                <span style={{ fontSize: 11, color: '#50505f', ...MONO }}>{queryTime}ms</span>
                            )}
                        </div>
                    )}

                    {columns.length > 0 && (
                        <div className="overflow-x-auto">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead>
                                    <tr style={{ background: '#111115', position: 'sticky', top: 0, zIndex: 2 }}>
                                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 400, color: '#50505f', borderBottom: '1px solid rgba(255,255,255,0.07)', width: 48, borderRight: '1px solid rgba(255,255,255,0.07)', fontSize: 11, ...SANS }}>#</th>
                                        {columns.map(col => (
                                            <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 400, color: '#888896', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap', fontSize: 11, letterSpacing: '0.03em', ...SANS }}>
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr
                                            key={i}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#18181d')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td style={{ padding: '8px 16px', ...MONO, color: '#50505f', borderRight: '1px solid rgba(255,255,255,0.07)', fontSize: 11 }}>{i + 1}</td>
                                            {columns.map(col => {
                                                const val = row[col] === '' ? null : row[col]
                                                return (
                                                    <td key={col}>
                                                        {val}
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
            <div
                className="flex items-center shrink-0"
                style={{ height: 26, borderTop: '1px solid rgba(255,255,255,0.07)', background: '#111115', padding: '0 16px', gap: 16 }}
            >
                {rowCount !== null && <span style={{ ...MONO, fontSize: 10, color: '#50505f', letterSpacing: '0.04em' }}>{rowCount.toLocaleString()} row{rowCount !== 1 ? 's' : ''}</span>}
                {queryTime !== null && <><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#50505f', opacity: 0.4 }} /><span style={{ ...MONO, fontSize: 10, color: '#50505f' }}>{queryTime}ms</span></>}
                {columns.length > 0 && <><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#50505f', opacity: 0.4 }} /><span style={{ ...MONO, fontSize: 10, color: '#50505f' }}>{columns.length} col{columns.length !== 1 ? 's' : ''}</span></>}
                <span style={{ ...MONO, fontSize: 10, color: '#26262f', marginLeft: 'auto' }}>localhost:4000</span>
            </div>
        </div>
    )
}

export default QueryPage