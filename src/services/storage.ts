import { franchises } from '../data/franchises'

import type {
  FranchiseManagementState,
  GameState,
  LeagueState,
  OrganizationDirection,
} from '../domain/types'

const SAVE_KEY = 'front-office-manager-save-v1'

const CURRENT_SCHEMA_VERSION = 2

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

function migrateSchema0To1(
  save: Record<string, unknown>,
): GameState {
  return {
    ...save,
    schemaVersion: 1,
  } as unknown as GameState
}

function migrateSchema1To2(
  save: GameState,
): GameState {
  const franchiseManagement =
    createEmptyFranchiseManagement()

  /*
   * Preserva qualquer estado administrativo
   * que já exista no save.
   */
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

  /*
   * No schema antigo, a direção da organização
   * ficava diretamente no GameState.
   *
   * Agora ela pertence ao estado administrativo
   * da franquia controlada pelo jogador.
   */
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

  /*
   * Remove o campo legado do objeto migrado.
   */
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

function migrateSave(
  rawSave: unknown,
): GameState | null {
  if (!isObject(rawSave)) {
    return null
  }

  if (!hasBaseGameStateStructure(rawSave)) {
    return null
  }

  let save: GameState

  /*
   * Saves anteriores ao sistema de versões
   * são tratados como schema 0.
   */
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

  /*
   * Migrações são aplicadas sequencialmente.
   *
   * No futuro:
   * 1 → 2 → 3 → 4...
   */
  while (
    save.schemaVersion <
    CURRENT_SCHEMA_VERSION
  ) {
    switch (save.schemaVersion) {
      case 1:
        save = migrateSchema1To2(save)
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

export function saveGame(
  state: GameState,
): void {
  try {
    const serializedState = JSON.stringify(state)

    localStorage.setItem(
      SAVE_KEY,
      serializedState,
    )
  } catch (error) {
    console.error(
      'Erro ao salvar a carreira:',
      error,
    )
  }
}

export function loadGame(): GameState | null {
  try {
    const savedState =
      localStorage.getItem(SAVE_KEY)

    if (!savedState) {
      return null
    }

    const rawSave: unknown =
      JSON.parse(savedState)

    const migratedSave =
      migrateSave(rawSave)

    if (!migratedSave) {
      console.error(
        'O save existe, mas não pôde ser carregado com segurança.',
      )

      return null
    }

    /*
     * Persistimos novamente quando o save
     * carregado passou por uma migração.
     */
    const originalVersion =
      isObject(rawSave) &&
      typeof rawSave.schemaVersion === 'number'
        ? rawSave.schemaVersion
        : 0

    if (
      originalVersion !==
      migratedSave.schemaVersion
    ) {
      saveGame(migratedSave)
    }

    return migratedSave
  } catch (error) {
    console.error(
      'Erro ao carregar a carreira:',
      error,
    )

    return null
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch (error) {
    console.error(
      'Erro ao apagar a carreira:',
      error,
    )
  }
}
