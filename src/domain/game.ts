import { Schema as S, Option } from 'effect'
import { Player } from './player'

export const GamePhase = S.Literal(
  'RoleAssignment',
  'WordCreation',
  'ShareSecretWord',
  'PlayerGuessing',
  'Voting',
  'Results'
)
export type GamePhase = S.Schema.Type<typeof GamePhase>

export const GameStatus = S.Literal('Pending', 'InProgress', 'Completed')
export type GameStatus = S.Schema.Type<typeof GameStatus>

export const GameState = S.Struct({
  lobbyId: S.String,
  players: S.Array(Player),
  status: GameStatus,
  phase: S.Option(GamePhase),
  secretWord: S.Option(S.String),
  wordGuessed: S.Option(S.Boolean),
  phaseTimer: S.Option(S.Number), // seconds remaining
  masterId: S.Option(S.String),
  outsiderId: S.Option(S.String),
  winner: S.Option(S.Literal('OutsiderWins', 'TeamWins')),
})

export type GameState = S.Schema.Type<typeof GameState>

export const createGameState = (lobbyId: string): GameState => ({
  lobbyId,
  players: [],
  status: 'Pending',
  phase: Option.none(),
  secretWord: Option.none(),
  wordGuessed: Option.none(),
  phaseTimer: Option.none(),
  masterId: Option.none(),
  outsiderId: Option.none(),
  winner: Option.none(),
})

export const addPlayer = (player: Player) => (gameState: GameState): GameState => ({
  ...gameState,
  players: [...gameState.players, player],
})

export const removePlayer = (playerId: string) => (gameState: GameState): GameState => ({
  ...gameState,
  players: gameState.players.filter(p => p.id !== playerId),
})

export const startGame = (gameState: GameState): GameState => {
  if (gameState.players.length < 3) {
    return gameState // Need at least 3 players
  }

  const shuffledPlayers = [...gameState.players].sort(() => Math.random() - 0.5)
  const masterIndex = 0
  const outsiderIndex = 1
  
  const updatedPlayers = shuffledPlayers.map((player, index): Player => {
    if (index === masterIndex) {
      return { ...player, role: Option.some('Master' as const) }
    } else if (index === outsiderIndex) {
      return { ...player, role: Option.some('Outsider' as const) }
    } else {
      return { ...player, role: Option.some('Commoner' as const) }
    }
  })

  return {
    ...gameState,
    players: updatedPlayers,
    status: 'InProgress',
    phase: Option.some('RoleAssignment'),
    masterId: Option.some(shuffledPlayers[masterIndex].id),
    outsiderId: Option.some(shuffledPlayers[outsiderIndex].id),
  }
}

export const setSecretWord = (word: string) => (gameState: GameState): GameState => ({
  ...gameState,
  secretWord: Option.some(word),
  phase: Option.some('ShareSecretWord'),
  phaseTimer: Option.some(30), // 30 seconds
})

export const startGuessingPhase = (gameState: GameState): GameState => ({
  ...gameState,
  phase: Option.some('PlayerGuessing'),
  phaseTimer: Option.some(300), // 5 minutes
})

export const setWordGuessed = (guessed: boolean) => (gameState: GameState): GameState => ({
  ...gameState,
  wordGuessed: Option.some(guessed),
  phase: Option.some('Voting'),
  phaseTimer: Option.some(300), // 5 minutes
})

export const calculateResults = (gameState: GameState): GameState => {
  const outsider = gameState.players.find(p => 
    Option.isSome(p.role) && p.role.value === 'Outsider'
  )
  
  if (!outsider) {
    return gameState
  }

  const votesForOutsider = gameState.players.filter(p =>
    Option.isSome(p.vote) && p.vote.value === outsider.id
  ).length

  const totalVoters = gameState.players.length
  const majorityVotes = Math.floor(totalVoters / 2) + 1
  
  const winner = votesForOutsider >= majorityVotes ? 'TeamWins' : 'OutsiderWins'

  return {
    ...gameState,
    phase: Option.some('Results'),
    winner: Option.some(winner),
    phaseTimer: Option.some(60), // 60 seconds to show results
  }
}

export const resetToLobby = (gameState: GameState): GameState => ({
  ...gameState,
  status: 'Pending',
  phase: Option.none(),
  secretWord: Option.none(),
  wordGuessed: Option.none(),
  phaseTimer: Option.none(),
  masterId: Option.none(),
  outsiderId: Option.none(),
  winner: Option.none(),
  players: gameState.players.map(player => ({
    ...player,
    role: Option.none(),
    vote: Option.none(),
    hasVoted: false,
  })),
})