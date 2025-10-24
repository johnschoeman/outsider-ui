import { Match as M, Option, Schema as S } from "effect"
import { Runtime } from "foldkit"
import { ST, ts } from "foldkit/schema"

import { Lobby } from "./domain"
import { loadPlayerName, savePlayerName } from "./localStorage"
import { Game, Landing, Lobby as LobbyPage } from "./pages"

// Model

export const AppState = S.Literal("Landing", "Lobby", "Game")
export type AppState = S.Schema.Type<typeof AppState>

export const AppModel = S.Struct({
  currentPage: AppState,
  currentPlayerId: S.Option(S.String),
  currentPlayerName: S.String,
  currentLobbyId: S.Option(S.String),
  landingPage: Landing.LandingModel,
  lobbyPage: S.Option(LobbyPage.LobbyModel),
  gamePage: S.Option(Game.GameModel),
})

export type AppModel = S.Schema.Type<typeof AppModel>

// Messages

const NoOp = ts("NoOp")
export const PlayerNameChanged = ts("PlayerNameChanged", { name: S.String })
export const JoinLobbyIdChanged = ts("JoinLobbyIdChanged", { lobbyId: S.String })
export const CreateLobbyClicked = ts("CreateLobbyClicked")
export const JoinLobbyClicked = ts("JoinLobbyClicked")
export const LeaveLobbyClicked = ts("LeaveLobbyClicked")
export const StartGameClicked = ts("StartGameClicked")
export const ContinueToWordCreation = ts("ContinueToWordCreation")
export const SecretWordChanged = ts("SecretWordChanged", { word: S.String })
export const SubmitSecretWord = ts("SubmitSecretWord")
export const ContinueToGuessing = ts("ContinueToGuessing")
const TimerTick = ts("TimerTick")
export const WordGuessed = ts("WordGuessed")
export const WordNotGuessed = ts("WordNotGuessed")
export const VoteForPlayer = ts("VoteForPlayer", { playerId: S.String })
export const NewGame = ts("NewGame")
export const ShowRules = ts("ShowRules")
export const CloseRules = ts("CloseRules")

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
  ContinueToGuessing,
  TimerTick,
  WordGuessed,
  WordNotGuessed,
  VoteForPlayer,
  NewGame,
  ShowRules,
  CloseRules,
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
type ContinueToGuessing = ST<typeof ContinueToGuessing>
type TimerTick = ST<typeof TimerTick>
type WordGuessed = ST<typeof WordGuessed>
type WordNotGuessed = ST<typeof WordNotGuessed>
type VoteForPlayer = ST<typeof VoteForPlayer>
type NewGame = ST<typeof NewGame>
type ShowRules = ST<typeof ShowRules>
type CloseRules = ST<typeof CloseRules>

export type Message = ST<typeof Message>

// Init

export const init = (): [AppModel, Runtime.Command<Message>[]] => [
  {
    currentPage: "Landing",
    currentPlayerId: Option.none(),
    currentPlayerName: loadPlayerName(),
    currentLobbyId: Option.none(),
    landingPage: {
      ...Landing.init(),
      playerName: loadPlayerName(),
    },
    lobbyPage: Option.none(),
    gamePage: Option.none(),
  },
  [],
]

// Update

