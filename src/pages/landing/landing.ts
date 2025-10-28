import { Effect, Match as M, Option, Schema as S } from "effect"
import { Runtime } from "foldkit"
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
import { ts } from "foldkit/schema"
import { evo } from "foldkit/struct"

import { LandingMessage } from "../../main"
import { rulesModal } from "./rulesModal"

// Model

export const LandingModel = S.Struct({
  playerNameInput: S.String,
  nameError: S.Option(S.String),
  lobbyIdInput: S.String,
  lobbyError: S.Option(S.String),
  showRulesModal: S.Boolean,
})

export type LandingModel = S.Schema.Type<typeof LandingModel>

// Init

export const init = (): LandingModel => ({
  playerNameInput: "",
  nameError: Option.none(),
  lobbyIdInput: "",
  lobbyError: Option.none(),
  showRulesModal: false,
})

// Message

export const NoOp = ts("NoOp")
export const PlayerNameInputChanged = ts("PlayerNameInputChanged", { nameInput: S.String })
export const LobbyIdInputChanged = ts("LobbyIdInputChanged", { lobbyIdInput: S.String })
export const CreateLobby = ts("CreateLobby")
export const CreateLobbySuccess = ts("CreateLobbySuccess", { lobbyId: S.String })
export const CreateLobbyFailure = ts("CreateLobbyFailure", { error: S.String })
export const JoinLobbyClicked = ts("JoinLobbyClicked")
export const ShowRules = ts("ShowRules")
export const CloseRules = ts("CloseRules")

export const Message = S.Union(
  NoOp,
  PlayerNameInputChanged,
  LobbyIdInputChanged,
  CreateLobby,
  CreateLobbySuccess,
  CreateLobbyFailure,
  JoinLobbyClicked,
  ShowRules,
  CloseRules,
)

type PlayerNameInputChanged = typeof PlayerNameInputChanged.Type
type LobbyIdInputChanged = typeof LobbyIdInputChanged.Type
type CreateLobby = typeof CreateLobby.Type
type CreateLobbySuccess = typeof CreateLobbySuccess.Type
type CreateLobbyFailure = typeof CreateLobbyFailure.Type
type JoinLobbyClicked = typeof JoinLobbyClicked.Type
type ShowRules = typeof ShowRules.Type
type CloseRules = typeof CloseRules.Type

type Message = typeof Message.Type

// Commands

const createLobby: Runtime.Command<CreateLobbySuccess | CreateLobbyFailure> = Effect.gen(
  function* () {
    const result = yield* Effect.tryPromise(() =>
      fetch("/api/lobby", { method: "POST" }).then((res) => {
        if (!res.ok) throw new Error("Create Lobby request failed")
        return res.json() as unknown as { lobbyId: string }
      }),
    )

    return CreateLobbySuccess.make({ lobbyId: result.lobbyId })
  },
).pipe(
  Effect.catchAll((error) => Effect.succeed(CreateLobbyFailure.make({ error: error.message }))),
)

// Update

export const update = (
  model: LandingModel,
  message: Message,
): [LandingModel, ReadonlyArray<Effect.Effect<Message>>] => {
  const returnValue = M.value(message).pipe(
    M.withReturnType<[LandingModel, ReadonlyArray<Effect.Effect<Message>>]>(),
    M.tagsExhaustive({
      NoOp: () => {
        const nextModel = evo(model, {})
        return [nextModel, []]
      },
      PlayerNameInputChanged: ({ nameInput }) => {
        const nextModel = evo(model, { playerNameInput: () => nameInput })
        return [nextModel, []]
      },
      LobbyIdInputChanged: ({ lobbyIdInput }) => {
        const nextModel = evo(model, { lobbyIdInput: () => lobbyIdInput })
        return [nextModel, []]
      },
      CreateLobby: () => {
        const nextModel = evo(model, {})
        return [nextModel, [createLobby]]
      },
      CreateLobbySuccess: () => {
        const nextModel = evo(model, {})
        return [nextModel, []]
      },
      CreateLobbyFailure: () => {
        const nextModel = evo(model, {})
        return [nextModel, []]
      },
      JoinLobbyClicked: () => {
        const nextModel = evo(model, {})
        return [nextModel, []]
      },
      ShowRules: () => {
        const nextModel = evo(model, { showRulesModal: () => true })
        return [nextModel, []]
      },
      CloseRules: () => {
        const nextModel = evo(model, { showRulesModal: () => false })
        return [nextModel, []]
      },
    }),
  )
  return returnValue
}

// View

const header = <ParentMessage>(toMessage: (message: Message) => ParentMessage): Html => {
  return div(
    [Class("text-center mb-8")],
    [
      h1([Class("text-4xl font-bold text-gray-800 mb-2")], ["Outsider"]),
      p([Class("text-gray-600 mb-4")], ["A social deduction game"]),
      button(
        [
          OnClick(toMessage(ShowRules.make())),
          Class(
            "text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200",
          ),
        ],
        ["📖 How to Play"],
      ),
    ],
  )
}

const playerNameSection = (model: LandingModel): Html => {
  const nameHasError = Option.isSome(model.nameError)

  return div(
    [Class("mb-6")],
    [
      label([Class("block text-sm font-medium text-gray-700 mb-2")], ["Your Name"]),
      input([
        Type("text"),
        Value(model.playerNameInput),
        OnInput((value) => PlayerNameInputChanged.make({ nameInput: value })),
        Class(
          `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            nameHasError ? "border-red-500 bg-red-50" : "border-gray-300"
          }`,
        ),
      ]),
      ...(nameHasError
        ? [p([Class("text-red-500 text-sm mt-1")], [Option.getOrElse(model.nameError, () => "")])]
        : []),
    ],
  )
}

const createNewGameSection = (): Html => {
  return div(
    [Class("border-t pt-4")],
    [
      h2([Class("text-lg font-semibold text-gray-800 mb-3")], ["Start New Game"]),
      button(
        [
          OnClick(LandingMessage.make({ message: CreateLobby.make() })),
          Class(
            "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          ),
        ],
        ["Create Lobby"],
      ),
    ],
  )
}

const joinExistingGameSection = (model: LandingModel): Html => {
  const lobbyHasError = Option.isSome(model.lobbyError)

  return div(
    [Class("border-t pt-4")],
    [
      h2([Class("text-lg font-semibold text-gray-800 mb-3")], ["Join Existing Game"]),
      div(
        [Class("space-y-3")],
        [
          div(
            [],
            [
              label([Class("block text-sm font-medium text-gray-700 mb-1")], ["Lobby ID"]),
              input([
                Type("text"),
                Value(model.lobbyIdInput),
                OnInput((value) => LobbyIdInputChanged.make({ lobbyIdInput: value })),
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
              OnClick(JoinLobbyClicked.make()),
              Class(
                "w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
              ),
            ],
            ["Join Lobby"],
          ),
        ],
      ),
    ],
  )
}

const gameActionsSection = (model: LandingModel): Html => {
  return div([Class("space-y-4")], [createNewGameSection(), joinExistingGameSection(model)])
}

export function view<ParentMessage>(
  model: LandingModel,
  toMessage: (message: Message) => ParentMessage,
): Html {
  return div(
    [
      Class(
        "min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4",
      ),
    ],
    [
      div(
        [Class("bg-white rounded-lg shadow-2xl p-8 w-full max-w-md")],
        [header(toMessage), playerNameSection(model), gameActionsSection(model)],
      ),
      rulesModal(model.showRulesModal, toMessage(CloseRules.make())),
    ],
  )
}
