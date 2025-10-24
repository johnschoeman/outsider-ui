import { Option } from "effect"
import { Runtime } from "foldkit"
import { Class, Html, div, h1 } from "foldkit/html"

import * as App from "./app"
import * as Message from "./message"
import { Game, Landing, Lobby } from "./pages"

/* eslint-disable @typescript-eslint/consistent-type-assertions */

const view = (model: App.AppModel): Html => {
  switch (model.currentPage) {
    case "Landing": {
      return Landing.view(
        model.landingPage,
        (name) => Message.PlayerNameChanged.make({ name }) as Message.Message,
        (lobbyId) => Message.JoinLobbyIdChanged.make({ lobbyId }) as Message.Message,
        Message.CreateLobbyClicked.make() as Message.Message,
        Message.JoinLobbyClicked.make() as Message.Message,
        Message.ShowRules.make() as Message.Message,
      )
    }

    case "Lobby": {
      if (Option.isNone(model.lobbyPage)) {
        return div(
          [Class("min-h-screen bg-gray-100 flex items-center justify-center")],
          [h1([Class("text-2xl text-red-600")], ["Error: No lobby data"])],
        )
      }
      return Lobby.view(
        model.lobbyPage.value,
        Message.StartGameClicked.make() as Message.Message,
        Message.LeaveLobbyClicked.make() as Message.Message,
      )
    }

    case "Game": {
      if (Option.isNone(model.gamePage)) {
        return div(
          [Class("min-h-screen bg-gray-100 flex items-center justify-center")],
          [h1([Class("text-2xl text-red-600")], ["Error: No game data"])],
        )
      }
      return Game.view(
        model.gamePage.value,
        Message.ContinueToWordCreation.make() as Message.Message,
        (word) => Message.SecretWordChanged.make({ word }) as Message.Message,
        Message.SubmitSecretWord.make() as Message.Message,
        Message.ContinueToGuessing.make() as Message.Message,
        Message.WordGuessed.make() as Message.Message,
        Message.WordNotGuessed.make() as Message.Message,
        (playerId) => Message.VoteForPlayer.make({ playerId }) as Message.Message,
        Message.NewGame.make() as Message.Message,
      )
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
  Model: App.AppModel,
  init: App.init,
  update: App.update,
  view,
  container: document.getElementById("root")!,
})

Runtime.run(app)
