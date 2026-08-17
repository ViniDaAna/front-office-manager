import type {
  FranchiseObjective,
  GameState,
  ObjectiveStatus,
} from '../domain/types'

import {
  applyOwnerTrustChange,
} from './ownerRelationship'

type ObjectiveResult =
  | 'completed'
  | 'failed'

interface ObjectiveEvaluation {
  objective: FranchiseObjective
  ownerTrustChange: number
}

function getOwnerTrustChange(
  importance: number,
  result: ObjectiveResult,
): number {
  if (result === 'completed') {
    return importance * 2
  }

  return importance * -3
}

export function evaluateObjective(
  objective: FranchiseObjective,
  result: ObjectiveResult,
): ObjectiveEvaluation {
  if (objective.status !== 'active') {
    throw new Error(
      `Objetivo ${objective.id} já foi avaliado.`,
    )
  }

  return {
    objective: {
      ...objective,
      status: result as ObjectiveStatus,
    },

    ownerTrustChange:
      getOwnerTrustChange(
        objective.importance,
        result,
      ),
  }
}

export function applyObjectiveEvaluation(
  state: GameState,
  objectiveId: string,
  result: ObjectiveResult,
): GameState {
  if (!state.league) {
    throw new Error(
      'Estado da liga não disponível ao avaliar objetivo.',
    )
  }

  const management =
    state.league.franchiseManagement[
      state.userFranchiseId
    ]

  if (!management) {
    throw new Error(
      'Estado administrativo da franquia do usuário não encontrado.',
    )
  }

  if (management.ownerTrust === undefined) {
    throw new Error(
      'Confiança da direção ainda não foi inicializada.',
    )
  }

  const objective =
    management.objectives.find(
      (item) => item.id === objectiveId,
    )

  if (!objective) {
    throw new Error(
      `Objetivo não encontrado: ${objectiveId}`,
    )
  }

  const evaluation =
    evaluateObjective(
      objective,
      result,
    )

  const relationship =
    applyOwnerTrustChange(
      management.ownerTrust,
      evaluation.ownerTrustChange,
    )

  return {
    ...state,

    league: {
      ...state.league,

      franchiseManagement: {
        ...state.league.franchiseManagement,

        [state.userFranchiseId]: {
          ...management,

          objectives:
            management.objectives.map(
              (item) =>
                item.id === objectiveId
                  ? evaluation.objective
                  : item,
            ),

          ownerTrust:
            relationship.ownerTrust,

          jobSecurity:
            relationship.jobSecurity,
        },
      },
    },
  }
}