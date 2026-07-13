import { describe, it, expect, beforeEach } from 'vitest'
import { useFavoritesStore } from '../store/favoritesStore'

describe('favoritesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useFavoritesStore.setState({ ids: [] })
  })

  it('початковий стан — порожній масив', () => {
    expect(useFavoritesStore.getState().ids).toEqual([])
  })

  it('toggle додає id якого не було', () => {
    useFavoritesStore.getState().toggle(5)
    expect(useFavoritesStore.getState().ids).toContain(5)
  })

  it('toggle видаляє існуючий id', () => {
    useFavoritesStore.setState({ ids: [5, 10] })
    useFavoritesStore.getState().toggle(5)
    expect(useFavoritesStore.getState().ids).not.toContain(5)
    expect(useFavoritesStore.getState().ids).toContain(10)
  })

  it('toggle зберігає дані у localStorage', () => {
    useFavoritesStore.getState().toggle(7)
    const saved = JSON.parse(localStorage.getItem('favorites') ?? '[]')
    expect(saved).toContain(7)
  })

  it('isFavorite повертає true для збереженого id', () => {
    useFavoritesStore.setState({ ids: [3] })
    expect(useFavoritesStore.getState().isFavorite(3)).toBe(true)
  })

  it('isFavorite повертає false для незбереженого id', () => {
    useFavoritesStore.setState({ ids: [3] })
    expect(useFavoritesStore.getState().isFavorite(99)).toBe(false)
  })

  it('можна зберегти кілька різних id', () => {
    useFavoritesStore.getState().toggle(1)
    useFavoritesStore.getState().toggle(2)
    useFavoritesStore.getState().toggle(3)
    expect(useFavoritesStore.getState().ids).toHaveLength(3)
  })

  it('повторний toggle одного id не дублює його', () => {
    useFavoritesStore.getState().toggle(5)
    useFavoritesStore.getState().toggle(5)
    useFavoritesStore.getState().toggle(5)
    expect(useFavoritesStore.getState().ids.filter(i => i === 5)).toHaveLength(1)
  })
})