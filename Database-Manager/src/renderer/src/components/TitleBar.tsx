
const TitleBar = () => {
  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className="h-9 w-full bg-zinc-950 border-b border-zinc-800/60 flex items-center justify-between select-none"
    >
      {/* App name */}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-md text-zinc-300 tracking-wide">
         
        </span>
      </div>

      {/* Window controls */}
      <div
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center h-full"
      >
        <button
          aria-label="Minimize"
          className="w-11 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
          onClick={() => window.windowAPI.minimize()}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M0 5h10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          aria-label="Maximize"
          className="w-11 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
          onClick={() => window.windowAPI.maximize()}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          aria-label="Close"
          className="w-11 h-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-600 transition-colors"
          onClick={() => window.close()}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
