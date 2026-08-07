import type {
  Decision,
  GameState,
  InboxMessage,
} from '../domain/types'

interface DailyEvents {
  messages: InboxMessage[]
  decisions: Decision[]
}

function addOneDay(date: string): string {
  const current = new Date(`${date}T12:00:00`)
  current.setDate(current.getDate() + 1)

  return current.toISOString().slice(0, 10)
}

function createDailyEvents(
  day: number,
  date: string,
): DailyEvents {
  const messages: InboxMessage[] = []
  const decisions: Decision[] = []

  if (day === 1) {
    const decisionId = `owner-direction-${date}`

    messages.push({
      id: `owner-expectations-${date}`,
      date,
      category: 'Owner',
      title: 'O proprietário quer definir as expectativas',
      body:
        'A direção quer conversar sobre os objetivos da temporada. Sua resposta ajudará a definir como seu trabalho será avaliado.',
      read: false,
      urgent: true,
      kind: 'decision',
      decisionId,
    })

    decisions.push({
      id: decisionId,
      date,
      category: 'Owner',
      title: 'Definir a direção da franquia',
      prompt:
        'Qual deve ser a prioridade da organização para esta temporada?',
      status: 'pending',
      options: [
        {
          id: 'win-now',
          label: 'Disputar o título agora',
          description:
            'Priorizar resultados imediatos, aceitar menos flexibilidade futura e buscar reforços capazes de elevar o teto competitivo do elenco.',
        },
        {
          id: 'balanced',
          label: 'Competir sem comprometer o futuro',
          description:
            'Buscar os playoffs enquanto preserva jovens, escolhas de draft e flexibilidade financeira.',
        },
        {
          id: 'rebuild',
          label: 'Construir para o futuro',
          description:
            'Priorizar desenvolvimento, juventude e ativos futuros mesmo que os resultados imediatos sejam inferiores.',
        },
      ],
    })
  }

  if (day === 2) {
    messages.push({
      id: `scouting-meeting-${date}`,
      date,
      category: 'Scouting',
      title: 'Primeira reunião do departamento de scouting',
      body:
        'Seu departamento preparou uma avaliação inicial da estrutura de olheiros. Em breve, cada scout terá especialidades, precisão, regiões preferidas e reputação próprias.',
      read: false,
      kind: 'information',
    })
  }

  if (day === 3) {
    messages.push({
      id: `coach-roster-${date}`,
      date,
      category: 'Staff',
      title: 'O treinador quer conversar sobre o elenco',
      body:
        'A comissão técnica acredita que existem posições que precisam de reforço. Treinadores terão filosofias próprias e poderão discordar das suas decisões como GM.',
      read: false,
      kind: 'information',
    })
  }

  if (day === 4) {
    messages.push({
      id: `trade-interest-${date}`,
      date,
      category: 'Trade',
      title: 'Uma franquia demonstrou interesse em conversar',
      body:
        'Outro front office entrou em contato informalmente para sondar a disponibilidade de jogadores.',
      read: false,
      kind: 'information',
    })
  }

  if (day === 5) {
    messages.push({
      id: `league-news-${date}`,
      date,
      category: 'League',
      title: 'Movimentações começam a acontecer pela liga',
      body:
        'Outras franquias também possuem objetivos, funcionários, contratos e decisões próprias. A NBA continuará evoluindo sem depender diretamente de você.',
      read: false,
      kind: 'information',
    })
  }

  if (day === 7) {
    messages.push({
      id: `medical-report-${date}`,
      date,
      category: 'Medical',
      title: 'Departamento médico entrega relatório inicial',
      body:
        'A equipe médica quer revisar o histórico físico do elenco. Fadiga, risco de lesão, recuperação e qualidade do departamento médico terão impacto real na gestão.',
      read: false,
      kind: 'information',
    })
  }

  return {
    messages,
    decisions,
  }
}

export function advanceOneDay(state: GameState): GameState {
  const nextDate = addOneDay(state.currentDate)
  const nextDay = state.day + 1

  const events = createDailyEvents(nextDay, nextDate)

  return {
    ...state,
    currentDate: nextDate,
    day: nextDay,
    inbox: [...events.messages, ...state.inbox],
    decisions: [
      ...events.decisions,
      ...(state.decisions ?? []),
    ],
  }
}
