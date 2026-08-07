import { useEffect, useMemo, useState } from 'react'
import { franchises } from './data/franchises'
import type { GameState, InboxMessage } from './domain/types'
import { advanceOneDay } from './services/simulation'
import { clearGame, loadGame, saveGame } from './services/storage'
import './styles/app.css'

const initialMessages: InboxMessage[] = [
  {
    id: 'welcome-1',
    date: '2026-08-07',
    category: 'Owner',
    title: 'Bem-vindo ao front office',
    body: 'Sua primeira responsabilidade é definir a direção da organização. O mundo da liga continuará avançando mesmo quando você não estiver envolvido diretamente em cada decisão.',
    read: false,
  },
  {
    id: 'welcome-2',
    date: '2026-08-07',
    category: 'Staff',
    title: 'Reunião inicial com a comissão',
    body: 'A estrutura atual de staff será avaliada nas próximas versões. O objetivo é que cada funcionário tenha carreira, atributos, contrato, reputação e ambições próprias.',
    read: false,
  },
]

function createNewGame(franchiseId: string): GameState {
  return {
    currentDate: '2026-08-07',
    userFranchiseId: franchiseId,
    inbox: initialMessages,
    day: 0,
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`))
}

export default function App() {
  const [state, setState] = useState<GameState | null>(() => loadGame())
  const [selectedFranchise, setSelectedFranchise] = useState('sas')
  const [activeSection, setActiveSection] = useState('Inbox')

  useEffect(() => {
    if (state) saveGame(state)
  }, [state])

  const franchise = useMemo(
    () => franchises.find((item) => item.id === state?.userFranchiseId),
    [state?.userFranchiseId],
  )

  if (!state) {
    return (
      <main className="setup-shell">
        <section className="setup-card">
          <p className="eyebrow">FRONT OFFICE MANAGER</p>
          <h1>Sua carreira começa no escritório.</h1>
          <p className="muted">
            Primeiro protótipo do loop central: informação → decisão → continuar → consequência.
          </p>

          <label className="field-label" htmlFor="franchise">
            Franquia inicial de teste
          </label>

          <select
            id="franchise"
            value={selectedFranchise}
            onChange={(event) => setSelectedFranchise(event.target.value)}
          >
            {franchises.map((item) => (
              <option key={item.id} value={item.id}>
                {item.city} {item.name}
              </option>
            ))}
          </select>

          <button
            className="primary-button"
            onClick={() => setState(createNewGame(selectedFranchise))}
          >
            Começar carreira
          </button>

          <p className="tiny-note">
            Os elencos reais, staff completo, contratos e expansão entram depois que o núcleo do jogo estiver sólido.
          </p>
        </section>
      </main>
    )
  }

  const unread = state.inbox.filter((message) => !message.read).length

  function openMessage(id: string) {
    setState((current) =>
      current
        ? {
            ...current,
            inbox: current.inbox.map((message) =>
              message.id === id ? { ...message, read: true } : message,
            ),
          }
        : current,
    )
  }

  function continueDay() {
    setState((current) => (current ? advanceOneDay(current) : current))
  }

  function resetCareer() {
    clearGame()
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
                activeSection === section ? 'nav-item active' : 'nav-item'
              }
              onClick={() => setActiveSection(section)}
            >
              <span>{section}</span>
              {section === 'Inbox' && unread > 0 && <b>{unread}</b>}
            </button>
          ))}
        </nav>

        <button className="reset-button" onClick={resetCareer}>
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
            <button className="continue-button" onClick={continueDay}>
              CONTINUAR ›
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
                    message.read ? 'message-card read' : 'message-card'
                  }
                  onClick={() => openMessage(message.id)}
                >
                  <div className="message-meta">
                    <span className="category">{message.category}</span>
                    <span>{formatDate(message.date)}</span>
                  </div>

                  <h3>
                    {message.urgent && '⚠ '}
                    {message.title}
                  </h3>

                  <p>{message.body}</p>
                </article>
              ))}
            </section>

            <aside className="context-panel">
              <p className="eyebrow">LOOP CENTRAL</p>
              <h3>O mundo não espera.</h3>

              <p>
                Cada clique em Continuar avança a data, permite que sistemas da
                liga processem eventos e adiciona novas informações à sua caixa
                de entrada.
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
              Esta tela já existe na navegação para fixarmos a arquitetura. Ela
              será implementada somente quando seu sistema entrar no roadmap da
              versão jogável.
            </p>
          </section>
        )}
      </section>
    </div>
  )
}
