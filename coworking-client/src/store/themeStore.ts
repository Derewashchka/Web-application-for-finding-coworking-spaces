import { create } from 'zustand'

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function getInitialDark(): boolean {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark')  return true
  if (saved === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

interface ThemeState {
  isDark:  boolean
  toggle:  () => void
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const isDark = getInitialDark()
  applyTheme(isDark)

  return {
    isDark,
    toggle: () => {
      const next = !get().isDark
      localStorage.setItem('theme', next ? 'dark' : 'light')
      applyTheme(next)
      set({ isDark: next })
    },
  }
})