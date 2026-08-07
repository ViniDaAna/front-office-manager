export type InboxCategory =
  | 'Owner'
  | 'Staff'
  | 'Scouting'
  | 'Medical'
  | 'Trade'
  | 'League'
  | 'Player'

export type InboxMessageKind = 'information' | 'decision'

export type OrganizationDirection =
  | 'win-now'
  | 'balanced'
  | 'rebuild'

export interface InboxMessage {
  id: string
  date: string
  category: InboxCategory
  title: string
  body: string
  read: boolean
  urgent?: boolean

  // Algumas mensagens serão apenas informativas.
  // Outras exigirão uma decisão do GM.
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

export interface GameState {
  currentDate: string
  userFranchiseId: string
  inbox: InboxMessage[]
  day: number

  // Marco 2: decisões tomadas durante a carreira.
  // Está opcional por enquanto para saves antigos continuarem funcionando.
  decisions?: Decision[]

  // Direção escolhida pelo GM na conversa com o proprietário.
  organizationDirection?: OrganizationDirection
}

export interface Franchise {
  id: string
  city: string
  name: string
  abbreviation: string
  conference: 'East' | 'West'
}
