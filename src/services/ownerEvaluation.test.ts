import {
  describe,
  expect,
  it,
} from 'vitest'

import { createNewGame } from './newGame'

import {
  createOrganizationObjectives,
} from './ownerExpectations'

import {
  applyObjectiveEvaluation,
  evaluateObjective,
} from './ownerEvaluation'

function createGameWithExpectations() {
  const game = createNewGame('sas')

  const management =
    game.league?.franchiseManagement.sas

  if (!management) {
    throw new Error(
      'Estado administrativo do SAS não encontrado no teste.',
    )
  }

  management.organizationDirection =
    'rebuild'

  management.objectives =
    createOrganizationObjectives({
      franchiseId: 'sas',
      direction: 'rebuild',
      createdDate: game.currentDate,
    })

  management.ownerTrust = 60
  management.jobSecurity = 'stable'

  return game
}

describe('Owner Evaluation', () => {
  it('aumenta confiança ao cumprir objetivo', () => {
    const game =
      createGameWithExpectations()

    const objective =
      game.league!
        .franchiseManagement.sas
        .objectives[0]

    const resolved =
      applyObjectiveEvaluation(
        game,
        objective.id,
        'completed',
      )

    const management =
      resolved.league!
        .franchiseManagement.sas

    expect(
      management.ownerTrust,
    ).toBe(70)

    expect(
      management.jobSecurity,
    ).toBe('secure')

    expect(
      management.objectives[0].status,
    ).toBe('completed')
  })

  it('reduz confiança ao falhar objetivo', () => {
    const game =
      createGameWithExpectations()

    const objective =
      game.league!
        .franchiseManagement.sas
        .objectives[0]

    const resolved =
      applyObjectiveEvaluation(
        game,
        objective.id,
        'failed',
      )

    const management =
      resolved.league!
        .franchiseManagement.sas

    expect(
      management.ownerTrust,
    ).toBe(45)

    expect(
      management.jobSecurity,
    ).toBe('under-pressure')

    expect(
      management.objectives[0].status,
    ).toBe('failed')
  })

  it('usa a importância do objetivo no impacto da confiança', () => {
    const game =
      createGameWithExpectations()

    const objective =
      game.league!
        .franchiseManagement.sas
        .objectives[2]

    expect(
      objective.importance,
    ).toBe(4)

    const completed =
      evaluateObjective(
        objective,
        'completed',
      )

    expect(
      completed.ownerTrustChange,
    ).toBe(8)

    const failed =
      evaluateObjective(
        objective,
        'failed',
      )

    expect(
      failed.ownerTrustChange,
    ).toBe(-12)
  })

  it('não altera outros objetivos ao avaliar um compromisso', () => {
    const game =
      createGameWithExpectations()

    const objectives =
      game.league!
        .franchiseManagement.sas
        .objectives

    const resolved =
      applyObjectiveEvaluation(
        game,
        objectives[0].id,
        'completed',
      )

    const resolvedObjectives =
      resolved.league!
        .franchiseManagement.sas
        .objectives

    expect(
      resolvedObjectives[0].status,
    ).toBe('completed')

    expect(
      resolvedObjectives[1].status,
    ).toBe('active')

    expect(
      resolvedObjectives[2].status,
    ).toBe('active')
  })

  it('não permite avaliar novamente um objetivo encerrado', () => {
    const game =
      createGameWithExpectations()

    const objective =
      game.league!
        .franchiseManagement.sas
        .objectives[0]

    const resolved =
      applyObjectiveEvaluation(
        game,
        objective.id,
        'completed',
      )

    expect(() =>
      applyObjectiveEvaluation(
        resolved,
        objective.id,
        'failed',
      ),
    ).toThrow('já foi avaliado')
  })

  it('não modifica o estado original', () => {
    const game =
      createGameWithExpectations()

    const objective =
      game.league!
        .franchiseManagement.sas
        .objectives[0]

    applyObjectiveEvaluation(
      game,
      objective.id,
      'failed',
    )

    const management =
      game.league!
        .franchiseManagement.sas

    expect(
      management.ownerTrust,
    ).toBe(60)

    expect(
      objective.status,
    ).toBe('active')
  })
})