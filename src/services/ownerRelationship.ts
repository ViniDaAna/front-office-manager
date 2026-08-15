import type {
  JobSecurity,
} from '../domain/types'

const MIN_OWNER_TRUST = 0
const MAX_OWNER_TRUST = 100

export const INITIAL_OWNER_TRUST = 60

export interface OwnerRelationshipState {
  ownerTrust: number
  jobSecurity: JobSecurity
}

export function normalizeOwnerTrust(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    throw new Error(
      'Confiança da direção precisa ser um número válido.',
    )
  }

  return Math.round(
    Math.min(
      MAX_OWNER_TRUST,
      Math.max(
        MIN_OWNER_TRUST,
        value,
      ),
    ),
  )
}

export function getJobSecurityFromOwnerTrust(
  ownerTrust: number,
): JobSecurity {
  const normalizedTrust =
    normalizeOwnerTrust(ownerTrust)

  if (normalizedTrust >= 90) {
    return 'untouchable'
  }

  if (normalizedTrust >= 70) {
    return 'secure'
  }

  if (normalizedTrust >= 50) {
    return 'stable'
  }

  if (normalizedTrust >= 30) {
    return 'under-pressure'
  }

  return 'critical'
}

export function createInitialOwnerRelationship():
  OwnerRelationshipState {
  const ownerTrust =
    INITIAL_OWNER_TRUST

  return {
    ownerTrust,
    jobSecurity:
      getJobSecurityFromOwnerTrust(
        ownerTrust,
      ),
  }
}

export function applyOwnerTrustChange(
  currentOwnerTrust: number,
  change: number,
): OwnerRelationshipState {
  if (!Number.isFinite(change)) {
    throw new Error(
      'Alteração de confiança precisa ser um número válido.',
    )
  }

  const ownerTrust =
    normalizeOwnerTrust(
      currentOwnerTrust + change,
    )

  return {
    ownerTrust,
    jobSecurity:
      getJobSecurityFromOwnerTrust(
        ownerTrust,
      ),
  }
}