import { create } from 'zustand'

interface CompareState {
  ids:       number[]
  add:       (id: number) => boolean  // повертає false якщо вже 3
  remove:    (id: number) => void
  clear:     () => void
  isInCompare: (id: number) => boolean
}

export const useCompareStore = create<CompareState>((set, get) => ({
  ids: [],

  add: (id) => {
    const current = get().ids
    if (current.length >= 3)  return false
    if (current.includes(id)) return true
    set({ ids: [...current, id] })
    return true
  },

  remove: (id) => set({ ids: get().ids.filter(x => x !== id) }),

  clear: () => set({ ids: [] }),

  isInCompare: (id) => get().ids.includes(id),
}))