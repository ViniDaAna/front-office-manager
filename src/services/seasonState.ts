import { franchises } from '../data/franchises'

import type {
  FranchiseSeasonRecord,
  SeasonState,
} from '../domain/types'

export const INITIAL_SEASON_ID =
  '2026-27'

export const INITIAL_SEASON_START_YEAR =
  2026

export const INITIAL_SEASON_END_YEAR =
  2027

function createInitialFranchiseRecords(): Record<
  string,
  FranchiseSeasonRecord
> {
  return Object.fromEntries(
    franchises.map((franchise) => [
      franchise.id,
      {
        franchiseId: franchise.id,
        wins: 0,
        losses: 0,
      },
    ]),
  )
}

export function createInitialSeasonState():
  SeasonState {
  return {
    id: INITIAL_SEASON_ID,

    startYear:
      INITIAL_SEASON_START_YEAR,

    endYear:
      INITIAL_SEASON_END_YEAR,

    phase: 'offseason',

    franchiseRecords:
      createInitialFranchiseRecords(),
  }
}

export function getGamesPlayed(
  record: FranchiseSeasonRecord,
): number {
  return record.wins + record.losses
}

export function getWinningPercentage(
  record: FranchiseSeasonRecord,
): number {
  const gamesPlayed =
    getGamesPlayed(record)

  if (gamesPlayed === 0) {
    return 0
  }

  return record.wins / gamesPlayed
}