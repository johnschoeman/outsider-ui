import { Option } from "effect"
import { Runtime } from "foldkit"
import { Class, Html, div, h1 } from "foldkit/html"

import * as App from "./app"
import { Game, Landing, Lobby } from "./pages"

const view = (model: App.AppModel): Html => {
  switch (model.currentPage) {
    case "Landing": {
      return Landing.view(
        model.landingPage,
        App.playerNameChanged,
        App.joinLobbyIdChanged,
        App.createLobbyClicked,
        App.joinLobbyClicked,
        App.showRules,
        App.closeRules,
      )
    }

    case "Lobby": {
      if (Option.isNone(model.lobbyPage)) {
        return div(
          [Class("min-h-screen bg-gray-100 flex items-center justify-center")],
          [h1([Class("text-2xl text-red-600")], ["Error: No lobby data"])],
        )
      }
      return Lobby.view(model.lobbyPage.value, App.startGameClicked, App.leaveLobbyClicked)
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
        App.continueToWordCreation,
        App.secretWordChanged,
        App.submitSecretWord,
        App.continueToGuessing,
        App.wordGuessed,
        App.wordNotGuessed,
        App.voteForPlayer,
        App.newGame,
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
