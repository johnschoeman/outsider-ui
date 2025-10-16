import { Option } from 'effect'
import { Runtime } from 'foldkit'
import { Class, Html, div, h1 } from 'foldkit/html'
import * as App from './app'
import { Landing, Lobby, Game } from './pages'

const view = (model: App.AppModel): Html => {
  if (model.currentState === 'Landing') {
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

  if (model.currentState === 'Lobby') {
    if (Option.isNone(model.lobbyPage)) {
      return div(
        [Class('min-h-screen bg-gray-100 flex items-center justify-center')],
        [h1([Class('text-2xl text-red-600')], ['Error: No lobby data'])]
      )
    }

    return Lobby.view(
      model.lobbyPage.value,
      App.startGameClicked,
      App.leaveLobbyClicked,
    )
  }

  // Game state
  if (model.currentState === 'Game') {
    if (Option.isNone(model.gamePage)) {
      return div(
        [Class('min-h-screen bg-gray-100 flex items-center justify-center')],
        [h1([Class('text-2xl text-red-600')], ['Error: No game data'])]
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

  // Fallback
  return div(
    [Class('min-h-screen bg-gray-100 flex items-center justify-center')],
    [
      h1([Class('text-2xl text-gray-600')], ['Unknown state']),
    ]
  )
}

const app = Runtime.makeApplication({
  Model: App.AppModel,
  init: () => [App.init(), []],
  update: (model: App.AppModel, message: App.Message) => [App.update(model, message), []],
  view,
  container: document.getElementById('root')!,
  browser: {
    onUrlRequest: () => ({ _tag: 'NoOp' as const }),
    onUrlChange: () => ({ _tag: 'NoOp' as const }),
  },
})

Runtime.run(app)