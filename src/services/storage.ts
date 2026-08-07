import type { GameState } from '../domain/types'

const SAVE_KEY = 'front-office-manager-save-v1'

export function saveGame(state: GameState): void {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(SAVE_KEY, serializedState)
  } catch (error) {
    console.error('Erro ao salvar a carreira:', error)
  }
}

export function loadGame(): GameState | null {
  try {
    const savedState = localStorage.getItem(SAVE_KEY)

    if (!savedState) {
      return null
    }

    const parsedState = JSON.parse(savedState) as GameState

    if (
      !parsedState.currentDate ||
      !parsedState.userFranchiseId ||
      !Array.isArray(parsedState.inbox)
    ) {
      return null
    }

    return parsedState
  } catch (error) {
    console.error('Erro ao carregar a carreira:', error)
    return null
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch (error) {
    console.error('Erro ao apagar a carreira:', error)
  }
}