export const update = (
  model: AppModel,
  message: Message,
): [AppModel, Runtime.Command<Message>[]] => {
  const returnValue = M.value(message).pipe(
    M.withReturnType<[AppModel, Runtime.Command<Message>[]]>(),
    M.tagsExhaustive({
      NoOp: () => [model, []],

      PlayerNameChanged: ({ name }) => {
        savePlayerName(name)
        return [
          {
            ...model,
            currentPlayerName: name,
            landingPage: Landing.updatePlayerName(name)(model.landingPage),
          },
          [],
        ]
      },

      JoinLobbyIdChanged: ({ lobbyId }) => [
        {
          ...model,
          landingPage: Landing.updateJoinLobbyId(lobbyId)(model.landingPage),
        },
        [],
      ],

      CreateLobbyClicked: () => {
        const validatedLanding = Landing.validateName(model.landingPage)
        if (Option.isSome(validatedLanding.nameError)) {
          return [
            {
              ...model,
              landingPage: validatedLanding,
            },
            [],
          ]
        }

        const lobbyId = Lobby.generateLobbyId()
        const playerId = crypto.randomUUID()
        const lobbyModel = LobbyPage.init(lobbyId, playerId, model.currentPlayerName)

        return [
          {
            ...model,
            currentPage: "Lobby",
            currentPlayerId: Option.some(playerId),
            currentLobbyId: Option.some(lobbyId),
            landingPage: validatedLanding,
            lobbyPage: Option.some(lobbyModel),
          },
          [],
        ]
      },

      JoinLobbyClicked: () => {
        const validatedLanding = Landing.validateLobbyId(Landing.validateName(model.landingPage))

        if (
          Option.isSome(validatedLanding.nameError) ||
          Option.isSome(validatedLanding.lobbyError)
        ) {
          return [
            {
              ...model,
              landingPage: validatedLanding,
            },
            [],
          ]
        }

        const playerId = crypto.randomUUID()
        const lobbyModel = LobbyPage.init(
          validatedLanding.joinLobbyId,
          playerId,
          model.currentPlayerName,
        )

        return [
          {
            ...model,
            currentPage: "Lobby",
            currentPlayerId: Option.some(playerId),
            currentLobbyId: Option.some(validatedLanding.joinLobbyId),
            landingPage: validatedLanding,
            lobbyPage: Option.some(lobbyModel),
          },
          [],
        ]
      },

      LeaveLobbyClicked: () => [
        {
          ...model,
          currentPage: "Landing",
          currentPlayerId: Option.none(),
          currentLobbyId: Option.none(),
          lobbyPage: Option.none(),
          gamePage: Option.none(),
        },
        [],
      ],

      StartGameClicked: () => {
        if (Option.isNone(model.lobbyPage) || Option.isNone(model.currentPlayerId)) {
          return [model, []]
        }

        const updatedLobby = LobbyPage.startGame(model.lobbyPage.value)
        const gameModel: Game.GameModel = {
          gameState: updatedLobby.gameState,
          currentPlayerId: model.currentPlayerId.value,
          secretWordInput: "",
          secretWordError: Option.none(),
        }

        return [
          {
            ...model,
            currentPage: "Game",
            lobbyPage: Option.some(updatedLobby),
            gamePage: Option.some(gameModel),
          },
          [],
        ]
      },

      ContinueToWordCreation: () => {
        if (Option.isNone(model.gamePage)) {
          return [model, []]
        }

        const updatedGameState = {
          ...model.gamePage.value.gameState,
          phase: Option.some("WordCreation" as const),
        }

        const updatedGameModel = {
          ...model.gamePage.value,
          gameState: updatedGameState,
        }

        return [
          {
            ...model,
            gamePage: Option.some(updatedGameModel),
          },
          [],
        ]
      },

      SecretWordChanged: ({ word }) => {
        if (Option.isNone(model.gamePage)) {
          return [model, []]
        }

        const updatedGameModel = Game.updateSecretWordInput(word)(model.gamePage.value)

        return [
          {
            ...model,
            gamePage: Option.some(updatedGameModel),
          },
          [],
        ]
      },

      SubmitSecretWord: () => {
        if (Option.isNone(model.gamePage)) {
          return [model, []]
        }

        const validatedGameModel = Game.validateSecretWord(model.gamePage.value)

        if (Option.isSome(validatedGameModel.secretWordError)) {
          return [
            {
              ...model,
              gamePage: Option.some(validatedGameModel),
            },
            [],
          ]
        }

        const secretWord = validatedGameModel.secretWordInput.trim()
        const updatedGameState = {
          ...validatedGameModel.gameState,
          secretWord: Option.some(secretWord),
          phase: Option.some("ShareSecretWord" as const),
          phaseTimer: Option.some(30), // 30 seconds
        }

        const updatedGameModel = {
          ...validatedGameModel,
          gameState: updatedGameState,
        }

        return [
          {
            ...model,
            gamePage: Option.some(updatedGameModel),
          },
          [],
        ]
      },

      ContinueToGuessing: () => {
        if (Option.isNone(model.gamePage)) {
          return [model, []]
        }

        const updatedGameState = {
          ...model.gamePage.value.gameState,
          phase: Option.some("PlayerGuessing" as const),
          phaseTimer: Option.some(300), // 5 minutes
        }

        const updatedGameModel = {
          ...model.gamePage.value,
          gameState: updatedGameState,
        }

        return [
          {
            ...model,
            gamePage: Option.some(updatedGameModel),
          },
          [],
        ]
      },

      TimerTick: () => {
        if (Option.isNone(model.gamePage)) {
          return [model, []]
        }

        const currentTimer = Option.getOrElse(model.gamePage.value.gameState.phaseTimer, () => 0)

        if (currentTimer <= 0) {
          return [model, []] // Timer already finished
        }

        const newTimer = currentTimer - 1
        const updatedGameState = {
          ...model.gamePage.value.gameState,
          phaseTimer: Option.some(newTimer),
        }

        const updatedGameModel = {
          ...model.gamePage.value,
          gameState: updatedGameState,
        }

        return [
          {
            ...model,
            gamePage: Option.some(updatedGameModel),
          },
          [],
        ]
      },

      WordGuessed: () => {
        if (Option.isNone(model.gamePage)) {
          return [model, []]
        }

        const updatedGameState = {
          ...model.gamePage.value.gameState,
          wordGuessed: Option.some(true),
          phase: Option.some("Voting" as const),
          phaseTimer: Option.some(300), // 5 minutes for voting
        }

        const updatedGameModel = {
          ...model.gamePage.value,
          gameState: updatedGameState,
        }

        return [
          {
            ...model,
            gamePage: Option.some(updatedGameModel),
          },
          [],
        ]
      },

      WordNotGuessed: () => {
        if (Option.isNone(model.gamePage)) {
          return [model, []]
        }

        const updatedGameState = {
          ...model.gamePage.value.gameState,
          wordGuessed: Option.some(false),
          phase: Option.some("Voting" as const),
          phaseTimer: Option.some(300), // 5 minutes for voting
        }

        const updatedGameModel = {
          ...model.gamePage.value,
          gameState: updatedGameState,
        }

        return [
          {
            ...model,
            gamePage: Option.some(updatedGameModel),
          },
          [],
        ]
      },

      VoteForPlayer: ({ playerId }) => {
        if (Option.isNone(model.gamePage) || Option.isNone(model.currentPlayerId)) {
          return [model, []]
        }

        const currentPlayerId = model.currentPlayerId.value
        const updatedPlayers = [...model.gamePage.value.gameState.players].map((player) => {
          if (player.id === currentPlayerId) {
            return {
              ...player,
              vote: Option.some(playerId),
              hasVoted: true,
            }
          }
          return player
        })

        // Check if all players have voted
        const allVoted = updatedPlayers.every((player) => player.hasVoted)

        const updatedGameState = {
          ...model.gamePage.value.gameState,
          players: updatedPlayers,
          ...(allVoted
            ? {
                phase: Option.some("Results" as const),
                phaseTimer: Option.none(),
              }
            : {}),
        }

        const updatedGameModel = {
          ...model.gamePage.value,
          gameState: updatedGameState,
        }

        return [
          {
            ...model,
            gamePage: Option.some(updatedGameModel),
          },
          [],
        ]
      },

      NewGame: () => [
        {
          ...model,
          currentPage: "Landing",
          currentPlayerId: Option.none(),
          currentLobbyId: Option.none(),
          landingPage: {
            ...Landing.init(),
            playerName: model.currentPlayerName,
          },
          lobbyPage: Option.none(),
          gamePage: Option.none(),
        },
        [],
      ],

      ShowRules: () => {
        return [
          {
            ...model,
            landingPage: Landing.toggleRulesModal(model.landingPage),
          },
          [],
        ]
      },

      CloseRules: () => [
        {
          ...model,
          landingPage: Landing.toggleRulesModal(model.landingPage),
        },
        [],
      ],
    }),
  )

  return returnValue
}
