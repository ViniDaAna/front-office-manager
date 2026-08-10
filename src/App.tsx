import { useEffect, useMemo, useState } from 'react'
import { franchises } from './data/franchises'
import type {
  Decision,
  GameState,
  InboxMessage,
  OrganizationDirection,
} from './domain/types'
import { advanceOneDay } from './services/simulation'
import { createNewGame } from './services/newGame'
import { clearGame, loadGame, saveGame } from './services/storage'
import './styles/app.css'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`))
}

function getDecisionResultText(optionId: string): string {
  if (optionId === 'win-now') {
    return 'Você deixou claro que resultados imediatos são a prioridade. A direção espera agressividade na montagem do elenco e não aceitará facilmente uma temporada abaixo das expectativas.'
  }

  if (optionId === 'balanced') {
    return 'Você prometeu competir sem hipotecar o futuro da organização. A direção espera equilíbrio entre resultados, desenvolvimento e flexibilidade financeira.'
  }

  return 'Você pediu paciência para construir uma estrutura sustentável. A direção aceitará algum sacrifício imediato, mas espera desenvolvimento de jovens e acúmulo inteligente de ativos.'
}

function directionLabel(
  direction?: OrganizationDirection,
): string {
  if (direction === 'win-now') return 'Disputar o título agora'
  if (direction === 'balanced') {
    return 'Competir sem comprometer o futuro'
  }

  if (direction === 'rebuild') {
    return 'Construir para o futuro'
  }

  return 'Ainda não definida'
}

export default function App() {
  const [state, setState] = useState<GameState | null>(() => loadGame())
  const [selectedFranchise, setSelectedFranchise] = useState('sas')
  const [activeSection, setActiveSection] = useState('Inbox')
  const [selectedDecisionId, setSelectedDecisionId] =
    useState<string | null>(null)

  useEffect(() => {
    if (state) saveGame(state)
  }, [state])

  const franchise = useMemo(
    () =>
      franchises.find(
        (item) => item.id === state?.userFranchiseId,
      ),
    [state?.userFranchiseId],
  )

  if (!state) {
    return (
      <main className="setup-shell">
        <section className="setup-card">
          <p className="eyebrow">FRONT OFFICE MANAGER</p>

          <h1>Sua carreira começa no escritório.</h1>

          <p className="muted">
            Informação → decisão → continuar → consequência.
          </p>

          <label
            className="field-label"
            htmlFor="franchise"
          >
            Franquia inicial de teste
          </label>

          <select
            id="franchise"
            value={selectedFranchise}
            onChange={(event) =>
              setSelectedFranchise(event.target.value)
            }
          >
            {franchises.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.city} {item.name}
              </option>
            ))}
          </select>

          <button
            className="primary-button"
            onClick={() =>
              setState(createNewGame(selectedFranchise))
            }
          >
            Começar carreira
          </button>

          <p className="tiny-note">
            Primeiro estamos construindo o coração da carreira.
            Elencos, contratos, staff, scouting e expansão
            crescerão em cima desta fundação.
          </p>
        </section>
      </main>
    )
  }

  const unread = state.inbox.filter(
    (message) => !message.read,
  ).length

  const pendingDecisions =
    state.decisions?.filter(
      (decision) => decision.status === 'pending',
    ) ?? []

  const selectedDecision =
    state.decisions?.find(
      (decision) => decision.id === selectedDecisionId,
    ) ?? null
const userManagement =
  state.league?.franchiseManagement[
    state.userFranchiseId
  ]

const organizationDirection =
  userManagement?.organizationDirection ??
  state.organizationDirection
  function openMessage(message: InboxMessage) {
    setState((current) =>
      current
        ? {
            ...current,
            inbox: current.inbox.map((item) =>
              item.id === message.id
                ? { ...item, read: true }
                : item,
            ),
          }
        : current,
    )

    if (
      message.kind === 'decision' &&
      message.decisionId
    ) {
      setSelectedDecisionId(message.decisionId)
    }
  }

  function continueDay() {
  if (!state) return

  const pendingDecision = state.decisions?.find(
    (decision) => decision.status === 'pending',
  )

  if (pendingDecision) {
    setSelectedDecisionId(pendingDecision.id)
    return
  }

  setState((current) =>
    current ? advanceOneDay(current) : current,
  )
}
  function resolveDecision(
    decision: Decision,
    optionId: string,
  ) {
    setState((current) => {
      if (!current) return current

      const validDirections: OrganizationDirection[] = [
        'win-now',
        'balanced',
        'rebuild',
      ]

  const currentManagement =
  current.league?.franchiseManagement[
    current.userFranchiseId
  ]

if (!current.league || !currentManagement) {
  console.error(
    'Não foi possível encontrar o estado administrativo da franquia do usuário.',
  )

  return current
}

if (
  !validDirections.includes(
    optionId as OrganizationDirection,
  )
) {
  console.error(
    `Direção organizacional inválida: ${optionId}`,
  )

  return current
}

const direction =
  optionId as OrganizationDirection
      const confirmationMessage: InboxMessage = {
        id: `decision-result-${decision.id}`,
        date: current.currentDate,
        category: decision.category,
        title: 'Direção da franquia definida',
        body: getDecisionResultText(optionId),
        read: false,
        kind: 'information',
      }

      return {
        ...current,

        league: {
  ...current.league,

  franchiseManagement: {
    ...current.league.franchiseManagement,

    [current.userFranchiseId]: {
      ...currentManagement,
      organizationDirection: direction,
    },
  },
},

        decisions:
          current.decisions?.map((item) =>
            item.id === decision.id
              ? {
                  ...item,
                  status: 'resolved',
                  selectedOptionId: optionId,
                  resolvedDate: current.currentDate,
                }
              : item,
          ) ?? [],

        inbox: [
          confirmationMessage,
          ...current.inbox,
        ],
      }
    })

    setSelectedDecisionId(null)
  }

  function resetCareer() {
    clearGame()
    setSelectedDecisionId(null)
    setState(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">FRONT OFFICE</p>

          <h2>{franchise?.abbreviation ?? 'GM'}</h2>

          <p className="team-name">
            {franchise?.city} {franchise?.name}
          </p>
        </div>

        <nav>
          {[
            'Inbox',
            'Franquia',
            'Elenco',
            'Staff',
            'Scouting',
            'Transações',
            'Liga',
          ].map((section) => (
            <button
              key={section}
              className={
                activeSection === section
                  ? 'nav-item active'
                  : 'nav-item'
              }
              onClick={() => setActiveSection(section)}
            >
              <span>{section}</span>

              {section === 'Inbox' && unread > 0 && (
                <b>{unread}</b>
              )}
            </button>
          ))}
        </nav>

        <button
          className="reset-button"
          onClick={resetCareer}
        >
          Reiniciar protótipo
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              TEMPORADA 2026–27 · DIA {state.day + 1}
            </p>

            <h1>{activeSection}</h1>
          </div>

          <div className="continue-area">
            <span>{formatDate(state.currentDate)}</span>

            <button
              className="continue-button"
              onClick={continueDay}
            >
              {pendingDecisions.length > 0
                ? 'RESOLVER DECISÃO ›'
                : 'CONTINUAR ›'}
            </button>
          </div>
        </header>

        {activeSection === 'Inbox' ? (
          <div className="inbox-layout">
            <section className="message-list">
              {state.inbox.map((message) => (
                <article
                  key={message.id}
                  className={
                    message.read
                      ? 'message-card read'
                      : 'message-card'
                  }
                  onClick={() => openMessage(message)}
                >
                  <div className="message-meta">
                    <span className="category">
                      {message.category}
                    </span>

                    <span>
                      {formatDate(message.date)}
                    </span>
                  </div>

                  <h3>
                    {message.urgent && '⚠ '}
                    {message.title}
                  </h3>

                  <p>{message.body}</p>

                  {message.kind === 'decision' && (
                    <span className="decision-tag">
                      DECISÃO NECESSÁRIA
                    </span>
                  )}
                </article>
              ))}
            </section>

            <aside className="context-panel">
              <p className="eyebrow">
                VISÃO DA ORGANIZAÇÃO
              </p>

              <h3>
               {directionLabel(
  organizationDirection,
)}
              </h3>

              <p>
                Suas escolhas serão registradas na
                carreira e poderão ser usadas para
                avaliar seu trabalho no futuro.
              </p>

              <div className="metric">
                <span>Mensagens</span>
                <strong>{state.inbox.length}</strong>
              </div>

              <div className="metric">
                <span>Não lidas</span>
                <strong>{unread}</strong>
              </div>

              <div className="metric">
                <span>Decisões pendentes</span>
                <strong>{pendingDecisions.length}</strong>
              </div>

              <div className="metric">
                <span>Dias simulados</span>
                <strong>{state.day}</strong>
              </div>
            </aside>
          </div>
        ) : (
          <section className="placeholder-panel">
            <p className="eyebrow">MÓDULO FUTURO</p>

            <h2>{activeSection}</h2>

            <p>
              Esta área será construída quando seu
              sistema entrar no roadmap da versão
              jogável.
            </p>
          </section>
        )}
      </section>

      {selectedDecision && (
        <div className="decision-overlay">
          <section className="decision-dialog">
            <p className="eyebrow">
              REUNIÃO COM A DIREÇÃO
            </p>

            <h2>{selectedDecision.title}</h2>

            <p className="decision-prompt">
              {selectedDecision.prompt}
            </p>

            <div className="decision-options">
              {selectedDecision.options.map((option) => (
                <button
                  key={option.id}
                  className="decision-option"
                  onClick={() =>
                    resolveDecision(
                      selectedDecision,
                      option.id,
                    )
                  }
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>

            <button
              className="decision-close"
              onClick={() =>
                setSelectedDecisionId(null)
              }
            >
              Voltar para a Inbox
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
