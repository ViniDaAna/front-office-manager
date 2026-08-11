import { franchises } from '../data/franchises'
import { CURRENT_SCHEMA_VERSION } from '../domain/schema'

import type {
  FranchiseManagementState,
  GameState,
  LeagueState,
  OrganizationDirection,
} from '../domain/types'

const SAVE_KEY = 'front-office-manager-save-v1'

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
 *
 * Saves criados antes da existência de schemaVersion
 * recebem sua primeira versão estrutural.
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
 * Introduz o LeagueState e cria um estado
 * administrativo para todas as franquias.
 *
 * Também preserva a antiga organizationDirection
 * da franquia controlada pelo jogador.
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
 * Consolida organizationDirection dentro do
 * FranchiseManagementState.
 *
 * Alguns saves schema 2 ainda podem possuir
 * uma cópia antiga da direção diretamente
 * no GameState. Esta migração preserva esse dado
 * antes de remover o campo legado.
 *
 * IMPORTANTE:
 * Esta migração já está preparada, mas somente
 * será executada quando CURRENT_SCHEMA_VERSION
 * passar oficialmente para 3.
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
   * Saves anteriores ao versionamento
   * são considerados schema 0.
   */
  if (rawSave.schemaVersion === undefined) {
    save = migrateSchema0To1(rawSave)
  } else {
    if (typeof rawSave.schemaVersion !== 'number') {
      return null
    }

    /*
     * Nunca tentamos interpretar silenciosamente
     * um save criado por uma versão estrutural
     * mais nova do que esta versão do jogo conhece.
     */
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
   * Cada migração acontece em sequência.
   *
   * Exemplo futuro:
   *
   * 1 → 2 → 3 → 4 → 5
   *
   * Assim um save muito antigo não precisa
   * conhecer diretamente o formato mais recente.
   */
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

export function saveGame(
  state: GameState,
): void {
  try {
    const serializedState =
      JSON.stringify(state)

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
     * Descobrimos qual era a versão original
     * para saber se houve migração.
     */
    const originalVersion =
      isObject(rawSave) &&
      typeof rawSave.schemaVersion === 'number'
        ? rawSave.schemaVersion
        : 0

    /*
     * Se houve migração, persistimos imediatamente
     * o save já no formato atualizado.
     */
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
