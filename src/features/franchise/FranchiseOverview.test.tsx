import { renderToStaticMarkup } from 'react-dom/server'
import {
  describe,
  expect,
  it,
} from 'vitest'

import { createNewGame } from '../../services/newGame'
import { createOrganizationObjectives } from '../../services/ownerExpectations'

import FranchiseOverview from './FranchiseOverview'

describe('Franchise Overview', () => {
  it('mostra os dados básicos da franquia controlada pelo jogador', () => {
    const game = createNewGame('sas')

    const html = renderToStaticMarkup(
      <FranchiseOverview state={game} />,
    )

    expect(html).toContain(
      'San Antonio Spurs',
    )

    expect(html).toContain(
      'Western Conference',
    )

    expect(html).toContain(
      'Southwest Division',
    )

    expect(html).toContain('SAS')
  })

  it('mostra que a direção organizacional ainda não foi definida em uma carreira nova', () => {
    const game = createNewGame('sas')

    const html = renderToStaticMarkup(
      <FranchiseOverview state={game} />,
    )

    expect(html).toContain(
      'Ainda não definida',
    )
  })

  it('mostra a direção organizacional definida na carreira', () => {
    const game = createNewGame('sas')

    const management =
      game.league?.franchiseManagement.sas

    if (!management) {
      throw new Error(
        'Estado administrativo do SAS não encontrado no teste.',
      )
    }

    management.organizationDirection =
      'balanced'

    const html = renderToStaticMarkup(
      <FranchiseOverview state={game} />,
    )

    expect(html).toContain(
      'Competir sem comprometer o futuro',
    )
  })

  it('não inventa dados de módulos ainda não inicializados', () => {
    const game = createNewGame('sas')

    const html = renderToStaticMarkup(
      <FranchiseOverview state={game} />,
    )

    expect(html).toContain(
      'Dados ainda não carregados',
    )

    expect(html).toContain(
      'Nenhum objetivo definido',
    )

    expect(html).toContain(
      'Ainda não avaliada',
    )
  })

  it('mostra os compromissos definidos pela direção', () => {
    const game = createNewGame('sas')

    const management =
      game.league?.franchiseManagement.sas

    if (!management) {
      throw new Error(
        'Estado administrativo do SAS não encontrado no teste.',
      )
    }

    management.organizationDirection =
      'rebuild'

    management.objectives =
      createOrganizationObjectives({
        franchiseId: 'sas',
        direction: 'rebuild',
        createdDate: game.currentDate,
      })

    const html = renderToStaticMarkup(
      <FranchiseOverview state={game} />,
    )

    expect(html).toContain(
      '3 objetivos',
    )

    expect(html).toContain(
      'Priorizar o desenvolvimento jovem',
    )

    expect(html).toContain(
      'Proteger ativos de longo prazo',
    )

    expect(html).toContain(
      'Preservar flexibilidade financeira',
    )

    expect(html).toContain(
      'Importância 5/5',
    )

    expect(html).toContain(
      'Importância 4/5',
    )

    expect(html).toContain('Ativo')
  })

  it('traduz os estados dos objetivos para a interface', () => {
    const game = createNewGame('sas')

    const management =
      game.league?.franchiseManagement.sas

    if (!management) {
      throw new Error(
        'Estado administrativo do SAS não encontrado no teste.',
      )
    }

    const objectives =
      createOrganizationObjectives({
        franchiseId: 'sas',
        direction: 'balanced',
        createdDate: game.currentDate,
      })

    objectives[0].status = 'completed'
    objectives[1].status = 'failed'

    management.objectives = objectives

    const html = renderToStaticMarkup(
      <FranchiseOverview state={game} />,
    )

    expect(html).toContain(
      'Concluído',
    )

    expect(html).toContain(
      'Falhou',
    )

    expect(html).toContain(
      'Ativo',
    )
  })
})