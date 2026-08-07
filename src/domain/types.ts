export type InboxCategory =
  | 'Owner'
  | 'Staff'
  | 'Scouting'
  | 'Medical'
  | 'Trade'
  | 'League'
  | 'Player'

export interface InboxMessage {
  id: string
  date: string
  category: InboxCategory
  title: string
  body: string
  read: boolean
  urgent?: boolean
}

export interface GameState {
  currentDate: string
  userFranchiseId: string
  inbox: InboxMessage[]
  day: number
}

export interface Franchise {
  id: string
  city: string
  name: string
  abbreviation: string
  conference: 'East' | 'West'
}
