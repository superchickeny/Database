import { useState } from "react"
import { SANS, MONO, c, r } from './theme'

/* --- controls --------------------------------------------------------- */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-block cursor-pointer" style={{ width: 34, height: 20 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
      <span
        className="block rounded-full transition-colors duration-200"
        style={{
          width: 34, height: 20,
          background: checked ? c.accent : 'rgba(255,255,255,0.08)',
          border: `1px solid ${checked ? c.accent : c.border}`,
          boxShadow: checked ? `0 0 0 3px ${c.accentDim}` : 'none',
          transition: 'all 200ms',
        }}
      />
      <span
        className="absolute rounded-full pointer-events-none transition-all duration-200"
        style={{
          top: 3, left: 3, width: 14, height: 14,
          background: checked ? c.bg : c.textDim,
          transform: checked ? 'translateX(14px)' : 'translateX(0)',
        }}
      />
    </label>
  )
}

function SettingsRow({
  label,
  desc,
  control,
  last,
}: {
  label: string
  desc?: string
  control: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className="flex items-start justify-between gap-6"
      style={{
        padding: '16px 0',
        borderBottom: last ? 'none' : `1px solid ${c.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...SANS, fontSize: 13, color: c.text, fontWeight: 500, marginBottom: 3 }}>
          {label}
        </div>
        {desc && (
          <div style={{ ...SANS, fontSize: 12, color: c.textDim, lineHeight: 1.5 }}>
            {desc}
          </div>
        )}
      </div>
      <div className="shrink-0" style={{ paddingTop: 2 }}>{control}</div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${c.border}` }}>
        <div style={{
          ...SANS, fontSize: 10.5, color: c.textFaint,
          letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
          marginBottom: description ? 4 : 0,
        }}>
          {title}
        </div>
        {description && (
          <div style={{ ...SANS, fontSize: 12, color: c.textDim, marginTop: 4 }}>
            {description}
          </div>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}

/* --- page ------------------------------------------------------------- */

type SettingsPageProps = {
  url: string
  setUrl: React.Dispatch<React.SetStateAction<string>>
}

function SettingsPage({ url, setUrl }: SettingsPageProps) {
  const [inputFocused, setInputFocused] = useState(false)

  const inputStyle: React.CSSProperties = {
    background: c.surface,
    border: `1px solid ${inputFocused ? c.accentSoft : c.border}`,
    borderRadius: r.sm,
    color: c.text,
    ...MONO, fontSize: 12,
    padding: '7px 11px',
    outline: 'none',
    width: 260,
    transition: 'border-color 150ms',
    boxShadow: inputFocused ? `0 0 0 3px ${c.accentDim}` : 'none',
  }

  const btnStyle: React.CSSProperties = {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: r.sm,
    color: c.text,
    ...SANS, fontSize: 12, fontWeight: 500,
    padding: '7px 14px',
    cursor: 'pointer',
    transition: 'all 120ms',
  }

  return (
    <div className="overflow-y-auto flex-1" style={{ background: c.bg }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 40px 64px' }}>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <h1 style={{
            ...SANS, fontSize: 26, fontWeight: 300, color: c.text,
            letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2,
          }}>
            Settings
          </h1>
          <p style={{
            ...SANS, fontSize: 13, color: c.textDim,
            margin: '8px 0 0', lineHeight: 1.5,
          }}>
            Configure your connection and editor preferences.
          </p>
        </header>

        {/* Connection */}
        <Section
          title="Connection"
          description="The endpoint your queries are sent to."
        >
          <SettingsRow
            label="Server URL"
            desc="The backend query endpoint. Queries are POSTed here as JSON."
            control={
              <input
                style={inputStyle}
                value={url}
                onChange={e => setUrl(e.currentTarget.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                spellCheck={false}
              />
            }
          />
          <SettingsRow
            label="Status"
            desc="Current connection state."
            control={
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 10px', borderRadius: 4,
                background: c.okDim, border: `1px solid rgba(106,212,143,0.2)`,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: c.ok, boxShadow: `0 0 6px rgba(106,212,143,0.5)`,
                }} />
                <span style={{ ...MONO, fontSize: 11, color: c.ok }}>connected</span>
              </div>
            }
          />
          <SettingsRow
            last
            label="Reconnect"
            desc="Test the URL above and re-establish the connection."
            control={
              <button
                style={btnStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = c.accentSoft
                  e.currentTarget.style.color = c.accent
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = c.border
                  e.currentTarget.style.color = c.text
                }}
              >
                Test connection
              </button>
            }
          />
        </Section>
      </div>
    </div>
  )
}

export default SettingsPage