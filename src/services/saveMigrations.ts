import { franchises } from '../data/franchises'
import { CURRENT_SCHEMA_VERSION } from '../domain/schema'

import type {
  FranchiseManagementState,
  GameState,
  LeagueState,
  OrganizationDirection,
} from '../domain/types'

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
    typeof value.currentDate === 'string' &&
    typeof value.userFranchiseId === 'string' &&
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

function createEmptyFranchiseManagement(): Record<
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

/*
 * SCHEMA 0 → 1
 */
function migrateSchema0To1(
  save: Record<string, unknown>,
): GameState {
  return {
    ...save,
    schemaVersion: 1,
  } as unknown as GameState
}

/*
 * SCHEMA 1 → 2
 *
 * Introduz o estado administrativo da liga.
 */
function migrateSchema1To2(
  save: GameState,
): GameState {
  const franchiseManagement =
    createEmptyFranchiseManagement()

  if (save.league?.franchiseManagement) {
    for (const franchise of franchises) {
      const existing =
        save.league.franchiseManagement[franchise.id]

      if (existing) {
        franchiseManagement[franchise.id] = {
          ...existing,
          franchiseId: franchise.id,
          objectives: existing.objectives ?? [],
        }
      }
    }
  }

  if (
    isOrganizationDirection(
      save.organizationDirection,
    )
  ) {
    const userManagement =
      franchiseManagement[save.userFranchiseId]

    if (userManagement) {
      userManagement.organizationDirection =
        save.organizationDirection
    }
  }

  const league: LeagueState = {
    franchiseManagement,
  }

  const {
    organizationDirection: _legacyDirection,
    ...saveWithoutLegacyDirection
  } = save

  return {
    ...saveWithoutLegacyDirection,
    schemaVersion: 2,
    league,
  }
}

/*
 * SCHEMA 2 → 3
 *
 * Garante que organizationDirection pertença
 * exclusivamente ao estado administrativo
 * da franquia.
 */
function migrateSchema2To3(
  save: GameState,
): GameState {
  const franchiseManagement =
    createEmptyFranchiseManagement()

  if (save.league?.franchiseManagement) {
    for (const franchise of franchises) {
      const existing =
        save.league.franchiseManagement[franchise.id]

      if (existing) {
        franchiseManagement[franchise.id] = {
          ...existing,
          franchiseId: franchise.id,
          objectives: existing.objectives ?? [],
        }
      }
    }
  }

  if (
    isOrganizationDirection(
      save.organizationDirection,
    )
  ) {
    const userManagement =
      franchiseManagement[save.userFranchiseId]

    /*
     * O valor novo tem prioridade.
     *
     * Isso evita que um campo legado sobrescreva
     * uma informação já migrada corretamente.
     */
    if (
      userManagement &&
      !userManagement.organizationDirection
    ) {
      userManagement.organizationDirection =
        save.organizationDirection
    }
  }

  const league: LeagueState = {
    franchiseManagement,
  }

  const {
    organizationDirection: _legacyDirection,
    ...saveWithoutLegacyDirection
  } = save

  return {
    ...saveWithoutLegacyDirection,
    schemaVersion: 3,
    league,
  }
}

/*
 * Função pública e pura de migração.
 *
 * Não acessa localStorage, navegador ou interface.
 * Recebe um valor desconhecido e devolve:
 *
 * GameState válido na versão atual
 * ou
 * null quando não consegue interpretá-lo com segurança.
 */
export function migrateSave(
  rawSave: unknown,
): GameState | null {
  if (!isObject(rawSave)) {
    return null
  }

  if (!hasBaseGameStateStructure(rawSave)) {
    return null
  }

  let save: GameState

  if (rawSave.schemaVersion === undefined) {
    save = migrateSchema0To1(rawSave)
  } else {
    if (typeof rawSave.schemaVersion !== 'number') {
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

    save = rawSave as unknown as GameState
  }

  while (
    save.schemaVersion <
    CURRENT_SCHEMA_VERSION
  ) {
    switch (save.schemaVersion) {
      case 1:
        save = migrateSchema1To2(save)
        break

      case 2:
        save = migrateSchema2To3(save)
        break

      default:
        console.error(
          `Não existe migração disponível para o schema ${save.schemaVersion}.`,
        )

        return null
    }
  }

  return save
}