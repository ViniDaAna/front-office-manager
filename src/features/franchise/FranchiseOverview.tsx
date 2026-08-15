import type {
  GameState,
  JobSecurity,
  ObjectiveStatus,
} from '../../domain/types'

import {
  getUserFranchise,
  getUserFranchiseAlignment,
  getUserFranchiseManagement,
} from '../../services/franchiseSelectors'

import './FranchiseOverview.css'

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

function getObjectiveStatusLabel(
  status: ObjectiveStatus,
): string {
  if (status === 'active') {
    return 'Ativo'
  }

  if (status === 'completed') {
    return 'Concluído'
  }

  return 'Falhou'
}

function getImportanceStars(
  importance: number,
): string {
  const rating = Math.max(
    0,
    Math.min(
      5,
      Math.round(importance),
    ),
  )

  return `${'★'.repeat(rating)}${'☆'.repeat(
    5 - rating,
  )}`
}

function getJobSecurityLabel(
  jobSecurity?: JobSecurity,
): string {
  if (jobSecurity === 'untouchable') {
    return 'Intocável'
  }

  if (jobSecurity === 'secure') {
    return 'Seguro'
  }

  if (jobSecurity === 'stable') {
    return 'Estável'
  }

  if (jobSecurity === 'under-pressure') {
    return 'Sob pressão'
  }

  if (jobSecurity === 'critical') {
    return 'Crítico'
  }

  return 'Ainda não avaliada'
}

function getJobSecurityDescription(
  jobSecurity: JobSecurity,
): string {
  if (jobSecurity === 'untouchable') {
    return 'A direção tem enorme confiança no seu trabalho e sua posição dentro da organização é extremamente forte.'
  }

  if (jobSecurity === 'secure') {
    return 'A direção está satisfeita com o seu trabalho e você possui boa margem para conduzir o projeto.'
  }

  if (jobSecurity === 'stable') {
    return 'A direção confia no início do seu trabalho, mas espera que os compromissos assumidos sejam cumpridos.'
  }

  if (jobSecurity === 'under-pressure') {
    return 'A confiança da direção caiu e suas próximas decisões terão peso maior sobre a avaliação do seu trabalho.'
  }

  return 'Sua posição está seriamente ameaçada. Resultados e decisões futuras poderão determinar sua permanência no cargo.'
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

  const hasOwnerEvaluation =
    management.ownerTrust !== undefined &&
    management.jobSecurity !== undefined

  const normalizedOwnerTrust =
    management.ownerTrust !== undefined
      ? Math.max(
          0,
          Math.min(
            100,
            management.ownerTrust,
          ),
        )
      : 0

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

        <article className="franchise-card franchise-card-objectives">
          <div className="objectives-heading">
            <div>
              <p className="eyebrow">
                OBJETIVOS
              </p>

              <h3>
                {management.objectives.length > 0
                  ? `${management.objectives.length} objetivos`
                  : 'Nenhum objetivo definido'}
              </h3>
            </div>

            {management.objectives.length > 0 && (
              <span className="objectives-summary">
                Compromissos com a direção
              </span>
            )}
          </div>

          {management.objectives.length > 0 ? (
            <div className="objective-list">
              {management.objectives.map(
                (objective) => (
                  <section
                    className="objective-item"
                    key={objective.id}
                  >
                    <div className="objective-item-header">
                      <span
                        className={[
                          'objective-status',
                          `objective-status-${objective.status}`,
                        ].join(' ')}
                      >
                        {getObjectiveStatusLabel(
                          objective.status,
                        )}
                      </span>

                      <span
                        className="objective-importance"
                        aria-label={`Importância ${objective.importance}/5`}
                        title={`Importância ${objective.importance}/5`}
                      >
                        {getImportanceStars(
                          objective.importance,
                        )}
                      </span>
                    </div>

                    <h4 className="objective-title">
                      {objective.title}
                    </h4>

                    <p className="objective-description">
                      {objective.description}
                    </p>
                  </section>
                ),
              )}
            </div>
          ) : (
            <p>
              Os objetivos serão gerados quando o
              sistema de expectativas do proprietário
              estiver completo.
            </p>
          )}
        </article>

        <article className="franchise-card">
          <p className="eyebrow">
            FINANÇAS
          </p>

          {management.finances ? (
            <>
              <h3>
                Dados financeiros disponíveis
              </h3>

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

          {hasOwnerEvaluation &&
          management.jobSecurity &&
          management.ownerTrust !== undefined ? (
            <>
              <div className="gm-status-header">
                <h3>
                  {getJobSecurityLabel(
                    management.jobSecurity,
                  )}
                </h3>

                <span
                  className={[
                    'gm-security-badge',
                    `gm-security-${management.jobSecurity}`,
                  ].join(' ')}
                >
                  {management.ownerTrust}/100
                </span>
              </div>

              <div className="gm-trust-heading">
                <span>
                  Confiança da direção
                </span>

                <strong>
                  {management.ownerTrust}/100
                </strong>
              </div>

              <div
                className="gm-trust-track"
                role="progressbar"
                aria-label="Confiança da direção"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  normalizedOwnerTrust
                }
              >
                <div
                  className="gm-trust-fill"
                  style={{
                    width: `${normalizedOwnerTrust}%`,
                  }}
                />
              </div>

              <div className="gm-trust-scale">
                <span>0</span>
                <span>100</span>
              </div>

              <p>
                {getJobSecurityDescription(
                  management.jobSecurity,
                )}
              </p>
            </>
          ) : (
            <>
              <h3>Ainda não avaliada</h3>

              <p>
                A confiança da direção e sua
                segurança no cargo serão definidas
                quando os primeiros compromissos
                forem assumidos.
              </p>
            </>
          )}
        </article>
      </section>
    </div>
  )
}