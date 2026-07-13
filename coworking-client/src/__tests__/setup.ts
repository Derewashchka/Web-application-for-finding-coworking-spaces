import { vi } from 'vitest'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem:    (key: string) => store[key] ?? null,
    setItem:    (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear:      () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media:   query,
    addEventListener:    vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

const classList = new Set<string>()
Object.defineProperty(document.documentElement, 'classList', {
  value: {
    add:      (cls: string) => classList.add(cls),
    remove:   (cls: string) => classList.delete(cls),
    contains: (cls: string) => classList.has(cls),
    toggle:   (cls: string, force?: boolean) => {
      if (force === true)       classList.add(cls)
      else if (force === false) classList.delete(cls)
      else classList.has(cls) ? classList.delete(cls) : classList.add(cls)
    },
  },
})