import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import { Effect, Match as M, Option, Schema as S } from "effect"
import { Runtime } from "foldkit"
import { Html } from "foldkit/html"
import { ts } from "foldkit/schema"
import { evo } from "foldkit/struct"

import {
  Class,
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
} from "../../html"
import { Message } from "../../main"
import { rulesModal } from "./rulesModal"

// Model

export const LandingModel = S.Struct({
  playerNameInput: S.String,
  nameError: S.Option(S.String),
  lobbyIdInput: S.String,
  lobbyIdError: S.Option(S.String),
  createLobbyError: S.Option(S.String),
  showRulesModal: S.Boolean,
})

export type LandingModel = S.Schema.Type<typeof LandingModel>

// Init

export const init = (): LandingModel => ({
  playerNameInput: "",
  nameError: Option.none(),
  lobbyIdInput: "",
  lobbyIdError: Option.none(),
  createLobbyError: Option.none(),
  showRulesModal: false,
})

// Message

export const NoOp = ts("NoOp")
export const PlayerNameInputChanged = ts("PlayerNameInputChanged", { nameInput: S.String })
export const LobbyIdInputChanged = ts("LobbyIdInputChanged", { lobbyIdInput: S.String })
export const CreateLobby = ts("CreateLobby")
export const CreateLobbySuccess = ts("CreateLobbySuccess", { lobbyId: S.String })
export const CreateLobbyFailure = ts("CreateLobbyFailure", { errorMessage: S.String })
export const JoinLobbyClicked = ts("JoinLobbyClicked")
export const ShowRules = ts("ShowRules")
export const CloseRules = ts("CloseRules")

export const SubMessage = S.Union(
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

type SubMessage = typeof SubMessage.Type

// Commands

const Lobby = S.Struct({
  id: S.String,
})

// const API_URL = "http://localhost:3000/api/lobby"
const API_URL = "/api/lobby"
const createLobby = (
  playerName: string,
): Runtime.Command<CreateLobbySuccess | CreateLobbyFailure> =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    return yield* HttpClientRequest.post(API_URL).pipe(
      HttpClientRequest.bodyJson({ playerName }),
      Effect.flatMap(client.execute),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(Lobby)),
    )
  }).pipe(
    Effect.provide(FetchHttpClient.layer),
    Effect.map(({ id }) => CreateLobbySuccess.make({ lobbyId: id })),
    Effect.catchTags({
      HttpBodyError: (httpBodyError) => {
        const tag: string = httpBodyError.reason._tag
        const message = `Http Body Error - tag: ${tag}`
        return Effect.succeed(CreateLobbyFailure.make({ errorMessage: message }))
      },
      RequestError: (_RequestError) =>
        Effect.succeed(CreateLobbyFailure.make({ errorMessage: "Http Request Error" })),
      ResponseError: (_ResponseError) =>
        Effect.succeed(CreateLobbyFailure.make({ errorMessage: "Http Response Error" })),
      ParseError: (parseError) => {
        const errorString: string = parseError.toString()
        const message = `Parse Error: ${errorString}`
        return Effect.succeed(CreateLobbyFailure.make({ errorMessage: message }))
      },
    }),
  )

// Update

export const update = (
  model: LandingModel,
  subMessage: SubMessage,
): [LandingModel, ReadonlyArray<Effect.Effect<SubMessage>>] => {
  const returnValue = M.value(subMessage).pipe(
    M.withReturnType<[LandingModel, ReadonlyArray<Effect.Effect<SubMessage>>]>(),
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
        return [nextModel, [createLobby(model.playerNameInput)]]
      },
      CreateLobbySuccess: () => {
        const nextModel = evo(model, {})
        return [nextModel, []]
      },
      CreateLobbyFailure: ({ errorMessage }) => {
        const nextModel = evo(model, { createLobbyError: () => Option.some(errorMessage) })
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

const errorText = (error: Option.Option<string>): Html => {
  const showError = Option.isSome(error)

  if (showError) {
    return p([Class("text-red-500 text-sm mt-1")], [Option.getOrElse(error, () => "")])
  } else {
    return div([], [])
  }
}

const header = (toMessage: (message: SubMessage) => Message): Html => {
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

const playerNameSection = (
  model: LandingModel,
  toMessage: (message: SubMessage) => Message,
): Html => {
  const hasNameError = Option.isSome(model.nameError)

  return div(
    [Class("mb-6")],
    [
      label([Class("block text-sm font-medium text-gray-700 mb-2")], ["Your Name"]),
      input([
        Type("text"),
        Value(model.playerNameInput),
        OnInput((value) => toMessage(PlayerNameInputChanged.make({ nameInput: value }))),
        Class(
          `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            hasNameError ? "border-red-500 bg-red-50" : "border-gray-300"
          }`,
        ),
      ]),
      errorText(model.nameError),
    ],
  )
}

const createNewGameSection = (
  model: LandingModel,
  toMessage: (message: SubMessage) => Message,
): Html => {
  return div(
    [Class("border-t pt-4")],
    [
      h2([Class("text-lg font-semibold text-gray-800 mb-3")], ["Start New Game"]),
      button(
        [
          OnClick(toMessage(CreateLobby.make())),
          Class(
            "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          ),
        ],
        ["Create Lobby"],
      ),
      errorText(model.createLobbyError),
    ],
  )
}

const joinExistingGameSection = (
  model: LandingModel,
  toMessage: (message: SubMessage) => Message,
): Html => {
  const lobbyHasError = Option.isSome(model.lobbyIdError)

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
                OnInput((value) => toMessage(LobbyIdInputChanged.make({ lobbyIdInput: value }))),
                Class(
                  `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    lobbyHasError ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`,
                ),
              ]),
              errorText(model.lobbyIdError),
            ],
          ),
          button(
            [
              OnClick(toMessage(JoinLobbyClicked.make())),
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

const gameActionsSection = (
  model: LandingModel,
  toMessage: (message: SubMessage) => Message,
): Html => {
  return div(
    [Class("space-y-4")],
    [createNewGameSection(model, toMessage), joinExistingGameSection(model, toMessage)],
  )
}

export function view(model: LandingModel, toMessage: (message: SubMessage) => Message): Html {
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
          header(toMessage),
          playerNameSection(model, toMessage),
          gameActionsSection(model, toMessage),
        ],
      ),
      rulesModal(model.showRulesModal, toMessage(CloseRules.make())),
    ],
  )
}
