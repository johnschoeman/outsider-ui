import { Effect, Match as M, Schema as S, Option } from 'effect'
import { ST, ts } from 'foldkit/schema'
import { generateLobbyId, createPlayer } from './domain'
import { Landing, Lobby, Game } from './pages'

// APP STATE
export const AppState = S.Literal('Landing', 'Lobby', 'Game')
export type AppState = S.Schema.Type<typeof AppState>

export const AppModel = S.Struct({
  currentState: AppState,
  currentPlayerId: S.Option(S.String),
  currentPlayerName: S.String,
  currentLobbyId: S.Option(S.String),
  landingPage: Landing.LandingModel,
  lobbyPage: S.Option(Lobby.LobbyModel),
  gamePage: S.Option(Game.GameModel),
})

export type AppModel = S.Schema.Type<typeof AppModel>

// MESSAGES
const NoOp = ts('NoOp')
const PlayerNameChanged = ts('PlayerNameChanged', { name: S.String })
const JoinLobbyIdChanged = ts('JoinLobbyIdChanged', { lobbyId: S.String })
const CreateLobbyClicked = ts('CreateLobbyClicked')
const JoinLobbyClicked = ts('JoinLobbyClicked')
const LeaveLobbyClicked = ts('LeaveLobbyClicked')
const StartGameClicked = ts('StartGameClicked')
const ContinueToWordCreation = ts('ContinueToWordCreation')
const SecretWordChanged = ts('SecretWordChanged', { word: S.String })
const SubmitSecretWord = ts('SubmitSecretWord')

export const Message = S.Union(
  NoOp,
  PlayerNameChanged,
  JoinLobbyIdChanged,
  CreateLobbyClicked,
  JoinLobbyClicked,
  LeaveLobbyClicked,
  StartGameClicked,
  ContinueToWordCreation,
  SecretWordChanged,
  SubmitSecretWord,
)

type NoOp = ST<typeof NoOp>
type PlayerNameChanged = ST<typeof PlayerNameChanged>
type JoinLobbyIdChanged = ST<typeof JoinLobbyIdChanged>
type CreateLobbyClicked = ST<typeof CreateLobbyClicked>
type JoinLobbyClicked = ST<typeof JoinLobbyClicked>
type LeaveLobbyClicked = ST<typeof LeaveLobbyClicked>
type StartGameClicked = ST<typeof StartGameClicked>
type ContinueToWordCreation = ST<typeof ContinueToWordCreation>
type SecretWordChanged = ST<typeof SecretWordChanged>
type SubmitSecretWord = ST<typeof SubmitSecretWord>

export type Message = ST<typeof Message>

// INIT
export const init = (): AppModel => ({
  currentState: 'Landing',
  currentPlayerId: Option.none(),
  currentPlayerName: loadPlayerName(),
  currentLobbyId: Option.none(),
  landingPage: {
    ...Landing.init(),
    playerName: loadPlayerName(),
  },
  lobbyPage: Option.none(),
  gamePage: Option.none(),
})

// LOCAL STORAGE HELPERS
const PLAYER_NAME_KEY = 'outsider-player-name'

const loadPlayerName = (): string => {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) || ''
  } catch {
    return ''
  }
}

const savePlayerName = (name: string): void => {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name)
  } catch {
    // Ignore storage errors
  }
}

