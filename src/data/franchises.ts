import type {
  Franchise,
  FranchiseAlignment,
} from '../domain/types'

export const franchises: Franchise[] = [
  // EASTERN CONFERENCE

  {
    id: 'atl',
    city: 'Atlanta',
    name: 'Hawks',
    abbreviation: 'ATL',
    conference: 'East',
  },
  {
    id: 'bos',
    city: 'Boston',
    name: 'Celtics',
    abbreviation: 'BOS',
    conference: 'East',
  },
  {
    id: 'bkn',
    city: 'Brooklyn',
    name: 'Nets',
    abbreviation: 'BKN',
    conference: 'East',
  },
  {
    id: 'cha',
    city: 'Charlotte',
    name: 'Hornets',
    abbreviation: 'CHA',
    conference: 'East',
  },
  {
    id: 'chi',
    city: 'Chicago',
    name: 'Bulls',
    abbreviation: 'CHI',
    conference: 'East',
  },
  {
    id: 'cle',
    city: 'Cleveland',
    name: 'Cavaliers',
    abbreviation: 'CLE',
    conference: 'East',
  },
  {
    id: 'det',
    city: 'Detroit',
    name: 'Pistons',
    abbreviation: 'DET',
    conference: 'East',
  },
  {
    id: 'ind',
    city: 'Indiana',
    name: 'Pacers',
    abbreviation: 'IND',
    conference: 'East',
  },
  {
    id: 'mia',
    city: 'Miami',
    name: 'Heat',
    abbreviation: 'MIA',
    conference: 'East',
  },
  {
    id: 'mil',
    city: 'Milwaukee',
    name: 'Bucks',
    abbreviation: 'MIL',
    conference: 'East',
  },
  {
    id: 'nyk',
    city: 'New York',
    name: 'Knicks',
    abbreviation: 'NYK',
    conference: 'East',
  },
  {
    id: 'orl',
    city: 'Orlando',
    name: 'Magic',
    abbreviation: 'ORL',
    conference: 'East',
  },
  {
    id: 'phi',
    city: 'Philadelphia',
    name: '76ers',
    abbreviation: 'PHI',
    conference: 'East',
  },
  {
    id: 'tor',
    city: 'Toronto',
    name: 'Raptors',
    abbreviation: 'TOR',
    conference: 'East',
  },
  {
    id: 'was',
    city: 'Washington',
    name: 'Wizards',
    abbreviation: 'WAS',
    conference: 'East',
  },

  // WESTERN CONFERENCE

  {
    id: 'dal',
    city: 'Dallas',
    name: 'Mavericks',
    abbreviation: 'DAL',
    conference: 'West',
  },
  {
    id: 'den',
    city: 'Denver',
    name: 'Nuggets',
    abbreviation: 'DEN',
    conference: 'West',
  },
  {
    id: 'gsw',
    city: 'Golden State',
    name: 'Warriors',
    abbreviation: 'GSW',
    conference: 'West',
  },
  {
    id: 'hou',
    city: 'Houston',
    name: 'Rockets',
    abbreviation: 'HOU',
    conference: 'West',
  },
  {
    id: 'lac',
    city: 'Los Angeles',
    name: 'Clippers',
    abbreviation: 'LAC',
    conference: 'West',
  },
  {
    id: 'lal',
    city: 'Los Angeles',
    name: 'Lakers',
    abbreviation: 'LAL',
    conference: 'West',
  },
  {
    id: 'mem',
    city: 'Memphis',
    name: 'Grizzlies',
    abbreviation: 'MEM',
    conference: 'West',
  },
  {
    id: 'min',
    city: 'Minnesota',
    name: 'Timberwolves',
    abbreviation: 'MIN',
    conference: 'West',
  },
  {
    id: 'nop',
    city: 'New Orleans',
    name: 'Pelicans',
    abbreviation: 'NOP',
    conference: 'West',
  },
  {
    id: 'okc',
    city: 'Oklahoma City',
    name: 'Thunder',
    abbreviation: 'OKC',
    conference: 'West',
  },
  {
    id: 'phx',
    city: 'Phoenix',
    name: 'Suns',
    abbreviation: 'PHX',
    conference: 'West',
  },
  {
    id: 'por',
    city: 'Portland',
    name: 'Trail Blazers',
    abbreviation: 'POR',
    conference: 'West',
  },
  {
    id: 'sac',
    city: 'Sacramento',
    name: 'Kings',
    abbreviation: 'SAC',
    conference: 'West',
  },
  {
    id: 'sas',
    city: 'San Antonio',
    name: 'Spurs',
    abbreviation: 'SAS',
    conference: 'West',
  },
  {
    id: 'uta',
    city: 'Utah',
    name: 'Jazz',
    abbreviation: 'UTA',
    conference: 'West',
  },
]

