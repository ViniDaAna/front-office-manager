import type { GameState, InboxMessage } from '../domain/types'

function addOneDay(date: string): string {
  const current = new Date(`${date}T12:00:00`)
  current.setDate(current.getDate() + 1)

  return current.toISOString().slice(0, 10)
}

function createDailyEvents(
  day: number,
  date: string,
): InboxMessage[] {
  const events: InboxMessage[] = []

  if (day === 1) {
    events.push({
      id: `owner-expectations-${date}`,
      date,
      category: 'Owner',
      title: 'O proprietário quer definir as expectativas',
      body:
        'A direção quer conversar sobre os objetivos da temporada, o nível de competitividade esperado e até onde você terá liberdade para reconstruir o elenco.',
      read: false,
      urgent: true,
    })
  }

  if (day === 2) {
    events.push({
      id: `scouting-meeting-${date}`,
      date,
      category: 'Scouting',
      title: 'Primeira reunião do departamento de scouting',
      body:
        'Seu departamento preparou uma avaliação inicial da estrutura de olheiros. Em breve, cada scout terá especialidades, regiões preferidas, precisão e reputação próprias.',
      read: false,
    })
  }

  if (day === 3) {
    events.push({
      id: `coach-roster-${date}`,
      date,
      category: 'Staff',
      title: 'O treinador quer conversar sobre o elenco',
      body:
        'A comissão técnica acredita que existem posições que precisam de reforço. No futuro, treinadores terão filosofias próprias e poderão discordar das suas decisões como GM.',
      read: false,
    })
  }

  if (day === 4) {
    events.push({
      id: `trade-interest-${date}`,
      date,
      category: 'Trade',
      title: 'Uma franquia demonstrou interesse em conversar',
      body:
        'Outro front office entrou em contato informalmente para sondar a disponibilidade de jogadores. O sistema completo de negociações será construído em uma fase posterior.',
      read: false,
    })
  }

  if (day === 5) {
    events.push({
      id: `league-news-${date}`,
      date,
      category: 'League',
      title: 'Movimentações começam a acontecer pela liga',
      body:
        'Outras franquias também possuem objetivos, funcionários, contratos e decisões próprias. Nosso objetivo é que a NBA continue evoluindo mesmo sem a participação direta do jogador.',
      read: false,
    })
  }

  if (day === 7) {
    events.push({
      id: `medical-report-${date}`,
      date,
      category: 'Medical',
      title: 'Departamento médico entrega relatório inicial',
      body:
        'A equipe médica quer revisar o histórico físico do elenco. Mais adiante, fadiga, risco de lesão, recuperação e qualidade da equipe médica terão impacto real nas decisões do GM.',
      read: false,
    })
  }

  return events
}

export function advanceOneDay(state: GameState): GameState {
  const nextDate = addOneDay(state.currentDate)
  const nextDay = state.day + 1

  const newMessages = createDailyEvents(nextDay, nextDate)

  return {
    ...state,
    currentDate: nextDate,
    day: nextDay,
    inbox: [...newMessages, ...state.inbox],
  }
}
