import { useEffect, useRef, useState } from 'react'
import TitleBar from './components/TitleBar'
import HomePage from './components/HomePage'
import "../src/assets/main.css"
import QueryPage from './components/QueryPage'
import SettingsPage from './components/SettingsPage'

type Tab = 'home' | 'query' | 'settings'

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }
const SANS: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" }

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
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: '100vh', width: '100%', background: '#0c0c0e', color: '#e8e8ec', ...SANS }}
      >
        <TitleBar/>
        
        {/* Nav */}
        <div
          className="flex items-stretch shrink-0"
          style={{ height: 44, background: '#111115', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 12px', gap: 2 }}
        >
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-[7px] cursor-pointer transition-colors duration-150"
              style={{
                padding: '0 14px',
                fontSize: 13, fontWeight: 400,
                color: tab === id ? '#e8e8ec' : '#50505f',
                border: 'none', background: 'none',
                borderBottom: tab === id ? '2px solid #2dd4bf' : '2px solid transparent',
                position: 'relative', top: 1,
                ...SANS,
              }}
            >
              <span style={{ opacity: tab === id ? 1 : 0.6 }}><Icon /></span>
              {label}
            </button>
          ))}
        </div>

        {/* Pages */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {tab === 'home' && <HomePage onRunQuery={handleRunQuery} />}
          {tab === 'query' && <QueryPage initialQuery={pendingQuery} onQueryRan={() => {}} />}
          {tab === 'settings' && <SettingsPage />}
        </div>
      </div>
    </>
  )
}