import { create } from 'zustand'

interface FavoritesState {
  ids: number[]
  toggle: (id: number) => void
  isFavorite: (id: number) => boolean
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: JSON.parse(localStorage.getItem('favorites') ?? '[]'),

  toggle: (id) => {
    const current = get().ids
    const updated = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id]

    localStorage.setItem('favorites', JSON.stringify(updated))
    set({ ids: updated })
  },

  isFavorite: (id) => get().ids.includes(id),
}))