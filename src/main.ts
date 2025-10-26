import { Effect, Match as M, Option, Schema as S } from "effect"
import { Runtime } from "foldkit"
import { Class, Html, div, h1 } from "foldkit/html"

import { Lobby } from "./domain"
import { loadPlayerName, savePlayerName } from "./localStorage"
import * as Message from "./message"
import { Game, Landing, Lobby as LobbyPage } from "./pages"

// Model

export const AppPage = S.Literal("Landing", "Lobby", "Game")
export type AppPage = S.Schema.Type<typeof AppPage>

export const AppModel = S.Struct({
  currentPage: AppPage,
  currentPlayerId: S.Option(S.String),
  currentPlayerName: S.String,
  currentLobbyId: S.Option(S.String),
  landingPage: Landing.LandingModel,
  lobbyPage: S.Option(LobbyPage.LobbyModel),
  gamePage: S.Option(Game.GameModel),
})

export type AppModel = S.Schema.Type<typeof AppModel>

// Init

export const init = (): [AppModel, Runtime.Command<Message.Message>[]] => [
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

// Commands

const createLobby: Runtime.Command<Message.CreateLobbySuccess | Message.CreateLobbyFailure> =
  Effect.gen(function* () {
    const result = yield* Effect.tryPromise(() =>
      fetch("/api/lobby", { method: "POST" }).then((res) => {
        if (!res.ok) throw new Error("Create Lobby request failed")
        return res.json() as unknown as { lobbyId: string }
      }),
    )

    return Message.CreateLobbySuccess.make({ lobbyId: result.lobbyId })
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed(Message.CreateLobbyFailure.make({ error: error.message })),
    ),
  )

// Update

export const update = (
  model: AppModel,
  message: Message.Message,
): [AppModel, Runtime.Command<Message.Message>[]] => {
  const returnValue = M.value(message).pipe(
    M.withReturnType<[AppModel, Runtime.Command<Message.Message>[]]>(),
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

      CreateLobby: () => {
        const isValidForm = true
        if (isValidForm) {
          return [{ ...model }, [createLobby]]
        } else {
          return [{ ...model }, []]
        }
      },
      CreateLobbySuccess: () => {
        const lobbyId = Lobby.generateLobbyId()
        const playerId = crypto.randomUUID()
        const lobbyModel = LobbyPage.init(lobbyId, playerId, model.currentPlayerName)

        return [
          {
            ...model,
            currentPage: "Lobby",
            currentPlayerId: Option.some(playerId),
            currentLobbyId: Option.some(lobbyId),
            lobbyPage: Option.some(lobbyModel),
          },
          [],
        ]
      },
      CreateLobbyFailure: () => {
        return [{ ...model }, []]
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

// View

const view = (model: AppModel): Html => {
  switch (model.currentPage) {
    case "Landing": {
      return Landing.view(model.landingPage)
    }

    case "Lobby": {
      if (Option.isNone(model.lobbyPage)) {
        return div(
          [Class("min-h-screen bg-gray-100 flex items-center justify-center")],
          [h1([Class("text-2xl text-red-600")], ["Error: No lobby data"])],
        )
      }
      return LobbyPage.view(model.lobbyPage.value)
    }

    case "Game": {
      if (Option.isNone(model.gamePage)) {
        return div(
          [Class("min-h-screen bg-gray-100 flex items-center justify-center")],
          [h1([Class("text-2xl text-red-600")], ["Error: No game data"])],
        )
      }
      return Game.view(model.gamePage.value)
    }

    default: {
      return div(
        [Class("min-h-screen bg-gray-100 flex items-center justify-center")],
        [h1([Class("text-2xl text-gray-600")], ["Unknown state"])],
      )
    }
  }
}

const app = Runtime.makeElement({
  Model: AppModel,
  init,
  update,
  view,
  container: document.getElementById("root")!,
})

Runtime.run(app)
