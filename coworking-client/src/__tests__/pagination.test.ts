import { describe, it, expect } from 'vitest'

// Утиліта пагінації (логіка з ProfilePage usePagination hook)
function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const safePage   = Math.min(Math.max(1, page), totalPages)
  const paginated  = items.slice((safePage - 1) * perPage, safePage * perPage)
  return { paginated, totalPages, page: safePage }
}

const items = Array.from({ length: 23 }, (_, i) => ({ id: i + 1 }))

describe('pagination utility', () => {
  it('перша сторінка містить перші 5 елементів (perPage=5)', () => {
    const { paginated } = paginate(items, 1, 5)
    expect(paginated).toHaveLength(5)
    expect(paginated[0].id).toBe(1)
  })

  it('друга сторінка починається з 6-го елемента', () => {
    const { paginated } = paginate(items, 2, 5)
    expect(paginated[0].id).toBe(6)
  })

  it('остання сторінка може бути неповною', () => {
    // 23 елементи / 5 = 5 повних + 3 залишок
    const { paginated } = paginate(items, 5, 5)
    expect(paginated).toHaveLength(3)
  })

  it('totalPages розраховується коректно (23/5 = 5)', () => {
    const { totalPages } = paginate(items, 1, 5)
    expect(totalPages).toBe(5)
  })

  it('totalPages = 1 для порожнього масиву', () => {
    const { totalPages } = paginate([], 1, 5)
    expect(totalPages).toBe(1)
  })

  it('paginated = [] для порожнього масиву', () => {
    const { paginated } = paginate([], 1, 5)
    expect(paginated).toHaveLength(0)
  })

  it('сторінка 0 коригується до 1', () => {
    const { page, paginated } = paginate(items, 0, 5)
    expect(page).toBe(1)
    expect(paginated[0].id).toBe(1)
  })

  it('сторінка > totalPages коригується до останньої', () => {
    const { page } = paginate(items, 999, 5)
    expect(page).toBe(5)
  })

  it('perPage=9 — totalPages = 3 для 23 елементів', () => {
    const { totalPages } = paginate(items, 1, 9)
    expect(totalPages).toBe(3)
  })

  it('третя сторінка (perPage=9) містить 5 елементів', () => {
    const { paginated } = paginate(items, 3, 9)
    expect(paginated).toHaveLength(5)
  })
})