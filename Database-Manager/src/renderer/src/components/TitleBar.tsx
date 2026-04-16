
const TitleBar = () => {
  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className="h-8 w-full bg-zinc-900 flex items-center justify-end px-2 gap-1"
    >
      <button
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="hover:bg-zinc-700 w-10 h-full text-zinc-400 hover:text-white transition-colors"
        onClick={() => window.windowAPI.minimize()}
      >
        ─
      </button>
      <button
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="hover:bg-zinc-700 w-10 h-full text-zinc-400 hover:text-white transition-colors"
        onClick={() => window.windowAPI.maximize()}
      >
        □
      </button>
      <button
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="hover:bg-red-600 w-10 h-full text-zinc-400 hover:text-white transition-colors"
        onClick={() => window.close()}
      >
        ✕
      </button>
    </div>
  )
}

export default TitleBar
