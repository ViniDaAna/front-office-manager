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

export type SeasonPhase =
  | 'offseason'
  | 'preseason'
  | 'regular-season'
  | 'play-in'
  | 'playoffs'
  | 'completed'

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
 */
export interface FranchiseAlignment {
  franchiseId: string
  conference: Conference
  division: Division
}

/*
 * Perfil do proprietário.
 *
 * Atributos de 1 a 20.
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
 * Estrutura física e operacional.
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
 * Objetivos determinados pela direção.
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
 * Campanha esportiva de uma franquia.
 *
 * Jogos disputados são derivados:
 * wins + losses.
 */
export interface FranchiseSeasonRecord {
  franchiseId: string

  wins: number
  losses: number
}

/*
 * Estado esportivo da temporada atual.
 */
export interface SeasonState {
  id: string

  startYear: number
  endYear: number

  phase: SeasonPhase

  franchiseRecords: Record<
    string,
    FranchiseSeasonRecord
  >
}

/*
 * Estado mutável do universo da liga.
 */
export interface LeagueState {
  franchiseManagement: Record<
    string,
    FranchiseManagementState
  >

  season: SeasonState
}

export interface GameState {
  /*
   * Versão estrutural do formato do save.
   */
  schemaVersion: number

  currentDate: string
  userFranchiseId: string

  inbox: InboxMessage[]
  decisions?: Decision[]

  day: number

  /*
   * Temporariamente opcional para suportar
   * saves muito antigos durante migrações.
   */
  league?: LeagueState
}