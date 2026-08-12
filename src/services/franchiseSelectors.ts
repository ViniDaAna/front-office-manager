import {
  franchiseAlignments,
  franchises,
} from '../data/franchises'

import type {
  Franchise,
  FranchiseAlignment,
  FranchiseManagementState,
  GameState,
} from '../domain/types'

export function getFranchiseById(
  franchiseId: string,
): Franchise | null {
  return (
    franchises.find(
      (franchise) => franchise.id === franchiseId,
    ) ?? null
  )
}

export function getFranchiseAlignment(
  franchiseId: string,
): FranchiseAlignment | null {
  return (
    franchiseAlignments.find(
      (alignment) =>
        alignment.franchiseId === franchiseId,
    ) ?? null
  )
}

export function getFranchiseManagement(
  state: GameState,
  franchiseId: string,
): FranchiseManagementState | null {
  return (
    state.league?.franchiseManagement[
      franchiseId
    ] ?? null
  )
}

export function getUserFranchise(
  state: GameState,
): Franchise | null {
  return getFranchiseById(
    state.userFranchiseId,
  )
}

export function getUserFranchiseAlignment(
  state: GameState,
): FranchiseAlignment | null {
  return getFranchiseAlignment(
    state.userFranchiseId,
  )
}

export function getUserFranchiseManagement(
  state: GameState,
): FranchiseManagementState | null {
  return getFranchiseManagement(
    state,
    state.userFranchiseId,
  )
}