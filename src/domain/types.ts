export type InboxCategory =
  | 'Owner'
  | 'Staff'
  | 'Scouting'
  | 'Medical'
  | 'Trade'
  | 'League'
  | 'Player'

export type InboxMessageKind =
  | 'information'
  | 'decision'

export type Conference =
  | 'East'
  | 'West'

export type Division =
  | 'Atlantic'
  | 'Central'
  | 'Southeast'
  | 'Northwest'
  | 'Pacific'
  | 'Southwest'

export type OrganizationDirection =
  | 'win-now'
  | 'balanced'
  | 'rebuild'

export type MarketSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'mega'

export type OwnerPriority =
  | 'winning'
  | 'profit'
  | 'development'
  | 'stability'
  | 'prestige'

export type JobSecurity =
  | 'untouchable'
  | 'secure'
  | 'stable'
  | 'under-pressure'
  | 'critical'

export type ObjectiveStatus =
  | 'active'
  | 'completed'
  | 'failed'

export type ObjectiveCategory =
  | 'competitive'
  | 'development'
  | 'financial'
  | 'roster'
  | 'culture'

export interface InboxMessage {
  id: string
  date: string
  category: InboxCategory
  title: string
  body: string
  read: boolean
  urgent?: boolean

  kind?: InboxMessageKind
  decisionId?: string
}

export interface DecisionOption {
  id: string
  label: string
  description: string
}

export interface Decision {
  id: string
  date: string
  category: InboxCategory
  title: string
  prompt: string

  options: DecisionOption[]

  status: 'pending' | 'resolved'

  selectedOptionId?: string
  resolvedDate?: string
}

/*
 * Identidade da franquia.
 *
 * Representa aquilo que define quem a franquia é.
 * Não deve carregar informações temporárias da carreira.
 */
export interface Franchise {
  id: string
  city: string
  name: string
  abbreviation: string
  conference: Conference
}

/*
 * Alinhamento da liga.
 *
 * Mantemos isso separado porque conferências e divisões
 * podem mudar futuramente com expansões e realinhamentos.
 */
export interface FranchiseAlignment {
  franchiseId: string
  conference: Conference
  division: Division
}

/*
 * Perfil do proprietário.
 *
 * Os atributos usam escala de 1 a 20,
 * seguindo a filosofia de leitura do Football Manager.
 */
export interface OwnerProfile {
  id: string
  name: string

  patience: number
  ambition: number
  willingnessToSpend: number
  interference: number

  priority: OwnerPriority
}

/*
 * Estrutura física e operacional da franquia.
 *
 * Escala de 1 a 20.
 */
export interface FranchiseFacilities {
  training: number
  medical: number
  playerDevelopment: number
  scouting: number
  analytics: number
}

/*
 * Perfil econômico da organização.
 *
 * Valores monetários serão armazenados em dólares inteiros.
 * Exemplo:
 * 25 milhões = 25000000
 */
export interface FranchiseFinances {
  marketSize: MarketSize

  marketAppeal: number
  financialHealth: number

  staffBudget: number
  scoutingBudget: number
  developmentBudget: number
  medicalBudget: number
}

/*
 * Objetivos determinados pelo proprietário.
 *
 * Eles poderão ser avaliados durante e ao final
 * de cada temporada.
 */
export interface FranchiseObjective {
  id: string

  category: ObjectiveCategory

  title: string
  description: string

  importance: number

  status: ObjectiveStatus

  createdDate: string
  deadlineDate?: string
}

/*
 * Estado administrativo de uma franquia dentro de um save.
 *
 * Esse objeto pode mudar completamente com o passar
 * das temporadas sem alterar a identidade da franquia.
 */
export interface FranchiseManagementState {
  franchiseId: string

  owner: OwnerProfile

  organizationDirection?: OrganizationDirection

  ownerTrust: number
  fanApproval: number

  jobSecurity: JobSecurity

  facilities: FranchiseFacilities
  finances: FranchiseFinances

  objectives: FranchiseObjective[]
}

export interface GameState {
  currentDate: string
  userFranchiseId: string

  inbox: InboxMessage[]
  decisions?: Decision[]

  day: number

  /*
   * Ainda utilizado pelo protótipo atual.
   *
   * Quando o módulo de franquia estiver conectado
   * ao mundo completo, essa informação passará
   * a viver dentro de FranchiseManagementState.
   */
  organizationDirection?: OrganizationDirection
}
