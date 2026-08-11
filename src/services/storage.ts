import type { GameState } from '../domain/types'
import { migrateSave } from './saveMigrations'

const SAVE_KEY = 'front-office-manager-save-v1'

function getOriginalSchemaVersion(
  rawSave: unknown,
): number {
  if (
    typeof rawSave === 'object' &&
    rawSave !== null &&
    !Array.isArray(rawSave) &&
    'schemaVersion' in rawSave &&
    typeof rawSave.schemaVersion === 'number'
  ) {
    return rawSave.schemaVersion
  }

  /*
   * Saves anteriores ao sistema de versionamento
   * são considerados schema 0.
   */
  return 0
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

    const originalSchemaVersion =
      getOriginalSchemaVersion(rawSave)

    const migratedSave =
      migrateSave(rawSave)

    if (!migratedSave) {
      console.error(
        'O save existe, mas não pôde ser carregado com segurança.',
      )

      return null
    }

    /*
     * Se a carreira passou por alguma migração,
     * persistimos imediatamente o formato novo.
     *
     * Assim o mesmo save não precisa ser migrado
     * novamente toda vez que o jogo abrir.
     */
    if (
      originalSchemaVersion !==
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