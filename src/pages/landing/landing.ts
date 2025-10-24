import { Option, Schema as S } from "effect"
import {
  Class,
  Html,
  OnClick,
  OnInput,
  Type,
  Value,
  button,
  div,
  h1,
  h2,
  input,
  label,
  p,
} from "foldkit/html"

import { Lobby, Player } from "../../domain"
import { renderRulesModal } from "./rulesModal"

// Model

export const LandingModel = S.Struct({
  playerName: S.String,
  joinLobbyId: S.String,
  nameError: S.Option(S.String),
  lobbyError: S.Option(S.String),
  showRulesModal: S.Boolean,
})

export type LandingModel = S.Schema.Type<typeof LandingModel>

// Init

export const init = (): LandingModel => ({
  playerName: "",
  joinLobbyId: "",
  nameError: Option.none(),
  lobbyError: Option.none(),
  showRulesModal: false,
})

// Update

export const updatePlayerName =
  (name: string) =>
  (model: LandingModel): LandingModel => ({
    ...model,
    playerName: name,
    nameError: Option.none(),
  })

export const updateJoinLobbyId =
  (lobbyId: string) =>
  (model: LandingModel): LandingModel => ({
    ...model,
    joinLobbyId: lobbyId.toUpperCase(),
    lobbyError: Option.none(),
  })

export const validateName = (model: LandingModel): LandingModel => {
  const nameError = Player.validateName(model.playerName)
  return {
    ...model,
    nameError,
  }
}

export const validateLobbyId = (model: LandingModel): LandingModel => {
  const lobbyError = Lobby.validateLobbyId(model.joinLobbyId)
  return {
    ...model,
    lobbyError,
  }
}

export const toggleRulesModal = (model: LandingModel): LandingModel => ({
  ...model,
  showRulesModal: !model.showRulesModal,
})

// View

export function view<Message>(
  model: LandingModel,
  onPlayerNameChange: (name: string) => Message,
  onJoinLobbyIdChange: (lobbyId: string) => Message,
  onCreateLobby: Message,
  onJoinLobby: Message,
  onShowRules: Message,
  onCloseRules: Message,
): Html {
  const nameHasError = Option.isSome(model.nameError)
  const lobbyHasError = Option.isSome(model.lobbyError)

  return div(
    [
      Class(
        "min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4",
      ),
    ],
    [
      div(
        [Class("bg-white rounded-lg shadow-2xl p-8 w-full max-w-md")],
        [
          // Header
          div(
            [Class("text-center mb-8")],
            [
              h1([Class("text-4xl font-bold text-gray-800 mb-2")], ["Outsider"]),
              p([Class("text-gray-600 mb-4")], ["A social deduction game"]),
              button(
                [
                  OnClick(onShowRules),
                  Class(
                    "text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200",
                  ),
                ],
                ["📖 How to Play"],
              ),
            ],
          ),

          // Player Name Section
          div(
            [Class("mb-6")],
            [
              label([Class("block text-sm font-medium text-gray-700 mb-2")], ["Your Name"]),
              input([
                Type("text"),
                Value(model.playerName),
                OnInput((value) => onPlayerNameChange(value)),
                Class(
                  `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    nameHasError ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`,
                ),
              ]),
              ...(nameHasError
                ? [
                    p(
                      [Class("text-red-500 text-sm mt-1")],
                      [Option.getOrElse(model.nameError, () => "")],
                    ),
                  ]
                : []),
            ],
          ),

          // Game Actions Section
          div(
            [Class("space-y-4")],
            [
              // Create New Game
              div(
                [Class("border-t pt-4")],
                [
                  h2([Class("text-lg font-semibold text-gray-800 mb-3")], ["Start New Game"]),
                  button(
                    [
                      OnClick(() => onCreateLobby),
                      Class(
                        "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      ),
                    ],
                    ["Create Lobby"],
                  ),
                ],
              ),

              // Join Existing Game
              div(
                [Class("border-t pt-4")],
                [
                  h2([Class("text-lg font-semibold text-gray-800 mb-3")], ["Join Existing Game"]),
                  div(
                    [Class("space-y-3")],
                    [
                      div(
                        [],
                        [
                          label(
                            [Class("block text-sm font-medium text-gray-700 mb-1")],
                            ["Lobby ID"],
                          ),
                          input([
                            Type("text"),
                            Value(model.joinLobbyId),
                            OnInput((value) => onJoinLobbyIdChange(value)),
                            Class(
                              `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                lobbyHasError ? "border-red-500 bg-red-50" : "border-gray-300"
                              }`,
                            ),
                          ]),
                          ...(lobbyHasError
                            ? [
                                p(
                                  [Class("text-red-500 text-sm mt-1")],
                                  [Option.getOrElse(model.lobbyError, () => "")],
                                ),
                              ]
                            : []),
                        ],
                      ),
                      button(
                        [
                          OnClick(() => onJoinLobby),
                          Class(
                            "w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                          ),
                        ],
                        ["Join Lobby"],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),

      // Rules Modal
      ...(model.showRulesModal ? [renderRulesModal(onCloseRules)] : []),
    ],
  )
}
