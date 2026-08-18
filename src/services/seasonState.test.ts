import {
  describe,
  expect,
  it,
} from 'vitest'

import { franchises } from '../data/franchises'

import {
  createInitialSeasonState,
  getGamesPlayed,
  getSeasonPhaseForDate,
  getWinningPercentage,
  updateSeasonPhaseForDate,
} from './seasonState'

describe('Season State', () => {
  it('cria a temporada 2026-27 na offseason', () => {
    const season =
      createInitialSeasonState()

    expect(season.id).toBe('2026-27')

    expect(season.startYear).toBe(2026)

    expect(season.endYear).toBe(2027)

    expect(season.phase).toBe(
      'offseason',
    )
  })

  it('cria uma campanha para cada franquia da liga', () => {
    const season =
      createInitialSeasonState()

    const recordIds = Object.keys(
      season.franchiseRecords,
    )

    expect(franchises).toHaveLength(30)

    expect(recordIds).toHaveLength(30)

    for (const franchise of franchises) {
      const record =
        season.franchiseRecords[
          franchise.id
        ]

      expect(record).toBeDefined()

      expect(record.franchiseId).toBe(
        franchise.id,
      )
    }
  })

  it('inicia todas as franquias sem vitórias ou derrotas', () => {
    const season =
      createInitialSeasonState()

    for (
      const record of Object.values(
        season.franchiseRecords,
      )
    ) {
      expect(record.wins).toBe(0)

      expect(record.losses).toBe(0)

      expect(
        getGamesPlayed(record),
      ).toBe(0)
    }
  })

  it('calcula jogos disputados a partir de vitórias e derrotas', () => {
    expect(
      getGamesPlayed({
        franchiseId: 'sas',
        wins: 12,
        losses: 8,
      }),
    ).toBe(20)
  })

  it('calcula o aproveitamento da campanha', () => {
    expect(
      getWinningPercentage({
        franchiseId: 'sas',
        wins: 12,
        losses: 8,
      }),
    ).toBe(0.6)

    expect(
      getWinningPercentage({
        franchiseId: 'sas',
        wins: 0,
        losses: 0,
      }),
    ).toBe(0)
  })

  it('não compartilha campanhas entre novas temporadas criadas', () => {
    const first =
      createInitialSeasonState()

    const second =
      createInitialSeasonState()

    expect(first).not.toBe(second)

    expect(
      first.franchiseRecords,
    ).not.toBe(
      second.franchiseRecords,
    )

    expect(
      first.franchiseRecords.sas,
    ).not.toBe(
      second.franchiseRecords.sas,
    )
  })

  it('mantém a offseason antes do início da pré-temporada', () => {
    expect(
      getSeasonPhaseForDate(
        '2026-10-02',
      ),
    ).toBe('offseason')
  })

  it('entra em preseason na data inicial da pré-temporada', () => {
    expect(
      getSeasonPhaseForDate(
        '2026-10-03',
      ),
    ).toBe('preseason')

    expect(
      getSeasonPhaseForDate(
        '2026-10-10',
      ),
    ).toBe('preseason')
  })

  it('atualiza a fase sem alterar a temporada original', () => {
    const season =
      createInitialSeasonState()

    const updated =
      updateSeasonPhaseForDate(
        season,
        '2026-10-03',
      )

    expect(
      season.phase,
    ).toBe('offseason')

    expect(
      updated.phase,
    ).toBe('preseason')

    expect(updated).not.toBe(season)

    expect(
      updated.franchiseRecords,
    ).toBe(
      season.franchiseRecords,
    )
  })

  it('reutiliza o mesmo estado quando a fase não muda', () => {
    const season =
      createInitialSeasonState()

    const updated =
      updateSeasonPhaseForDate(
        season,
        '2026-08-20',
      )

    expect(updated).toBe(season)
  })
})