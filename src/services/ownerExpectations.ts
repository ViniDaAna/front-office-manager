import type {
  FranchiseObjective,
  GameState,
  InboxMessage,
  ObjectiveCategory,
  OrganizationDirection,
} from '../domain/types'

import {
  createInitialOwnerRelationship,
} from './ownerRelationship'

interface ObjectiveTemplate {
  key: string
  category: ObjectiveCategory
  title: string
  description: string
  importance: number
}

export const ORGANIZATION_DIRECTIONS:
  readonly OrganizationDirection[] = [
    'win-now',
    'balanced',
    'rebuild',
  ]

export function isOrganizationDirection(
  value: string,
): value is OrganizationDirection {
  return ORGANIZATION_DIRECTIONS.includes(
    value as OrganizationDirection,
  )
}

const objectiveTemplates: Record<
  OrganizationDirection,
  ObjectiveTemplate[]
> = {
  'win-now': [
    {
      key: 'contend',
      category: 'competitive',
      title: 'Disputar em alto nível',
      description:
        'A direção espera uma temporada voltada para resultados imediatos e presença forte na pós-temporada.',
      importance: 5,
    },
    {
      key: 'improve-roster',
      category: 'roster',
      title: 'Elevar o nível do elenco',
      description:
        'Use os recursos disponíveis para fortalecer a equipe sempre que surgir uma oportunidade coerente.',
      importance: 5,
    },
    {
      key: 'maximize-window',
      category: 'competitive',
      title: 'Aproveitar a janela competitiva',
      description:
        'Decisões de curto prazo serão avaliadas principalmente pelo impacto na capacidade atual de vencer.',
      importance: 4,
    },
  ],

  balanced: [
    {
      key: 'stay-competitive',
      category: 'competitive',
      title: 'Manter a equipe competitiva',
      description:
        'A organização espera resultados sem transformar toda decisão em uma aposta exclusiva no curto prazo.',
      importance: 4,
    },
    {
      key: 'protect-flexibility',
      category: 'roster',
      title: 'Preservar flexibilidade',
      description:
        'Evite comprometer excessivamente o futuro da franquia por ganhos marginais no presente.',
      importance: 4,
    },
    {
      key: 'develop-talent',
      category: 'development',
      title: 'Desenvolver talento interno',
      description:
        'Crie espaço para que jogadores em desenvolvimento possam evoluir sem abandonar a competitividade.',
      importance: 3,
    },
  ],

  rebuild: [
    {
      key: 'develop-young-core',
      category: 'development',
      title: 'Priorizar o desenvolvimento jovem',
      description:
        'A evolução de jogadores jovens deve pesar mais que resultados imediatos durante esta fase da organização.',
      importance: 5,
    },
    {
      key: 'protect-assets',
      category: 'roster',
      title: 'Proteger ativos de longo prazo',
      description:
        'Escolhas de elenco devem preservar ou aumentar o patrimônio futuro da franquia.',
      importance: 5,
    },
    {
      key: 'financial-flexibility',
      category: 'financial',
      title: 'Preservar flexibilidade financeira',
      description:
        'Evite compromissos que dificultem a construção do próximo núcleo competitivo.',
      importance: 4,
    },
  ],
}

interface CreateOrganizationObjectivesInput {
  franchiseId: string
  direction: OrganizationDirection
  createdDate: string
}

export function createOrganizationObjectives({
  franchiseId,
  direction,
  createdDate,
}: CreateOrganizationObjectivesInput): FranchiseObjective[] {
  return objectiveTemplates[direction].map(
    (template) => ({
      id: [
        franchiseId,
        direction,
        template.key,
        createdDate,
      ].join('-'),

      category: template.category,

      title: template.title,
      description: template.description,

      importance: template.importance,

      status: 'active',

      createdDate,
    }),
  )
}

function getOrganizationDirectionResultText(
  direction: OrganizationDirection,
): string {
  if (direction === 'win-now') {
    return 'Você deixou claro que resultados imediatos são a prioridade. A direção espera agressividade na montagem do elenco e não aceitará facilmente uma temporada abaixo das expectativas.'
  }

  if (direction === 'balanced') {
    return 'Você prometeu competir sem hipotecar o futuro da organização. A direção espera equilíbrio entre resultados, desenvolvimento e flexibilidade financeira.'
  }

  return 'Você pediu paciência para construir uma estrutura sustentável. A direção aceitará algum sacrifício imediato, mas espera desenvolvimento de jovens e acúmulo inteligente de ativos.'
}

export function resolveOrganizationDirectionDecision(
  state: GameState,
  decisionId: string,
  optionId: string,
): GameState {
  if (!isOrganizationDirection(optionId)) {
    throw new Error(
      `Direção organizacional inválida: ${optionId}`,
    )
  }

  if (!state.league) {
    throw new Error(
      'Estado da liga não disponível ao resolver a direção organizacional.',
    )
  }

  const decision = state.decisions?.find(
    (item) => item.id === decisionId,
  )

  if (!decision) {
    throw new Error(
      `Decisão não encontrada: ${decisionId}`,
    )
  }

  if (decision.status !== 'pending') {
    throw new Error(
      `A decisão ${decisionId} já foi resolvida.`,
    )
  }

  const currentManagement =
    state.league.franchiseManagement[
      state.userFranchiseId
    ]

  if (!currentManagement) {
    throw new Error(
      'Estado administrativo da franquia do usuário não encontrado.',
    )
  }

  const objectives =
    createOrganizationObjectives({
      franchiseId: state.userFranchiseId,
      direction: optionId,
      createdDate: state.currentDate,
    })

  const relationship =
    createInitialOwnerRelationship()

  const confirmationMessage:
    InboxMessage = {
    id: `decision-result-${decision.id}`,
    date: state.currentDate,
    category: decision.category,
    title: 'Direção da franquia definida',
    body: getOrganizationDirectionResultText(
      optionId,
    ),
    read: false,
    kind: 'information',
  }

  return {
    ...state,

    league: {
      ...state.league,

      franchiseManagement: {
        ...state.league.franchiseManagement,

        [state.userFranchiseId]: {
          ...currentManagement,

          organizationDirection: optionId,

          objectives,

          ownerTrust:
            relationship.ownerTrust,

          jobSecurity:
            relationship.jobSecurity,
        },
      },
    },

    decisions:
      state.decisions?.map((item) =>
        item.id === decision.id
          ? {
              ...item,
              status: 'resolved',
              selectedOptionId: optionId,
              resolvedDate: state.currentDate,
            }
          : item,
      ) ?? [],

    inbox: [
      confirmationMessage,
      ...state.inbox,
    ],
  }
}