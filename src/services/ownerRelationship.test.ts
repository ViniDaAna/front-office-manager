import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  applyOwnerTrustChange,
  createInitialOwnerRelationship,
  getJobSecurityFromOwnerTrust,
  normalizeOwnerTrust,
} from './ownerRelationship'

describe('Owner Relationship', () => {
  it('inicia a relação com confiança estável', () => {
    const relationship =
      createInitialOwnerRelationship()

    expect(
      relationship.ownerTrust,
    ).toBe(60)

    expect(
      relationship.jobSecurity,
    ).toBe('stable')
  })

  it('considera o GM intocável com confiança muito alta', () => {
    expect(
      getJobSecurityFromOwnerTrust(90),
    ).toBe('untouchable')
  })

  it('considera o GM seguro com confiança alta', () => {
    expect(
      getJobSecurityFromOwnerTrust(70),
    ).toBe('secure')
  })

  it('considera o cargo estável na faixa intermediária', () => {
    expect(
      getJobSecurityFromOwnerTrust(50),
    ).toBe('stable')
  })

  it('coloca o GM sob pressão quando a confiança cai', () => {
    expect(
      getJobSecurityFromOwnerTrust(30),
    ).toBe('under-pressure')
  })

  it('considera a situação crítica com confiança muito baixa', () => {
    expect(
      getJobSecurityFromOwnerTrust(29),
    ).toBe('critical')
  })

  it('mantém a confiança entre zero e cem', () => {
    expect(
      normalizeOwnerTrust(150),
    ).toBe(100)

    expect(
      normalizeOwnerTrust(-25),
    ).toBe(0)
  })

  it('atualiza confiança e segurança no cargo juntas', () => {
    const positive =
      applyOwnerTrustChange(
        60,
        15,
      )

    expect(
      positive.ownerTrust,
    ).toBe(75)

    expect(
      positive.jobSecurity,
    ).toBe('secure')

    const negative =
      applyOwnerTrustChange(
        60,
        -40,
      )

    expect(
      negative.ownerTrust,
    ).toBe(20)

    expect(
      negative.jobSecurity,
    ).toBe('critical')
  })
})