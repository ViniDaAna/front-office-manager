import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { CURRENT_SCHEMA_VERSION } from '../domain/schema'
import { migrateSave } from './saveMigrations'

describe('Save Migrations', () => {
  it('migra um save sem schemaVersion até a versão atual', () => {
    const oldSave = {
      currentDate: '2026-08-08',
      userFranchiseId: 'sas',
      inbox: [],
      decisions: [],
      day: 1,
      organizationDirection: 'balanced',
    }

    const migrated = migrateSave(oldSave)

    expect(migrated).not.toBeNull()
    expect(migrated?.schemaVersion).toBe(
      CURRENT_SCHEMA_VERSION,
    )

    expect(
      migrated?.league?.franchiseManagement.sas
        .organizationDirection,
    ).toBe('balanced')
  })

  it('preserva a direção organizacional de um save antigo', () => {
    const schema2Save = {
      schemaVersion: 2,
      currentDate: '2026-08-08',
      userFranchiseId: 'sas',
      inbox: [],
      decisions: [],
      day: 1,

      organizationDirection: 'rebuild',

      league: {
        franchiseManagement: {
          sas: {
            franchiseId: 'sas',
            objectives: [],
          },
        },
      },
    }

    const migrated = migrateSave(schema2Save)

    expect(migrated).not.toBeNull()

    expect(
      migrated?.league?.franchiseManagement.sas
        .organizationDirection,
    ).toBe('rebuild')
  })

  it('não deixa o campo legado sobrescrever uma direção já migrada', () => {
    const schema2Save = {
      schemaVersion: 2,
      currentDate: '2026-08-08',
      userFranchiseId: 'sas',
      inbox: [],
      decisions: [],
      day: 1,

      organizationDirection: 'rebuild',

      league: {
        franchiseManagement: {
          sas: {
            franchiseId: 'sas',
            objectives: [],
            organizationDirection: 'balanced',
          },
        },
      },
    }

    const migrated = migrateSave(schema2Save)

    expect(migrated).not.toBeNull()

    expect(
      migrated?.league?.franchiseManagement.sas
        .organizationDirection,
    ).toBe('balanced')
  })

  it('remove o campo legado depois da migração', () => {
    const schema2Save = {
      schemaVersion: 2,
      currentDate: '2026-08-08',
      userFranchiseId: 'sas',
      inbox: [],
      decisions: [],
      day: 1,

      organizationDirection: 'win-now',

      league: {
        franchiseManagement: {
          sas: {
            franchiseId: 'sas',
            objectives: [],
          },
        },
      },
    }

    const migrated = migrateSave(schema2Save)

    expect(migrated).not.toBeNull()

    expect(
      Object.prototype.hasOwnProperty.call(
        migrated,
        'organizationDirection',
      ),
    ).toBe(false)

    expect(
      migrated?.league?.franchiseManagement.sas
        .organizationDirection,
    ).toBe('win-now')
  })

  it('recusa um save criado por um schema futuro', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const futureSave = {
      schemaVersion:
        CURRENT_SCHEMA_VERSION + 1,

      currentDate: '2026-08-08',
      userFranchiseId: 'sas',
      inbox: [],
      decisions: [],
      day: 1,
    }

    const migrated = migrateSave(futureSave)

    expect(migrated).toBeNull()

    consoleSpy.mockRestore()
  })

  it('recusa dados que não possuem a estrutura mínima de uma carreira', () => {
    expect(
      migrateSave({
        schemaVersion: 1,
        qualquerCoisa: true,
      }),
    ).toBeNull()

    expect(migrateSave(null)).toBeNull()
    expect(migrateSave('save quebrado')).toBeNull()
  })
})