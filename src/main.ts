import {
  FetchHttpClient,
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import { Effect, Match as M, Option, Schema as S } from "effect"
import { Runtime } from "foldkit"
import { Html } from "foldkit/html"
import { ts } from "foldkit/schema"
import { evo } from "foldkit/struct"

import { Class, div, h1 } from "./html"
import { Landing } from "./pages"

// Model

export const AppPage = S.Literal("Landing", "Lobby", "Game")
export type AppPage = S.Schema.Type<typeof AppPage>

export const AppModel = S.Struct({
  currentPage: AppPage, // eventually replace with Route
  currentPlayerName: S.Option(S.String),
  currentLobbyId: S.Option(S.String),
  apiHealthCheck: S.Option(S.String),
  landingPage: Landing.LandingModel,
})

export type AppModel = S.Schema.Type<typeof AppModel>

// Init

export const init = (): [AppModel, Runtime.Command<Message>[]] => [
  {
    currentPage: "Landing",
    currentPlayerName: Option.none(),
    currentLobbyId: Option.none(),
    apiHealthCheck: Option.none(),
    landingPage: Landing.init(),
  },
  [getHealth()],
]

// Message

export const NoOp = ts("NoOp")
export const CheckAPIHealthSuccess = ts("CheckAPIHealthSuccess")
export const CheckAPIHealthFailure = ts("CheckAPIHealthFailure", { reason: S.String })
export const LandingMessage = ts("LandingMessage", { message: Landing.SubMessage })

export const Message = S.Union(NoOp, CheckAPIHealthSuccess, CheckAPIHealthFailure, LandingMessage)

type NoOp = typeof NoOp.Type
type LandingMessage = typeof LandingMessage.Type
type CheckAPIHealthSuccess = typeof CheckAPIHealthSuccess.Type
type CheckAPIHealthFailure = typeof CheckAPIHealthFailure.Type

export type Message = typeof Message.Type

// Commands

// const API_URL = "http://localhost:3000/api/health-check"
const API_URL = "api/health-check"
const getHealth = (): Runtime.Command<CheckAPIHealthSuccess | CheckAPIHealthFailure> =>
  Effect.gen(function* () {
    console.log("running api health check")
    const client = yield* HttpClient.HttpClient
    return yield* HttpClientRequest.get(API_URL).pipe(
      HttpClientRequest.bodyJson({}),
      Effect.flatMap(client.execute),
    )
  }).pipe(
    Effect.provide(FetchHttpClient.layer),
    Effect.map(() => CheckAPIHealthSuccess.make()),
    Effect.catchTags({
      HttpBodyError: (httpBodyError) => {
        const tag: string = httpBodyError.reason._tag
        const message = `Http Body Error - tag: ${tag}`
        return Effect.succeed(CheckAPIHealthFailure.make({ reason: message }))
      },
      RequestError: (requestError) => {
        const reason: string = requestError.reason
        const message = `Http Body Error - tag: ${reason}`
        return Effect.succeed(CheckAPIHealthFailure.make({ reason: message }))
      },
      ResponseError: (_ResponseError) =>
        Effect.succeed(CheckAPIHealthFailure.make({ reason: "Http Response Error" })),
    }),
  )

// Update

export const update = (
  model: AppModel,
  message: Message,
): [AppModel, ReadonlyArray<Runtime.Command<Message>>] => {
  const returnValue = M.value(message).pipe(
    M.withReturnType<[AppModel, Runtime.Command<Message>[]]>(),
    M.tagsExhaustive({
      NoOp: () => {
        const nextModel = evo(model, {})
        return [nextModel, []]
      },
      CheckAPIHealthSuccess: () => {
        console.log("CheckAPIHealthSuccess")
        const nextModel = evo(model, {})
        return [nextModel, []]
      },
      CheckAPIHealthFailure: ({ reason }) => {
        console.log("CheckAPIHealthFailure", reason)
        const nextModel = evo(model, {})
        return [nextModel, []]
      },
      LandingMessage: ({ message }) => {
        const [nextLandingPage, commands] = Landing.update(model.landingPage, message)
        const nextModel: AppModel = evo(model, { landingPage: () => nextLandingPage })
        const nextCommands = commands.map(
          Effect.map((landingMessage) => LandingMessage.make({ message: landingMessage })),
        )
        return [nextModel, nextCommands]
      },
    }),
  )

  return returnValue
}

// View

const view = (model: AppModel): Html => {
  switch (model.currentPage) {
    case "Landing": {
      return Landing.view(model.landingPage, (message) => LandingMessage.make({ message: message }))
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
