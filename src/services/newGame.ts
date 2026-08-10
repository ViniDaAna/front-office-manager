import { franchises } from '../data/franchises'
import type {
  FranchiseManagementState,
  GameState,
  InboxMessage,
  LeagueState,
} from '../domain/types'

const START_DATE = '2026-08-07'

function createInitialInbox(): InboxMessage[] {
  return [
    {
      id: 'welcome-1',
      date: START_DATE,
      category: 'Owner',
      title: 'Bem-vindo ao front office',
      body:
        'Sua primeira responsabilidade é definir a direção da organização. O mundo da liga continuará avançando mesmo quando você não estiver envolvido diretamente em cada decisão.',
      read: false,
      kind: 'information',
    },
    {
      id: 'welcome-2',
      date: START_DATE,
      category: 'Staff',
      title: 'Reunião inicial com a comissão',
      body:
        'A estrutura atual de staff será avaliada nas próximas versões. Cada funcionário terá carreira, atributos, contrato, reputação e ambições próprias.',
      read: false,
      kind: 'information',
    },
  ]
}

function createInitialFranchiseManagement(): Record<
  string,
  FranchiseManagementState
> {
  return Object.fromEntries(
    franchises.map((franchise) => [
      franchise.id,
      {
        franchiseId: franchise.id,
        objectives: [],
      },
    ]),
  )
}

function createInitialLeagueState(): LeagueState {
  return {
    franchiseManagement: createInitialFranchiseManagement(),
  }
}
function validateInitialLeagueState(
  league: LeagueState,
): void {
  const franchiseIds = franchises.map(
    (franchise) => franchise.id,
  )

  const uniqueFranchiseIds = new Set(franchiseIds)

  if (uniqueFranchiseIds.size !== franchises.length) {
    throw new Error(
      'Existem IDs de franquia duplicados nos dados da liga.',
    )
  }

  const managementIds = Object.keys(
    league.franchiseManagement,
  )

  if (managementIds.length !== franchises.length) {
    throw new Error(
      `Estado inicial inválido: esperado ${franchises.length} franquias, encontrado ${managementIds.length}.`,
    )
  }

  const missingFranchises = franchiseIds.filter(
    (franchiseId) =>
      !league.franchiseManagement[franchiseId],
  )

  if (missingFranchises.length > 0) {
    throw new Error(
      `Franquias ausentes no estado inicial: ${missingFranchises.join(', ')}`,
    )
  }
}
export function createNewGame(
  userFranchiseId: string,
): GameState {
  const franchiseExists = franchises.some(
    (franchise) => franchise.id === userFranchiseId,
  )

  if (!franchiseExists) {
    throw new Error(
      `Franquia inválida ao criar carreira: ${userFranchiseId}`,
    )
  }
const league = createInitialLeagueState()

validateInitialLeagueState(league)
  return {
    currentDate: START_DATE,
    userFranchiseId,

    inbox: createInitialInbox(),
    decisions: [],

    day: 0,

    league,
  }
}
