/// <reference types="vite/client" />

interface Window {
  windowAPI: {
    minimize: () => void
    maximize: () => void
  }
}