export const franchiseAlignments: FranchiseAlignment[] = [
  // ATLANTIC
  {
    franchiseId: 'bos',
    conference: 'East',
    division: 'Atlantic',
  },
  {
    franchiseId: 'bkn',
    conference: 'East',
    division: 'Atlantic',
  },
  {
    franchiseId: 'nyk',
    conference: 'East',
    division: 'Atlantic',
  },
  {
    franchiseId: 'phi',
    conference: 'East',
    division: 'Atlantic',
  },
  {
    franchiseId: 'tor',
    conference: 'East',
    division: 'Atlantic',
  },

  // CENTRAL
  {
    franchiseId: 'chi',
    conference: 'East',
    division: 'Central',
  },
  {
    franchiseId: 'cle',
    conference: 'East',
    division: 'Central',
  },
  {
    franchiseId: 'det',
    conference: 'East',
    division: 'Central',
  },
  {
    franchiseId: 'ind',
    conference: 'East',
    division: 'Central',
  },
  {
    franchiseId: 'mil',
    conference: 'East',
    division: 'Central',
  },

  // SOUTHEAST
  {
    franchiseId: 'atl',
    conference: 'East',
    division: 'Southeast',
  },
  {
    franchiseId: 'cha',
    conference: 'East',
    division: 'Southeast',
  },
  {
    franchiseId: 'mia',
    conference: 'East',
    division: 'Southeast',
  },
  {
    franchiseId: 'orl',
    conference: 'East',
    division: 'Southeast',
  },
  {
    franchiseId: 'was',
    conference: 'East',
    division: 'Southeast',
  },

  // NORTHWEST
  {
    franchiseId: 'den',
    conference: 'West',
    division: 'Northwest',
  },
  {
    franchiseId: 'min',
    conference: 'West',
    division: 'Northwest',
  },
  {
    franchiseId: 'okc',
    conference: 'West',
    division: 'Northwest',
  },
  {
    franchiseId: 'por',
    conference: 'West',
    division: 'Northwest',
  },
  {
    franchiseId: 'uta',
    conference: 'West',
    division: 'Northwest',
  },

  // PACIFIC
  {
    franchiseId: 'gsw',
    conference: 'West',
    division: 'Pacific',
  },
  {
    franchiseId: 'lac',
    conference: 'West',
    division: 'Pacific',
  },
  {
    franchiseId: 'lal',
    conference: 'West',
    division: 'Pacific',
  },
  {
    franchiseId: 'phx',
    conference: 'West',
    division: 'Pacific',
  },
  {
    franchiseId: 'sac',
    conference: 'West',
    division: 'Pacific',
  },

  // SOUTHWEST
  {
    franchiseId: 'dal',
    conference: 'West',
    division: 'Southwest',
  },
  {
    franchiseId: 'hou',
    conference: 'West',
    division: 'Southwest',
  },
  {
    franchiseId: 'mem',
    conference: 'West',
    division: 'Southwest',
  },
  {
    franchiseId: 'nop',
    conference: 'West',
    division: 'Southwest',
  },
  {
    franchiseId: 'sas',
    conference: 'West',
    division: 'Southwest',
  },
]
