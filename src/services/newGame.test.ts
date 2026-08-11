import { describe, expect, it } from 'vitest'

import { franchises } from '../data/franchises'
import { CURRENT_SCHEMA_VERSION } from '../domain/schema'
import { createNewGame } from './newGame'

describe('New Game Factory', () => {
  it('cria uma carreira usando o schema estrutural atual', () => {
    const game = createNewGame('sas')

    expect(game.schemaVersion).toBe(
      CURRENT_SCHEMA_VERSION,
    )
  })

  it('cria exatamente as 30 franquias no estado da liga', () => {
    const game = createNewGame('sas')

    expect(game.league).toBeDefined()

    const franchiseManagement =
      game.league?.franchiseManagement

    expect(franchiseManagement).toBeDefined()

    const managementIds = Object.keys(
      franchiseManagement ?? {},
    )

    expect(franchises).toHaveLength(30)
    expect(managementIds).toHaveLength(30)

    for (const franchise of franchises) {
      expect(
        franchiseManagement?.[franchise.id],
      ).toBeDefined()

      expect(
        franchiseManagement?.[franchise.id]
          .franchiseId,
      ).toBe(franchise.id)
    }
  })

  it('recusa criar uma carreira com franquia inexistente', () => {
    expect(() =>
      createNewGame('franquia-que-nao-existe'),
    ).toThrow(
      'Franquia inválida ao criar carreira',
    )
  })
})