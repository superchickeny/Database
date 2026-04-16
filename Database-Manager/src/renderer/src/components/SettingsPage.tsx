import { useState } from "react";

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }
const SANS: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-block cursor-pointer" style={{ width: 38, height: 22 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
      <span
        className="block rounded-full border transition-colors duration-200"
        style={{
          width: 38, height: 22,
          background: checked ? '#2dd4bf' : '#26262f',
          borderColor: checked ? '#2dd4bf' : 'rgba(255,255,255,0.07)',
        }}
      />
      <span
        className="absolute rounded-full pointer-events-none transition-all duration-200"
        style={{
          top: 3, left: 3, width: 16, height: 16,
          background: checked ? '#0c0c0e' : '#50505f',
          transform: checked ? 'translateX(16px)' : 'translateX(0)',
        }}
      />
    </label>
  )
}

function SettingsRow({ label, desc, control }: { label: string; desc?: string; control: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div>
        <div style={{ fontSize: 13, color: '#e8e8ec', marginBottom: 2, ...SANS }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: '#50505f', ...SANS }}>{desc}</div>}
      </div>
      <div className="shrink-0 ml-6">{control}</div>
    </div>
  )
}

function SettingsPage() {
  const [autoRun, setAutoRun] = useState(true)
  const [showRowNums, setShowRowNums] = useState(true)
  const [highlightNull, setHighlightNull] = useState(true)

  const selectStyle: React.CSSProperties = {
    background: '#18181d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7,
    color: '#e8e8ec', ...SANS, fontSize: 12,
    padding: '7px 28px 7px 10px', cursor: 'pointer', outline: 'none', minWidth: 120,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
  }

  const inputStyle: React.CSSProperties = {
    background: '#18181d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7,
    color: '#e8e8ec', ...MONO, fontSize: 12,
    padding: '7px 12px', outline: 'none', width: 220,
  }

  const btnStyle: React.CSSProperties = {
    background: '#1f1f26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7,
    color: '#e8e8ec', ...SANS, fontSize: 12,
    padding: '7px 16px', cursor: 'pointer',
  }

  const kbdStyle: React.CSSProperties = {
    display: 'inline-block', background: '#1f1f26', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 4, ...MONO, fontSize: 10, color: '#888896', padding: '2px 6px',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 11, color: '#50505f', letterSpacing: '0.1em',
    textTransform: 'uppercase', fontWeight: 500, marginBottom: 12,
    paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.07)',
    ...SANS,
  }

  return (
    <div className="overflow-y-auto flex-1" style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={sectionTitleStyle}>Connection</div>
        <SettingsRow label="Server URL" desc="The backend query endpoint"
          control={<input style={inputStyle} defaultValue="http://localhost:4000/query" />}
        />
        <SettingsRow label="Status" desc="Current connection state"
          control={
            <div className="flex items-center gap-1.5" style={{ fontSize: 12, ...MONO, color: '#4ade80' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
              connected
            </div>
          }
        />
        <SettingsRow label="Reconnect" desc="Test and re-establish the connection"
          control={<button style={btnStyle}>Test connection</button>}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={sectionTitleStyle}>Editor</div>
        <SettingsRow label="Row limit" desc="Maximum rows returned per query"
          control={<select style={selectStyle}><option>100</option><option>500</option><option>1000</option><option>5000</option><option>Unlimited</option></select>}
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

      <div style={{ marginBottom: 32 }}>
        <div style={sectionTitleStyle}>Keyboard shortcuts</div>
        <SettingsRow label="Run query" control={<span style={kbdStyle}>↵</span>} />
        <SettingsRow label="Previous query" control={<span style={kbdStyle}>↑</span>} />
        <SettingsRow label="Next query" control={<span style={kbdStyle}>↓</span>} />
      </div>
    </div>
  )
}

export default SettingsPage