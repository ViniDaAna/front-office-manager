import {
  describe,
  expect,
  it,
} from 'vitest'

import type {
  Decision,
  GameState,
} from '../domain/types'

import { createNewGame } from './newGame'

import {
  createOrganizationObjectives,
  isOrganizationDirection,
  resolveOrganizationDirectionDecision,
} from './ownerExpectations'

function createDirectionDecision(): Decision {
  return {
    id: 'initial-direction',
    date: '2026-08-07',
    category: 'Owner',
    title: 'Defina a direção da organização',
    prompt:
      'Qual deve ser a prioridade da franquia?',

    options: [
      {
        id: 'win-now',
        label: 'Vencer agora',
        description:
          'Priorizar resultados imediatos.',
      },
      {
        id: 'balanced',
        label: 'Equilibrar presente e futuro',
        description:
          'Competir sem comprometer o futuro.',
      },
      {
        id: 'rebuild',
        label: 'Reconstruir',
        description:
          'Priorizar desenvolvimento e ativos.',
      },
    ],

    status: 'pending',
  }
}

function createGameWithDirectionDecision():
  GameState {
  const game = createNewGame('sas')

  return {
    ...game,

    decisions: [
      createDirectionDecision(),
    ],
  }
}

describe('Owner Expectations', () => {
  it('reconhece direções organizacionais válidas', () => {
    expect(
      isOrganizationDirection('win-now'),
    ).toBe(true)

    expect(
      isOrganizationDirection('balanced'),
    ).toBe(true)

    expect(
      isOrganizationDirection('rebuild'),
    ).toBe(true)

    expect(
      isOrganizationDirection('all-in'),
    ).toBe(false)
  })

  it('gera objetivos de win-now voltados ao presente', () => {
    const objectives =
      createOrganizationObjectives({
        franchiseId: 'sas',
        direction: 'win-now',
        createdDate: '2026-08-07',
      })

    expect(objectives).toHaveLength(3)

    expect(
      objectives.map(
        (objective) => objective.title,
      ),
    ).toContain('Disputar em alto nível')

    expect(
      objectives.map(
        (objective) => objective.title,
      ),
    ).toContain('Elevar o nível do elenco')
  })

  it('gera objetivos equilibrados para balanced', () => {
    const objectives =
      createOrganizationObjectives({
        franchiseId: 'sas',
        direction: 'balanced',
        createdDate: '2026-08-07',
      })

    expect(objectives).toHaveLength(3)

    expect(
      objectives.map(
        (objective) =>
          objective.category,
      ),
    ).toContain('development')

    expect(
      objectives.map(
        (objective) => objective.title,
      ),
    ).toContain('Preservar flexibilidade')
  })

  it('gera objetivos de longo prazo para rebuild', () => {
    const objectives =
      createOrganizationObjectives({
        franchiseId: 'sas',
        direction: 'rebuild',
        createdDate: '2026-08-07',
      })

    expect(objectives).toHaveLength(3)

    expect(
      objectives.map(
        (objective) => objective.title,
      ),
    ).toContain(
      'Priorizar o desenvolvimento jovem',
    )

    expect(
      objectives.map(
        (objective) => objective.title,
      ),
    ).toContain(
      'Proteger ativos de longo prazo',
    )
  })

  it('cria objetivos ativos e registra quando foram assumidos', () => {
    const objectives =
      createOrganizationObjectives({
        franchiseId: 'sas',
        direction: 'balanced',
        createdDate: '2026-08-07',
      })

    for (const objective of objectives) {
      expect(objective.status).toBe(
        'active',
      )

      expect(objective.createdDate).toBe(
        '2026-08-07',
      )

      expect(objective.id).toContain(
        'sas',
      )

      expect(objective.id).toContain(
        'balanced',
      )

      expect(
        objective.importance,
      ).toBeGreaterThan(0)
    }
  })

  it('não compartilha os mesmos objetos entre gerações', () => {
    const first =
      createOrganizationObjectives({
        franchiseId: 'sas',
        direction: 'rebuild',
        createdDate: '2026-08-07',
      })

    const second =
      createOrganizationObjectives({
        franchiseId: 'sas',
        direction: 'rebuild',
        createdDate: '2026-08-07',
      })

    expect(first).not.toBe(second)

    expect(first[0]).not.toBe(second[0])
  })

  it('aplica a direção escolhida e gera os objetivos no estado da franquia', () => {
    const game =
      createGameWithDirectionDecision()

    const resolved =
      resolveOrganizationDirectionDecision(
        game,
        'initial-direction',
        'rebuild',
      )

    const management =
      resolved.league
        ?.franchiseManagement.sas

    expect(
      management?.organizationDirection,
    ).toBe('rebuild')

    expect(
      management?.objectives,
    ).toHaveLength(3)

    expect(
      management?.objectives[0].status,
    ).toBe('active')
  })

  it('inicia a confiança da direção quando os compromissos são assumidos', () => {
    const game =
      createGameWithDirectionDecision()

    const resolved =
      resolveOrganizationDirectionDecision(
        game,
        'initial-direction',
        'balanced',
      )

    const management =
      resolved.league
        ?.franchiseManagement.sas

    expect(
      management?.ownerTrust,
    ).toBe(60)
  })

  it('inicia a situação do GM como estável', () => {
    const game =
      createGameWithDirectionDecision()

    const resolved =
      resolveOrganizationDirectionDecision(
        game,
        'initial-direction',
        'balanced',
      )

    const management =
      resolved.league
        ?.franchiseManagement.sas

    expect(
      management?.jobSecurity,
    ).toBe('stable')
  })

  it('marca a decisão como resolvida e registra a opção escolhida', () => {
    const game =
      createGameWithDirectionDecision()

    const resolved =
      resolveOrganizationDirectionDecision(
        game,
        'initial-direction',
        'balanced',
      )

    const decision =
      resolved.decisions?.find(
        (item) =>
          item.id === 'initial-direction',
      )

    expect(decision?.status).toBe(
      'resolved',
    )

    expect(
      decision?.selectedOptionId,
    ).toBe('balanced')

    expect(decision?.resolvedDate).toBe(
      game.currentDate,
    )
  })

  it('adiciona uma confirmação na inbox', () => {
    const game =
      createGameWithDirectionDecision()

    const originalInboxLength =
      game.inbox.length

    const resolved =
      resolveOrganizationDirectionDecision(
        game,
        'initial-direction',
        'win-now',
      )

    expect(resolved.inbox).toHaveLength(
      originalInboxLength + 1,
    )

    expect(resolved.inbox[0].title).toBe(
      'Direção da franquia definida',
    )

    expect(resolved.inbox[0].category).toBe(
      'Owner',
    )

    expect(resolved.inbox[0].read).toBe(
      false,
    )

    expect(resolved.inbox[0].kind).toBe(
      'information',
    )
  })

  it('não altera o estado original da carreira', () => {
    const game =
      createGameWithDirectionDecision()

    const originalInboxLength =
      game.inbox.length

    resolveOrganizationDirectionDecision(
      game,
      'initial-direction',
      'balanced',
    )

    const management =
      game.league
        ?.franchiseManagement.sas

    expect(
      management?.organizationDirection,
    ).toBeUndefined()

    expect(
      management?.objectives,
    ).toHaveLength(0)

    expect(
      management?.ownerTrust,
    ).toBeUndefined()

    expect(
      management?.jobSecurity,
    ).toBeUndefined()

    expect(
      game.decisions?.[0].status,
    ).toBe('pending')

    expect(game.inbox).toHaveLength(
      originalInboxLength,
    )
  })

  it('recusa uma direção organizacional inválida', () => {
    const game =
      createGameWithDirectionDecision()

    expect(() =>
      resolveOrganizationDirectionDecision(
        game,
        'initial-direction',
        'all-in',
      ),
    ).toThrow(
      'Direção organizacional inválida',
    )
  })

  it('recusa resolver a direção sem estado da liga', () => {
    const game =
      createGameWithDirectionDecision()

    const invalidGame: GameState = {
      ...game,
      league: undefined,
    }

    expect(() =>
      resolveOrganizationDirectionDecision(
        invalidGame,
        'initial-direction',
        'balanced',
      ),
    ).toThrow(
      'Estado da liga não disponível',
    )
  })

  it('não permite resolver novamente uma decisão já concluída', () => {
    const game =
      createGameWithDirectionDecision()

    const firstResolution =
      resolveOrganizationDirectionDecision(
        game,
        'initial-direction',
        'rebuild',
      )

    expect(() =>
      resolveOrganizationDirectionDecision(
        firstResolution,
        'initial-direction',
        'rebuild',
      ),
    ).toThrow('já foi resolvida')
  })
})
