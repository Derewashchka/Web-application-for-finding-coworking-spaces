import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from '../store/themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.setState({ isDark: false })
    document.documentElement.classList.remove('dark')
  })

  it('toggle перемикає isDark з false на true', () => {
    useThemeStore.setState({ isDark: false })
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().isDark).toBe(true)
  })

  it('toggle перемикає isDark з true на false', () => {
    useThemeStore.setState({ isDark: true })
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().isDark).toBe(false)
  })

  it('toggle зберігає "dark" у localStorage', () => {
    useThemeStore.setState({ isDark: false })
    useThemeStore.getState().toggle()
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggle зберігає "light" у localStorage', () => {
    useThemeStore.setState({ isDark: true })
    useThemeStore.getState().toggle()
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggle додає клас dark до documentElement', () => {
    useThemeStore.setState({ isDark: false })
    useThemeStore.getState().toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggle прибирає клас dark з documentElement', () => {
    document.documentElement.classList.add('dark')
    useThemeStore.setState({ isDark: true })
    useThemeStore.getState().toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})