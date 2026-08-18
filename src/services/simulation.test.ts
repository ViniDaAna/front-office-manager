import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  createNewGame,
} from './newGame'

import {
  advanceOneDay,
} from './simulation'

describe('Daily Simulation', () => {
  it('avança a carreira exatamente um dia', () => {
    const game =
      createNewGame('sas')

    const next =
      advanceOneDay(game)

    expect(
      next.currentDate,
    ).toBe('2026-08-08')

    expect(next.day).toBe(1)

    expect(
      game.currentDate,
    ).toBe('2026-08-07')

    expect(game.day).toBe(0)
  })

  it('mantém a temporada em offseason antes da pré-temporada', () => {
    const game =
      createNewGame('sas')

    const state = {
      ...game,

      currentDate:
        '2026-10-01',
    }

    const next =
      advanceOneDay(state)

    expect(
      next.league?.season.phase,
    ).toBe('offseason')
  })

  it('entra automaticamente em preseason no calendário correto', () => {
    const game =
      createNewGame('sas')

    const state = {
      ...game,

      currentDate:
        '2026-10-02',
    }

    const next =
      advanceOneDay(state)

    expect(
      next.currentDate,
    ).toBe('2026-10-03')

    expect(
      next.league?.season.phase,
    ).toBe('preseason')
  })

  it('não altera a fase da temporada original', () => {
    const game =
      createNewGame('sas')

    const state = {
      ...game,

      currentDate:
        '2026-10-02',
    }

    const next =
      advanceOneDay(state)

    expect(
      state.league?.season.phase,
    ).toBe('offseason')

    expect(
      next.league?.season.phase,
    ).toBe('preseason')
  })

  it('continua suportando estados antigos sem league', () => {
    const game =
      createNewGame('sas')

    const legacyState = {
      ...game,
      league: undefined,
    }

    const next =
      advanceOneDay(legacyState)

    expect(next.league).toBeUndefined()

    expect(
      next.currentDate,
    ).toBe('2026-08-08')
  })
})