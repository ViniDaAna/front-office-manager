import { franchises } from '../data/franchises'

import type {
  FranchiseSeasonRecord,
  SeasonPhase,
  SeasonState,
} from '../domain/types'

export const INITIAL_SEASON_ID =
  '2026-27'

export const INITIAL_SEASON_START_YEAR =
  2026

export const INITIAL_SEASON_END_YEAR =
  2027

/*
 * Primeira data esportiva oficialmente
 * conhecida da temporada 2026-27.
 *
 * Conforme novas datas oficiais forem
 * adicionadas ao calendário da NBA,
 * esta lógica poderá ser expandida para
 * regular season, play-in e playoffs.
 */
export const PRESEASON_START_DATE =
  '2026-10-03'

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

export function getSeasonPhaseForDate(
  date: string,
): SeasonPhase {
  if (date >= PRESEASON_START_DATE) {
    return 'preseason'
  }

  return 'offseason'
}

export function updateSeasonPhaseForDate(
  season: SeasonState,
  date: string,
): SeasonState {
  const phase =
    getSeasonPhaseForDate(date)

  if (phase === season.phase) {
    return season
  }

  return {
    ...season,
    phase,
  }
}

export function createInitialSeasonState():
  SeasonState {
  return {
    id: INITIAL_SEASON_ID,

    startYear:
      INITIAL_SEASON_START_YEAR,

    endYear:
      INITIAL_SEASON_END_YEAR,

    phase:
      getSeasonPhaseForDate(
        '2026-08-07',
      ),

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