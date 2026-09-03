import { Effect, Match as M, Option, Schema as S } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http"
import { Command } from "foldkit"
import { Html, HtmlBuilder } from "foldkit/html"
import { ts } from "foldkit/schema"
import { evo } from "foldkit/struct"

import { Message } from "../../main"
import { buttonClasses, inputClasses } from "./button"
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

export const SubMessage = S.Union([
  NoOp,
  PlayerNameInputChanged,
  LobbyIdInputChanged,
  CreateLobby,
  CreateLobbySuccess,
  CreateLobbyFailure,
  JoinLobbyClicked,
  ShowRules,
  CloseRules,
])

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
const CreateLobbyCommand = Command.define("CreateLobby", {
  args: { playerName: S.String },
  messages: [CreateLobbySuccess, CreateLobbyFailure],
  execute: ({ playerName }) =>
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
          const message = `Http Body Error - tag: ${httpBodyError.reason._tag}`
          return Effect.succeed(CreateLobbyFailure.make({ errorMessage: message }))
        },
        HttpClientError: (httpClientError) => {
          const message = `Http Client Error - reason: ${httpClientError.reason._tag}`
          return Effect.succeed(CreateLobbyFailure.make({ errorMessage: message }))
        },
        SchemaError: (schemaError) => {
          const errorString: string = String(schemaError)
          const message = `Schema Error: ${errorString}`
          return Effect.succeed(CreateLobbyFailure.make({ errorMessage: message }))
        },
      }),
    ),
})

// Update

export const update = (
  model: LandingModel,
  subMessage: SubMessage,
): [LandingModel, ReadonlyArray<Command.Command<SubMessage>>] => {
  const returnValue = M.value(subMessage).pipe(
    M.withReturnType<[LandingModel, ReadonlyArray<Command.Command<SubMessage>>]>(),
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
        return [nextModel, [CreateLobbyCommand({ playerName: model.playerNameInput })]]
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

const errorText = (error: Option.Option<string>, h: HtmlBuilder<Message>): Html => {
  const { div, p, Class } = h
  const showError = Option.isSome(error)

  if (showError) {
    return p([Class("text-error text-sm mt-1")], [Option.getOrElse(error, () => "")])
  } else {
    return div([], [])
  }
}

const header = (toMessage: (message: SubMessage) => Message, h: HtmlBuilder<Message>): Html => {
  const { div, button, h1, p, Class, OnClick } = h
  return div(
    [Class("text-center mb-8")],
    [
      h1([Class("text-4xl font-bold text-ink mb-2")], ["Outsider"]),
      p([Class("text-ink-muted mb-4")], ["A social deduction game"]),
      button(
        [
          OnClick(toMessage(ShowRules())),
          Class(
            "text-ink hover:text-ink-muted underline font-medium transition-colors duration-200",
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
  h: HtmlBuilder<Message>,
): Html => {
  const { div, input, label, Class, OnInput, Type, Value } = h
  const hasNameError = Option.isSome(model.nameError)

  return div(
    [Class("mb-6")],
    [
      label([Class("block text-sm font-medium text-ink-muted mb-2")], ["Your Name"]),
      input([
        Type("text"),
        Value(model.playerNameInput),
        OnInput((value) => toMessage(PlayerNameInputChanged.make({ nameInput: value }))),
        Class(inputClasses(hasNameError)),
      ]),
      errorText(model.nameError, h),
    ],
  )
}

const createNewGameSection = (
  model: LandingModel,
  toMessage: (message: SubMessage) => Message,
  h: HtmlBuilder<Message>,
): Html => {
  const { div, button, h2, Class, OnClick } = h
  return div(
    [Class("border-t pt-4")],
    [
      h2([Class("text-lg font-semibold text-ink mb-3")], ["Start New Game"]),
      button(
        [OnClick(toMessage(CreateLobby())), Class(`w-full ${buttonClasses("primary")}`)],
        ["Create Lobby"],
      ),
      errorText(model.createLobbyError, h),
    ],
  )
}

const joinExistingGameSection = (
  model: LandingModel,
  toMessage: (message: SubMessage) => Message,
  h: HtmlBuilder<Message>,
): Html => {
  const { div, button, h2, input, label, Class, OnClick, OnInput, Type, Value } = h
  const lobbyHasError = Option.isSome(model.lobbyIdError)

  return div(
    [Class("border-t pt-4")],
    [
      h2([Class("text-lg font-semibold text-ink mb-3")], ["Join Existing Game"]),
      div(
        [Class("space-y-3")],
        [
          div(
            [],
            [
              label([Class("block text-sm font-medium text-ink-muted mb-1")], ["Lobby ID"]),
              input([
                Type("text"),
                Value(model.lobbyIdInput),
                OnInput((value) => toMessage(LobbyIdInputChanged.make({ lobbyIdInput: value }))),
                Class(inputClasses(lobbyHasError)),
              ]),
              errorText(model.lobbyIdError, h),
            ],
          ),
          button(
            [OnClick(toMessage(JoinLobbyClicked())), Class(`w-full ${buttonClasses("secondary")}`)],
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
  h: HtmlBuilder<Message>,
): Html => {
  const { div, Class } = h
  return div(
    [Class("space-y-4")],
    [createNewGameSection(model, toMessage, h), joinExistingGameSection(model, toMessage, h)],
  )
}

export function view(
  model: LandingModel,
  toMessage: (message: SubMessage) => Message,
  h: HtmlBuilder<Message>,
): Html {
  const { div, Class } = h
  return div(
    [Class("min-h-screen bg-surface flex items-center justify-center p-4")],
    [
      div(
        [Class("bg-surface-card rounded-lg shadow-2xl p-8 w-full max-w-md")],
        [
          header(toMessage, h),
          playerNameSection(model, toMessage, h),
          gameActionsSection(model, toMessage, h),
        ],
      ),
      rulesModal(model.showRulesModal, toMessage(CloseRules()), h),
    ],
  )
}