// UPDATE
export const update = (model: AppModel, message: Message): AppModel => {
  return M.value(message).pipe(
    M.withReturnType<AppModel>(),
    M.tagsExhaustive({
      NoOp: () => model,

      PlayerNameChanged: ({ name }) => {
        savePlayerName(name)
        return {
          ...model,
          currentPlayerName: name,
          landingPage: Landing.updatePlayerName(name)(model.landingPage),
        }
      },

      JoinLobbyIdChanged: ({ lobbyId }) => ({
        ...model,
        landingPage: Landing.updateJoinLobbyId(lobbyId)(model.landingPage),
      }),

      CreateLobbyClicked: () => {
        const validatedLanding = Landing.validateName(model.landingPage)
        if (Option.isSome(validatedLanding.nameError)) {
          return {
            ...model,
            landingPage: validatedLanding,
          }
        }

        const lobbyId = generateLobbyId()
        const playerId = crypto.randomUUID()
        const lobbyModel = Lobby.init(lobbyId, playerId, model.currentPlayerName)

        return {
          ...model,
          currentState: 'Lobby',
          currentPlayerId: Option.some(playerId),
          currentLobbyId: Option.some(lobbyId),
          landingPage: validatedLanding,
          lobbyPage: Option.some(lobbyModel),
        }
      },

      JoinLobbyClicked: () => {
        const validatedLanding = Landing.validateLobbyId(
          Landing.validateName(model.landingPage)
        )
        
        if (Option.isSome(validatedLanding.nameError) || Option.isSome(validatedLanding.lobbyError)) {
          return {
            ...model,
            landingPage: validatedLanding,
          }
        }

        const playerId = crypto.randomUUID()
        const lobbyModel = Lobby.init(validatedLanding.joinLobbyId, playerId, model.currentPlayerName)

        return {
          ...model,
          currentState: 'Lobby',
          currentPlayerId: Option.some(playerId),
          currentLobbyId: Option.some(validatedLanding.joinLobbyId),
          landingPage: validatedLanding,
          lobbyPage: Option.some(lobbyModel),
        }
      },

      LeaveLobbyClicked: () => ({
        ...model,
        currentState: 'Landing',
        currentPlayerId: Option.none(),
        currentLobbyId: Option.none(),
        lobbyPage: Option.none(),
        gamePage: Option.none(),
      }),

      StartGameClicked: () => {
        if (Option.isNone(model.lobbyPage) || Option.isNone(model.currentPlayerId)) {
          return model
        }

        const updatedLobby = Lobby.startGame(model.lobbyPage.value)
        const gameModel: Game.GameModel = {
          gameState: updatedLobby.gameState,
          currentPlayerId: model.currentPlayerId.value,
          secretWordInput: '',
          secretWordError: Option.none(),
        }
        
        return {
          ...model,
          currentState: 'Game',
          lobbyPage: Option.some(updatedLobby),
          gamePage: Option.some(gameModel),
        }
      },

      ContinueToWordCreation: () => {
        if (Option.isNone(model.gamePage)) {
          return model
        }

        const updatedGameState = {
          ...model.gamePage.value.gameState,
          phase: Option.some('WordCreation' as const),
        }

        const updatedGameModel = {
          ...model.gamePage.value,
          gameState: updatedGameState,
        }
        
        return {
          ...model,
          gamePage: Option.some(updatedGameModel),
        }
      },

      SecretWordChanged: ({ word }) => {
        if (Option.isNone(model.gamePage)) {
          return model
        }

        const updatedGameModel = Game.updateSecretWordInput(word)(model.gamePage.value)
        
        return {
          ...model,
          gamePage: Option.some(updatedGameModel),
        }
      },

      SubmitSecretWord: () => {
        if (Option.isNone(model.gamePage)) {
          return model
        }

        const validatedGameModel = Game.validateSecretWord(model.gamePage.value)
        
        if (Option.isSome(validatedGameModel.secretWordError)) {
          return {
            ...model,
            gamePage: Option.some(validatedGameModel),
          }
        }

        const secretWord = validatedGameModel.secretWordInput.trim()
        const updatedGameState = {
          ...validatedGameModel.gameState,
          secretWord: Option.some(secretWord),
          phase: Option.some('ShareSecretWord' as const),
          phaseTimer: Option.some(30), // 30 seconds
        }

        const updatedGameModel = {
          ...validatedGameModel,
          gameState: updatedGameState,
        }
        
        return {
          ...model,
          gamePage: Option.some(updatedGameModel),
        }
      },
    }),
  )
}

// MESSAGE CREATORS
export const playerNameChanged = (name: string): Message => 
  PlayerNameChanged.make({ name })

export const joinLobbyIdChanged = (lobbyId: string): Message => 
  JoinLobbyIdChanged.make({ lobbyId })

export const createLobbyClicked = (): Message => 
  CreateLobbyClicked.make()

export const joinLobbyClicked = (): Message => 
  JoinLobbyClicked.make()

export const leaveLobbyClicked = (): Message => 
  LeaveLobbyClicked.make()

export const startGameClicked = (): Message => 
  StartGameClicked.make()

export const continueToWordCreation = (): Message => 
  ContinueToWordCreation.make()

export const secretWordChanged = (word: string): Message => 
  SecretWordChanged.make({ word })

export const submitSecretWord = (): Message => 
  SubmitSecretWord.make()