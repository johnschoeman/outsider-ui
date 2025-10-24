import { Option, Schema as S } from "effect"
import { Class, Html, OnClick, button, div, h1, h2, h3, li, p, span, ul } from "foldkit/html"

import { Game, Player } from "../domain"
import * as Message from "../message"

export const LobbyModel = S.Struct({
  gameState: Game.GameState,
  currentPlayerId: S.String,
})

export type LobbyModel = S.Schema.Type<typeof LobbyModel>

export const init = (lobbyId: string, playerId: string, playerName: string): LobbyModel => ({
  gameState: {
    lobbyId,
    players: [
      {
        id: playerId,
        name: playerName,
        role: Option.none(),
        vote: Option.none(),
        hasVoted: false,
      },
    ],
    status: "Pending",
    phase: Option.none(),
    secretWord: Option.none(),
    wordGuessed: Option.none(),
    phaseTimer: Option.none(),
    masterId: Option.none(),
    outsiderId: Option.none(),
    winner: Option.none(),
  },
  currentPlayerId: playerId,
})

export const addPlayer =
  (player: Player.Player) =>
  (model: LobbyModel): LobbyModel => ({
    ...model,
    gameState: {
      ...model.gameState,
      players: [...model.gameState.players, player],
    },
  })

export const removePlayer =
  (playerId: string) =>
  (model: LobbyModel): LobbyModel => ({
    ...model,
    gameState: {
      ...model.gameState,
      players: model.gameState.players.filter((p) => p.id !== playerId),
    },
  })

export const startGame = (model: LobbyModel): LobbyModel => {
  if (model.gameState.players.length < 3) {
    return model // Need at least 3 players
  }

  const shuffledPlayers = [...model.gameState.players].sort(() => Math.random() - 0.5)
  const masterIndex = 0
  const outsiderIndex = 1

  const updatedPlayers = shuffledPlayers.map((player, index) => {
    if (index === masterIndex) {
      return { ...player, role: Option.some("Master" as const) }
    } else if (index === outsiderIndex) {
      return { ...player, role: Option.some("Outsider" as const) }
    } else {
      return { ...player, role: Option.some("Commoner" as const) }
    }
  })

  return {
    ...model,
    gameState: {
      ...model.gameState,
      players: updatedPlayers,
      status: "InProgress",
      phase: Option.some("RoleAssignment"),
      masterId: Option.some(shuffledPlayers[masterIndex].id),
      outsiderId: Option.some(shuffledPlayers[outsiderIndex].id),
    },
  }
}

