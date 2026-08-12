import { describe, expect, it } from 'vitest'

import { createNewGame } from './newGame'

import {
  getFranchiseAlignment,
  getFranchiseById,
  getFranchiseManagement,
  getUserFranchise,
  getUserFranchiseAlignment,
  getUserFranchiseManagement,
} from './franchiseSelectors'

describe('Franchise Selectors', () => {
  it('encontra uma franquia válida pelo ID', () => {
    const franchise = getFranchiseById('sas')

    expect(franchise).not.toBeNull()
    expect(franchise?.id).toBe('sas')
    expect(franchise?.city).toBe('San Antonio')
    expect(franchise?.name).toBe('Spurs')
    expect(franchise?.abbreviation).toBe('SAS')
  })

  it('retorna null para uma franquia inexistente', () => {
    const franchise = getFranchiseById(
      'franquia-inexistente',
    )

    expect(franchise).toBeNull()
  })

  it('encontra o alinhamento oficial da franquia', () => {
    const alignment =
      getFranchiseAlignment('sas')

    expect(alignment).not.toBeNull()
    expect(alignment?.conference).toBe('West')
    expect(alignment?.division).toBe('Southwest')
  })

  it('encontra o estado administrativo de uma franquia no save', () => {
    const game = createNewGame('sas')

    const management =
      getFranchiseManagement(game, 'sas')

    expect(management).not.toBeNull()
    expect(management?.franchiseId).toBe('sas')
    expect(management?.objectives).toEqual([])
  })

  it('retorna null quando o estado administrativo solicitado não existe', () => {
    const game = createNewGame('sas')

    const management =
      getFranchiseManagement(
        game,
        'franquia-inexistente',
      )

    expect(management).toBeNull()
  })

  it('encontra todos os dados principais da franquia controlada pelo jogador', () => {
    const game = createNewGame('sas')

    const franchise =
      getUserFranchise(game)

    const alignment =
      getUserFranchiseAlignment(game)

    const management =
      getUserFranchiseManagement(game)

    expect(franchise?.id).toBe('sas')
    expect(franchise?.name).toBe('Spurs')

    expect(alignment?.conference).toBe('West')
    expect(alignment?.division).toBe('Southwest')

    expect(management?.franchiseId).toBe('sas')
  })
})