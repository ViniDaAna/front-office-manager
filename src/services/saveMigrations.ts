import { franchises } from '../data/franchises'
import { CURRENT_SCHEMA_VERSION } from '../domain/schema'

import type {
  FranchiseManagementState,
  GameState,
  LeagueState,
  OrganizationDirection,
} from '../domain/types'

/*
 * Formato compatível com saves antigos.
 *
 * O GameState representa o formato atual do jogo.
 * As migrações, porém, ainda precisam conseguir
 * interpretar campos que existiam em versões antigas.
 *
 * Quando organizationDirection for removida
 * definitivamente do GameState, ela continuará
 * existindo aqui exclusivamente para migração.
 */
type LegacyGameState = GameState & {
  organizationDirection?: OrganizationDirection
}

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
 * Saves criados antes da introdução de
 * schemaVersion passam a ter sua primeira
 * versão estrutural explícita.
 */
function migrateSchema0To1(
  save: Record<string, unknown>,
): LegacyGameState {
  return {
    ...save,
    schemaVersion: 1,
  } as unknown as LegacyGameState
}

/*
 * SCHEMA 1 → 2
 *
 * Introduz o estado administrativo da liga
 * e garante que todas as franquias existentes
 * tenham um FranchiseManagementState.
 *
 * Também preserva organizationDirection caso
 * ela ainda esteja no formato legado.
 */
function migrateSchema1To2(
  save: LegacyGameState,
): LegacyGameState {
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

  /*
   * O schema 2 já começa a remover a dependência
   * do campo legado.
   */
  const {
    organizationDirection: _legacyDirection,
    ...saveWithoutLegacyDirection
  } = save

  return {
    ...saveWithoutLegacyDirection,
    schemaVersion: 2,
    league,
  } as LegacyGameState
}

/*
 * SCHEMA 2 → 3
 *
 * Consolida organizationDirection dentro do
 * FranchiseManagementState da franquia correta.
 *
 * Alguns saves schema 2 foram criados durante
 * a transição e ainda podem carregar uma cópia
 * antiga diretamente no GameState.
 */
function migrateSchema2To3(
  save: LegacyGameState,
): GameState {
  const franchiseManagement =
    createEmptyFranchiseManagement()

  /*
   * Preserva todos os estados administrativos
   * já existentes no save.
   *
   * Também garante que novas franquias presentes
   * nos dados básicos tenham pelo menos uma
   * estrutura administrativa válida.
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
   * Se ainda existir organizationDirection no
   * formato legado, ela é preservada.
   *
   * Porém, uma direção que já esteja armazenada
   * corretamente no FranchiseManagementState
   * sempre possui prioridade.
   */
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

  /*
   * A partir do schema 3, organizationDirection
   * não deve mais permanecer no nível raiz
   * do save persistido.
   */
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
 * Não conhece localStorage, React ou interface.
 *
 * Recebe qualquer dado desconhecido e devolve:
 *
 * - GameState atualizado e utilizável;
 * - null quando o dado não pode ser interpretado
 *   com segurança.
 */
export function migrateSave(
  rawSave: unknown,
): GameState | null {
  if (!isObject(rawSave)) {
    return null
  }

  /*
   * Antes de tentar descobrir versões ou executar
   * migrações, exigimos a estrutura mínima que
   * identifica uma carreira do jogo.
   */
  if (!hasBaseGameStateStructure(rawSave)) {
    return null
  }

  let save: LegacyGameState

  /*
   * Saves anteriores ao versionamento são
   * considerados schema 0.
   */
  if (rawSave.schemaVersion === undefined) {
    save = migrateSchema0To1(rawSave)
  } else {
    if (typeof rawSave.schemaVersion !== 'number') {
      return null
    }

    /*
     * Nunca tentamos abrir silenciosamente um save
     * criado por uma versão estrutural mais nova.
     *
     * Fazer isso poderia interpretar dados de forma
     * incorreta e corromper a carreira.
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

    save =
      rawSave as unknown as LegacyGameState
  }

  /*
   * Migrações são executadas sequencialmente.
   *
   * Isso significa que um save muito antigo
   * percorre todas as transformações necessárias:
   *
   * 0 → 1 → 2 → 3
   *
   * No futuro:
   *
   * 0 → 1 → 2 → 3 → 4 → 5...
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