const renderPlayerList = (players: readonly Player.Player[], currentPlayerId: string): Html => {
  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const otherPlayers = players.filter((p) => p.id !== currentPlayerId)

  return div(
    [Class("space-y-4")],
    [
      // Current player section
      div(
        [Class("bg-blue-50 rounded-lg p-4 border-2 border-blue-200")],
        [
          h3([Class("text-lg font-semibold text-blue-800 mb-2")], ["You"]),
          div(
            [Class("flex items-center justify-between")],
            [
              span([Class("text-blue-700 font-medium")], [currentPlayer?.name || "Unknown"]),
              span([Class("text-blue-600 text-sm")], ["(Host)"]),
            ],
          ),
        ],
      ),

      // Other players section
      ...(otherPlayers.length > 0
        ? [
            div(
              [],
              [
                h3([Class("text-lg font-semibold text-gray-800 mb-2")], ["Other Players"]),
                ul(
                  [Class("space-y-2")],
                  [...otherPlayers].map((player) =>
                    li(
                      [Class("bg-gray-50 rounded-lg p-3 border border-gray-200")],
                      [
                        div(
                          [Class("flex items-center justify-between")],
                          [
                            span([Class("text-gray-700 font-medium")], [player.name]),
                            span([Class("text-gray-500 text-sm")], ["Player"]),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ]
        : []),
    ],
  )
}

const renderGameInfo = (gameState: Game.GameState): Html => {
  const playerCount = gameState.players.length
  const canStart = playerCount >= 3 && playerCount <= 8
  const statusMessage = canStart
    ? "Ready to start!"
    : playerCount < 3
      ? `Need ${3 - playerCount} more player${3 - playerCount === 1 ? "" : "s"} (minimum 3)`
      : "Too many players (maximum 8)"

  return div(
    [Class("bg-gray-50 rounded-lg p-4 border border-gray-200")],
    [
      div(
        [Class("flex items-center justify-between mb-3")],
        [
          h3([Class("text-lg font-semibold text-gray-800")], ["Game Status"]),
          span(
            [
              Class(
                `px-3 py-1 rounded-full text-sm font-medium ${
                  canStart ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`,
              ),
            ],
            [gameState.status],
          ),
        ],
      ),
      div(
        [Class("space-y-2")],
        [
          div(
            [Class("flex justify-between text-sm")],
            [
              span([Class("text-gray-600")], ["Players:"]),
              span([Class("font-medium")], [`${playerCount}/8`]),
            ],
          ),
          p([Class("text-sm text-gray-600")], [statusMessage]),
        ],
      ),
    ],
  )
}

export function view(model: LobbyModel): Html {
  const canStartGame =
    model.gameState.players.length >= 3 &&
    model.gameState.players.length <= 8 &&
    model.gameState.status === "Pending"

  return div(
    [Class("min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-4")],
    [
      div(
        [Class("max-w-2xl mx-auto")],
        [
          // Header
          div(
            [Class("bg-white rounded-lg shadow-2xl p-6 mb-6")],
            [
              div(
                [Class("text-center mb-6")],
                [
                  h1([Class("text-3xl font-bold text-gray-800 mb-2")], ["Game Lobby"]),
                  div(
                    [Class("flex items-center justify-center space-x-4")],
                    [
                      span([Class("text-gray-600")], ["Lobby ID:"]),
                      span(
                        [
                          Class(
                            "text-2xl font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded",
                          ),
                        ],
                        [model.gameState.lobbyId],
                      ),
                    ],
                  ),
                ],
              ),

              // Game Info
              renderGameInfo(model.gameState),
            ],
          ),

          // Players Section
          div(
            [Class("bg-white rounded-lg shadow-2xl p-6 mb-6")],
            [
              h2([Class("text-2xl font-bold text-gray-800 mb-4")], ["Players"]),
              renderPlayerList(model.gameState.players, model.currentPlayerId),
            ],
          ),

          // Actions Section
          div(
            [Class("bg-white rounded-lg shadow-2xl p-6")],
            [
              div(
                [Class("flex flex-col sm:flex-row gap-4")],
                [
                  button(
                    [
                      OnClick(() => Message.StartGameClicked.make()),
                      Class(
                        `flex-1 py-3 px-6 rounded-md font-medium transition-colors duration-200 ${
                          canStartGame
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`,
                      ),
                    ],
                    ["Start Game"],
                  ),

                  button(
                    [
                      OnClick(() => Message.LeaveLobbyClicked.make()),
                      Class(
                        "flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md font-medium transition-colors duration-200",
                      ),
                    ],
                    ["Leave Lobby"],
                  ),
                ],
              ),

              // Game Rules Summary
              div(
                [Class("mt-6 pt-6 border-t border-gray-200")],
                [
                  h3([Class("text-lg font-semibold text-gray-800 mb-3")], ["How to Play"]),
                  div(
                    [Class("text-sm text-gray-600 space-y-2")],
                    [
                      p([], ["• 3-8 players: 1 Master, 1 Outsider, rest are Commoners"]),
                      p(
                        [],
                        [
                          "• Master creates a secret word and shares it with everyone except the Outsider",
                        ],
                      ),
                      p([], ["• Players discuss and try to identify the Outsider"]),
                      p([], ["• Vote to eliminate the Outsider to win!"]),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
