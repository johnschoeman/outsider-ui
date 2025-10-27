import { Effect, Match as M, Option, Schema as S } from "effect"
import { Runtime } from "foldkit"
import { Class, Html, div, h1 } from "foldkit/html"
import { ts } from "foldkit/schema"
import { evo } from "foldkit/struct"

import { Landing } from "./pages"

// Model

export const AppPage = S.Literal("Landing", "Lobby", "Game")
export type AppPage = S.Schema.Type<typeof AppPage>

export const AppModel = S.Struct({
  currentPage: AppPage, // eventually replace with Route
  currentPlayerName: S.Option(S.String),
  currentLobbyId: S.Option(S.String),
  landingPage: Landing.LandingModel,
})

export type AppModel = S.Schema.Type<typeof AppModel>

// Init

export const init = (): [AppModel, Runtime.Command<Message>[]] => [
  {
    currentPage: "Landing",
    currentPlayerName: Option.none(),
    currentLobbyId: Option.none(),
    landingPage: Landing.init(),
  },
  [],
]

// Message

export const NoOp = ts("NoOp")
export const LandingMessage = ts("LandingMessage", { message: Landing.Message })

export const Message = S.Union(NoOp, LandingMessage)

type NoOp = typeof NoOp.Type
type LandingMessage = typeof LandingMessage.Type

type Message = typeof Message.Type

// Commands

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
      return Landing.view(model.landingPage)
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
