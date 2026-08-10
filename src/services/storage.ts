import type { GameState } from '../domain/types'

const SAVE_KEY = 'front-office-manager-save-v1'

const CURRENT_SCHEMA_VERSION = 1

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

function migrateSave(
  rawSave: unknown,
): GameState | null {
  if (!isObject(rawSave)) {
    return null
  }

  if (!hasBaseGameStateStructure(rawSave)) {
    return null
  }

  /*
   * Saves criados antes da introdução do
   * schemaVersion são considerados schema 0.
   *
   * A primeira migração apenas adiciona
   * a versão estrutural.
   */
  if (rawSave.schemaVersion === undefined) {
    return {
      ...rawSave,
      schemaVersion: 1,
    } as unknown as GameState
  }

  if (typeof rawSave.schemaVersion !== 'number') {
    return null
  }

  /*
   * Save já está na versão atual.
   */
  if (rawSave.schemaVersion === CURRENT_SCHEMA_VERSION) {
    return rawSave as unknown as GameState
  }

  /*
   * Se um save tiver sido criado por uma versão
   * futura do jogo, esta versão atual não tenta
   * interpretá-lo silenciosamente.
   */
  if (rawSave.schemaVersion > CURRENT_SCHEMA_VERSION) {
    console.error(
      `Este save usa schema ${rawSave.schemaVersion}, mas o jogo suporta até schema ${CURRENT_SCHEMA_VERSION}.`,
    )

    return null
  }

  /*
   * Futuras migrações serão encadeadas aqui.
   *
   * Exemplo:
   * schema 1 → schema 2
   * schema 2 → schema 3
   */
  return null
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
    const savedState = localStorage.getItem(
      SAVE_KEY,
    )

    if (!savedState) {
      return null
    }

    const rawSave: unknown = JSON.parse(savedState)

    const migratedSave = migrateSave(rawSave)

    if (!migratedSave) {
      console.error(
        'O save existe, mas não pôde ser carregado com segurança.',
      )

      return null
    }

    /*
     * Se um save antigo foi migrado,
     * já persistimos sua versão atualizada.
     */
    if (
      isObject(rawSave) &&
      rawSave.schemaVersion !==
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
