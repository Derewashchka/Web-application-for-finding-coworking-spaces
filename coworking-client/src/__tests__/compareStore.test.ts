import { describe, it, expect, beforeEach } from 'vitest'
import { useCompareStore } from '../store/compareStore'

describe('compareStore', () => {
  beforeEach(() => {
    useCompareStore.setState({ ids: [] })
  })

  it('початковий стан — порожній масив', () => {
    expect(useCompareStore.getState().ids).toEqual([])
  })

  it('add додає id і повертає true', () => {
    const result = useCompareStore.getState().add(1)
    expect(result).toBe(true)
    expect(useCompareStore.getState().ids).toContain(1)
  })

  it('add повертає true якщо id вже існує (не дублює)', () => {
    useCompareStore.setState({ ids: [1] })
    const result = useCompareStore.getState().add(1)
    expect(result).toBe(true)
    expect(useCompareStore.getState().ids).toHaveLength(1)
  })

  it('add повертає false при 3 обраних (ліміт)', () => {
    useCompareStore.setState({ ids: [1, 2, 3] })
    const result = useCompareStore.getState().add(4)
    expect(result).toBe(false)
    expect(useCompareStore.getState().ids).toHaveLength(3)
  })

  it('add не додає 4-й елемент при досягненні ліміту', () => {
    useCompareStore.setState({ ids: [1, 2, 3] })
    useCompareStore.getState().add(4)
    expect(useCompareStore.getState().ids).not.toContain(4)
  })

  it('remove видаляє id зі списку', () => {
    useCompareStore.setState({ ids: [1, 2, 3] })
    useCompareStore.getState().remove(2)
    expect(useCompareStore.getState().ids).not.toContain(2)
    expect(useCompareStore.getState().ids).toHaveLength(2)
  })

  it('remove не змінює стан якщо id відсутній', () => {
    useCompareStore.setState({ ids: [1, 2] })
    useCompareStore.getState().remove(99)
    expect(useCompareStore.getState().ids).toHaveLength(2)
  })

  it('clear очищає весь список', () => {
    useCompareStore.setState({ ids: [1, 2, 3] })
    useCompareStore.getState().clear()
    expect(useCompareStore.getState().ids).toHaveLength(0)
  })

  it('isInCompare повертає true для існуючого id', () => {
    useCompareStore.setState({ ids: [5] })
    expect(useCompareStore.getState().isInCompare(5)).toBe(true)
  })

  it('isInCompare повертає false для відсутнього id', () => {
    useCompareStore.setState({ ids: [5] })
    expect(useCompareStore.getState().isInCompare(99)).toBe(false)
  })

  it('після remove можна знову add (ліміт звільняється)', () => {
    useCompareStore.setState({ ids: [1, 2, 3] })
    useCompareStore.getState().remove(3)
    const result = useCompareStore.getState().add(4)
    expect(result).toBe(true)
    expect(useCompareStore.getState().ids).toContain(4)
  })
})