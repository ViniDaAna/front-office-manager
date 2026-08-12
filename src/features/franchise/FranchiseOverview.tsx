import type { GameState } from '../../domain/types'

import {
  getUserFranchise,
  getUserFranchiseAlignment,
  getUserFranchiseManagement,
} from '../../services/franchiseSelectors'

function getDirectionLabel(
  direction:
    | 'win-now'
    | 'balanced'
    | 'rebuild'
    | undefined,
): string {
  if (direction === 'win-now') {
    return 'Disputar o título agora'
  }

  if (direction === 'balanced') {
    return 'Competir sem comprometer o futuro'
  }

  if (direction === 'rebuild') {
    return 'Construir para o futuro'
  }

  return 'Ainda não definida'
}

interface FranchiseOverviewProps {
  state: GameState
}

export default function FranchiseOverview({
  state,
}: FranchiseOverviewProps) {
  const franchise =
    getUserFranchise(state)

  const alignment =
    getUserFranchiseAlignment(state)

  const management =
    getUserFranchiseManagement(state)

  if (
    !franchise ||
    !alignment ||
    !management
  ) {
    return (
      <section className="franchise-error">
        <p className="eyebrow">
          ERRO DE DADOS
        </p>

        <h2>
          Não foi possível carregar a franquia.
        </h2>

        <p>
          O estado da organização está incompleto
          ou inconsistente.
        </p>
      </section>
    )
  }

  return (
    <div className="franchise-overview">
      <section className="franchise-header-card">
        <div>
          <p className="eyebrow">
            SUA ORGANIZAÇÃO
          </p>

          <h2>
            {franchise.city} {franchise.name}
          </h2>

          <p className="franchise-alignment">
            {alignment.conference === 'East'
              ? 'Eastern Conference'
              : 'Western Conference'}
            {' · '}
            {alignment.division} Division
          </p>
        </div>

        <div className="franchise-abbreviation">
          {franchise.abbreviation}
        </div>
      </section>

      <section className="franchise-grid">
        <article className="franchise-card">
          <p className="eyebrow">
            DIREÇÃO ORGANIZACIONAL
          </p>

          <h3>
            {getDirectionLabel(
              management.organizationDirection,
            )}
          </h3>

          <p>
            Essa direção representa o compromisso
            atual assumido com a organização e poderá
            influenciar futuras avaliações do seu
            trabalho como General Manager.
          </p>
        </article>

        <article className="franchise-card">
          <p className="eyebrow">
            PROPRIETÁRIO
          </p>

          {management.owner ? (
            <>
              <h3>{management.owner.name}</h3>

              <p>
                Perfil administrativo carregado para
                esta carreira.
              </p>
            </>
          ) : (
            <>
              <h3>Dados ainda não carregados</h3>

              <p>
                O perfil do proprietário será
                adicionado quando estruturarmos esse
                módulo com dados e regras próprias.
              </p>
            </>
          )}
        </article>

        <article className="franchise-card">
          <p className="eyebrow">
            OBJETIVOS
          </p>

          {management.objectives.length > 0 ? (
            <>
              <h3>
                {management.objectives.length}{' '}
                objetivo
                {management.objectives.length > 1
                  ? 's'
                  : ''}
              </h3>

              <p>
                Existem metas ativas definidas pela
                organização.
              </p>
            </>
          ) : (
            <>
              <h3>Nenhum objetivo definido</h3>

              <p>
                Os objetivos serão gerados quando o
                sistema de expectativas do
                proprietário estiver completo.
              </p>
            </>
          )}
        </article>

        <article className="franchise-card">
          <p className="eyebrow">
            FINANÇAS
          </p>

          {management.finances ? (
            <>
              <h3>Dados financeiros disponíveis</h3>

              <p>
                O módulo financeiro está carregado
                para esta organização.
              </p>
            </>
          ) : (
            <>
              <h3>Dados ainda não carregados</h3>

              <p>
                Orçamentos, saúde financeira e
                estrutura econômica serão adicionados
                no módulo financeiro.
              </p>
            </>
          )}
        </article>

        <article className="franchise-card">
          <p className="eyebrow">
            INSTALAÇÕES
          </p>

          {management.facilities ? (
            <>
              <h3>Estrutura disponível</h3>

              <p>
                As instalações da organização estão
                registradas nesta carreira.
              </p>
            </>
          ) : (
            <>
              <h3>Dados ainda não carregados</h3>

              <p>
                Centro de treinamento, departamento
                médico, scouting, analytics e
                desenvolvimento entrarão depois.
              </p>
            </>
          )}
        </article>

        <article className="franchise-card">
          <p className="eyebrow">
            SITUAÇÃO DO GM
          </p>

          <h3>
            {management.jobSecurity
              ? management.jobSecurity
              : 'Ainda não avaliada'}
          </h3>

          <p>
            Segurança no cargo, confiança da direção
            e aprovação da torcida serão sistemas
            dinâmicos da carreira.
          </p>
        </article>
      </section>
    </div>
  )
}