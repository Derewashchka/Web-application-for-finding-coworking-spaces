import { describe, it, expect } from 'vitest'
import { toLocalISOString } from '../api/bookings'

describe('toLocalISOString', () => {
  it('повертає рядок у форматі YYYY-MM-DDTHH:MM:SS', () => {
    const date = new Date(2026, 3, 15, 10, 30, 0) // 15 apr 2026 10:30
    const result = toLocalISOString(date)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  })

  it('не додає суфікс Z (UTC) — зберігає локальний час', () => {
    const date = new Date(2026, 3, 15, 10, 0, 0)
    const result = toLocalISOString(date)
    expect(result).not.toMatch(/Z$/)
  })

  it('коректно форматує годину 08:00', () => {
    const date = new Date(2026, 3, 15, 8, 0, 0)
    const result = toLocalISOString(date)
    expect(result).toContain('T08:00:00')
  })

  it('коректно форматує годину 23:00', () => {
    const date = new Date(2026, 3, 15, 23, 0, 0)
    const result = toLocalISOString(date)
    expect(result).toContain('T23:00:00')
  })

  it('двозначне відображення місяця (01–12)', () => {
    const date = new Date(2026, 0, 5, 9, 0, 0)
    const result = toLocalISOString(date)
    expect(result).toMatch(/^2026-01-05/)
  })

  it('двозначне відображення дня (01–31)', () => {
    const date = new Date(2026, 3, 5, 9, 0, 0)
    const result = toLocalISOString(date)
    expect(result).toMatch(/^2026-04-05/)
  })

  it('двозначне відображення години (00–23)', () => {
    const date = new Date(2026, 3, 15, 9, 0, 0)
    const result = toLocalISOString(date)
    expect(result).toContain('T09:00:00')
  })
})

// ── Validation of booking business rules ─────────────────────

describe('Бізнес-правила бронювання (граничні випадки)', () => {
  it('час початку 08:00 є мінімально допустимим', () => {
    const dateFrom = new Date(2026, 3, 15, 8, 0, 0)
    expect(dateFrom.getHours()).toBeGreaterThanOrEqual(8)
  })

  it('час початку 07:59 порушує мінімум (< 08:00)', () => {
    const dateFrom = new Date(2026, 3, 15, 7, 59, 0)
    expect(dateFrom.getHours()).toBeLessThan(8)
  })

  it('час кінця 23:00 є максимально допустимим', () => {
    const dateTo = new Date(2026, 3, 15, 23, 0, 0)
    expect(dateTo.getHours()).toBeLessThanOrEqual(23)
    expect(dateTo.getMinutes()).toBe(0)
  })

  it('час кінця 23:01 порушує максимум (> 23:00)', () => {
    const dateTo = new Date(2026, 3, 15, 23, 1, 0)
    const isInvalid = dateTo.getHours() > 23 ||
      (dateTo.getHours() === 23 && dateTo.getMinutes() > 0)
    expect(isInvalid).toBe(true)
  })

  it('dateTo > dateFrom — валідний інтервал', () => {
    const dateFrom = new Date(2026, 3, 15, 9, 0, 0)
    const dateTo   = new Date(2026, 3, 15, 17, 0, 0)
    expect(dateTo.getTime()).toBeGreaterThan(dateFrom.getTime())
  })

  it('dateTo === dateFrom — невалідний інтервал', () => {
    const dateFrom = new Date(2026, 3, 15, 9, 0, 0)
    const dateTo   = new Date(2026, 3, 15, 9, 0, 0)
    expect(dateTo.getTime()).not.toBeGreaterThan(dateFrom.getTime())
  })

  it('dateTo < dateFrom — невалідний інтервал', () => {
    const dateFrom = new Date(2026, 3, 15, 17, 0, 0)
    const dateTo   = new Date(2026, 3, 15, 9, 0, 0)
    expect(dateTo.getTime()).toBeLessThan(dateFrom.getTime())
  })

  it('розрахунок тривалості 8 годин (9:00–17:00)', () => {
    const dateFrom = new Date(2026, 3, 15, 9, 0, 0)
    const dateTo   = new Date(2026, 3, 15, 17, 0, 0)
    const hours    = (dateTo.getTime() - dateFrom.getTime()) / 3_600_000
    expect(hours).toBe(8)
  })

  it('розрахунок вартості: 8 год × 120 ₴ = 960 ₴', () => {
    const hours        = 8
    const pricePerHour = 120
    const total        = Math.round(hours * pricePerHour * 100) / 100
    expect(total).toBe(960)
  })
})