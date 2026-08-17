import { franchises } from '../data/franchises'
import { CURRENT_SCHEMA_VERSION } from '../domain/schema'

import type {
  FranchiseManagementState,
  GameState,
  LeagueState,
  OrganizationDirection,
  SeasonState,
} from '../domain/types'

import {
  createInitialSeasonState,
} from './seasonState'

/*
 * Formato de liga usado por saves anteriores
 * ao schema 4.
 *
 * Eles já possuíam franchiseManagement,
 * mas ainda não eram obrigados a possuir
 * uma temporada esportiva.
 */
interface LegacyLeagueState {
  franchiseManagement: Record<
    string,
    FranchiseManagementState
  >

  season?: SeasonState
}

/*
 * Estrutura capaz de representar versões
 * antigas durante o processo de migração.
 */
type LegacyGameState =
  Omit<GameState, 'league'> & {
    league?: LegacyLeagueState

    organizationDirection?:
      OrganizationDirection
  }

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function hasBaseGameStateStructure(
  value: Record<string, unknown>,
): boolean {
  return (
    typeof value.currentDate ===
      'string' &&
    typeof value.userFranchiseId ===
      'string' &&
    Array.isArray(value.inbox) &&
    typeof value.day === 'number'
  )
}

function isOrganizationDirection(
  value: unknown,
): value is OrganizationDirection {
  return (
    value === 'win-now' ||
    value === 'balanced' ||
    value === 'rebuild'
  )
}

function createEmptyFranchiseManagement():
  Record<
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

function preserveFranchiseManagement(
  save: LegacyGameState,
): Record<
  string,
  FranchiseManagementState
> {
  const franchiseManagement =
    createEmptyFranchiseManagement()

  if (
    save.league
      ?.franchiseManagement
  ) {
    for (const franchise of franchises) {
      const existing =
        save.league
          .franchiseManagement[
            franchise.id
          ]

      if (existing) {
        franchiseManagement[
          franchise.id
        ] = {
          ...existing,

          franchiseId:
            franchise.id,

          objectives:
            existing.objectives ?? [],
        }
      }
    }
  }

  return franchiseManagement
}

/*
 * SCHEMA 0 → 1
 */
function migrateSchema0To1(
  save: Record<string, unknown>,
): LegacyGameState {
  return {
    ...save,
    schemaVersion: 1,
  } as unknown as LegacyGameState
}

/*
 * SCHEMA 1 → 2
 *
 * Introduz o estado administrativo
 * da liga.
 */
function migrateSchema1To2(
  save: LegacyGameState,
): LegacyGameState {
  const franchiseManagement =
    preserveFranchiseManagement(save)

  if (
    isOrganizationDirection(
      save.organizationDirection,
    )
  ) {
    const userManagement =
      franchiseManagement[
        save.userFranchiseId
      ]

    if (userManagement) {
      userManagement.organizationDirection =
        save.organizationDirection
    }
  }

  const league: LegacyLeagueState = {
    franchiseManagement,
  }

  const {
    organizationDirection:
      _legacyDirection,
    ...saveWithoutLegacyDirection
  } = save

  return {
    ...saveWithoutLegacyDirection,

    schemaVersion: 2,

    league,
  } as LegacyGameState
}

/*
 * SCHEMA 2 → 3
 *
 * Consolida organizationDirection dentro
 * do FranchiseManagementState.
 */
function migrateSchema2To3(
  save: LegacyGameState,
): LegacyGameState {
  const franchiseManagement =
    preserveFranchiseManagement(save)

  if (
    isOrganizationDirection(
      save.organizationDirection,
    )
  ) {
    const userManagement =
      franchiseManagement[
        save.userFranchiseId
      ]

    if (
      userManagement &&
      !userManagement
        .organizationDirection
    ) {
      userManagement.organizationDirection =
        save.organizationDirection
    }
  }

  const league: LegacyLeagueState = {
    franchiseManagement,
  }

  const {
    organizationDirection:
      _legacyDirection,
    ...saveWithoutLegacyDirection
  } = save

  return {
    ...saveWithoutLegacyDirection,

    schemaVersion: 3,

    league,
  }
}

/*
 * SCHEMA 3 → 4
 *
 * Introduz o estado esportivo da
 * temporada dentro da liga.
 *
 * Saves antigos começam na temporada
 * inicial 2026-27, com todas as franquias
 * em 0-0.
 */
function migrateSchema3To4(
  save: LegacyGameState,
): GameState {
  const franchiseManagement =
    preserveFranchiseManagement(save)

  const season =
    save.league?.season ??
    createInitialSeasonState()

  const league: LeagueState = {
    franchiseManagement,
    season,
  }

  const {
    organizationDirection:
      _legacyDirection,
    ...saveWithoutLegacyDirection
  } = save

  return {
    ...saveWithoutLegacyDirection,

    schemaVersion: 4,

    league,
  }
}

/*
 * Função pública e pura de migração.
 */
export function migrateSave(
  rawSave: unknown,
): GameState | null {
  if (!isObject(rawSave)) {
    return null
  }

  if (
    !hasBaseGameStateStructure(
      rawSave,
    )
  ) {
    return null
  }

  let save: LegacyGameState

  if (
    rawSave.schemaVersion ===
    undefined
  ) {
    save =
      migrateSchema0To1(rawSave)
  } else {
    if (
      typeof rawSave.schemaVersion !==
      'number'
    ) {
      return null
    }

    if (
      rawSave.schemaVersion >
      CURRENT_SCHEMA_VERSION
    ) {
      console.error(
        `Este save usa schema ${rawSave.schemaVersion}, mas o jogo suporta até schema ${CURRENT_SCHEMA_VERSION}.`,
      )

      return null
    }

    save =
      rawSave as unknown as
        LegacyGameState
  }

  /*
   * Uma carreira antiga percorre todas
   * as migrações necessárias:
   *
   * 0 → 1 → 2 → 3 → 4
   */
  while (
    save.schemaVersion <
    CURRENT_SCHEMA_VERSION
  ) {
    switch (save.schemaVersion) {
      case 1:
        save =
          migrateSchema1To2(save)
        break

      case 2:
        save =
          migrateSchema2To3(save)
        break

      case 3:
        save =
          migrateSchema3To4(save)
        break

      default:
        console.error(
          `Não existe migração disponível para o schema ${save.schemaVersion}.`,
        )

        return null
    }
  }

  return save as unknown as GameState
}