import { Option } from "effect"
import { Runtime } from "foldkit"
import { Class, Html, div, h1 } from "foldkit/html"

import * as App from "./app"
import { Game, Landing, Lobby } from "./pages"

/* eslint-disable @typescript-eslint/consistent-type-assertions */

const view = (model: App.AppModel): Html => {
  switch (model.currentPage) {
    case "Landing": {
      return Landing.view(
        model.landingPage,
        (name) => App.PlayerNameChanged.make({ name }) as App.Message,
        (lobbyId) => App.JoinLobbyIdChanged.make({ lobbyId }) as App.Message,
        App.CreateLobbyClicked.make() as App.Message,
        App.JoinLobbyClicked.make() as App.Message,
        App.ShowRules.make() as App.Message,
        App.CloseRules.make() as App.Message,
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
        App.StartGameClicked.make() as App.Message,
        App.LeaveLobbyClicked.make() as App.Message,
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
        App.ContinueToWordCreation.make() as App.Message,
        (word) => App.SecretWordChanged.make({ word }) as App.Message,
        App.SubmitSecretWord.make() as App.Message,
        App.ContinueToGuessing.make() as App.Message,
        App.WordGuessed.make() as App.Message,
        App.WordNotGuessed.make() as App.Message,
        (playerId) => App.VoteForPlayer.make({ playerId }) as App.Message,
        App.NewGame.make() as App.Message,
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
