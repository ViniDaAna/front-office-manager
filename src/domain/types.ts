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

export interface FranchiseManagementState {
  franchiseId: string

  /*
   * Esses módulos serão preenchidos conforme
   * seus dados oficiais forem carregados.
   *
   * Não usamos valores fictícios apenas para
   * satisfazer o código.
   */
  owner?: OwnerProfile

  organizationDirection?: OrganizationDirection

  ownerTrust?: number
  fanApproval?: number

  jobSecurity?: JobSecurity

  facilities?: FranchiseFacilities
  finances?: FranchiseFinances

  objectives: FranchiseObjective[]
}
/*
 * Estado completo da liga dentro de uma carreira.
 *
 * Aqui ficam informações mutáveis do universo.
 * A identidade estática das franquias continua
 * separada em src/data/franchises.ts.
 */
export interface LeagueState {
  /*
   * Estado administrativo de cada franquia,
   * indexado pelo ID da organização.
   *
   * Exemplo:
   * franchiseManagement['sas']
   * franchiseManagement['bos']
   */
  franchiseManagement: Record<
    string,
    FranchiseManagementState
  >
}
export interface GameState {
    /*
   * Versão estrutural do formato do save.
   *
   * Diferente da versão do jogo.
   * Serve para sabermos como interpretar
   * e migrar carreiras antigas.
   */
  schemaVersion: number
  currentDate: string
  userFranchiseId: string

  inbox: InboxMessage[]
  decisions?: Decision[]

  day: number

  /*
   * Estado do universo da carreira.
   *
   * Está opcional temporariamente para manter
   * compatibilidade com saves criados antes
   * da introdução do LeagueState.
   */
  league?: LeagueState

  /*
   * Campo legado do primeiro protótipo.
   *
   * Será removido somente depois que a direção
   * organizacional estiver completamente migrada
   * para FranchiseManagementState.
   */
  organizationDirection?: OrganizationDirection
}
