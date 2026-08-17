import {
  describe,
  expect,
  it,
} from 'vitest'

import { franchises } from '../data/franchises'
import { CURRENT_SCHEMA_VERSION } from '../domain/schema'

import {
  createNewGame,
} from './newGame'

describe('New Game Factory', () => {
  it('cria uma carreira usando o schema estrutural atual', () => {
    const game =
      createNewGame('sas')

    expect(
      game.schemaVersion,
    ).toBe(
      CURRENT_SCHEMA_VERSION,
    )
  })

  it('cria exatamente as 30 franquias no estado da liga', () => {
    const game =
      createNewGame('sas')

    expect(game.league).toBeDefined()

    const franchiseManagement =
      game.league
        ?.franchiseManagement

    expect(
      franchiseManagement,
    ).toBeDefined()

    const managementIds =
      Object.keys(
        franchiseManagement ?? {},
      )

    expect(franchises).toHaveLength(30)

    expect(
      managementIds,
    ).toHaveLength(30)

    for (
      const franchise of franchises
    ) {
      expect(
        franchiseManagement?.[
          franchise.id
        ],
      ).toBeDefined()

      expect(
        franchiseManagement?.[
          franchise.id
        ].franchiseId,
      ).toBe(franchise.id)
    }
  })

  it('cria a temporada inicial para todas as franquias', () => {
    const game =
      createNewGame('sas')

    const season =
      game.league?.season

    expect(season).toBeDefined()

    expect(season?.id).toBe(
      '2026-27',
    )

    expect(season?.phase).toBe(
      'offseason',
    )

    expect(
      Object.keys(
        season?.franchiseRecords ??
          {},
      ),
    ).toHaveLength(30)

    expect(
      season
        ?.franchiseRecords.sas,
    ).toEqual({
      franchiseId: 'sas',
      wins: 0,
      losses: 0,
    })
  })

  it('recusa criar uma carreira com franquia inexistente', () => {
    expect(() =>
      createNewGame(
        'franquia-que-nao-existe',
      ),
    ).toThrow(
      'Franquia inválida ao criar carreira',
    )
  })

  it('não cria novos saves com o campo legado organizationDirection', () => {
    const game =
      createNewGame('sas')

    expect(
      Object.prototype
        .hasOwnProperty.call(
          game,
          'organizationDirection',
        ),
    ).toBe(false)
  })
})