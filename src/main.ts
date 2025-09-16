import { Array, Effect, Match, Option, Schema as S, pipe } from 'effect'
import { Fold, Route, Runtime } from 'foldkit'
import {
  Class,
  Href,
  Html,
  OnChange,
  OnClick,
  Placeholder,
  Value,
  a,
  button,
  div,
  h1,
  h2,
  input,
  li,
  p,
  ul,
} from 'foldkit/html'
import { load, pushUrl, replaceUrl } from 'foldkit/navigation'
import { int, literal, slash } from 'foldkit/route'
import { ST, ts } from 'foldkit/schema'
import { Url, UrlRequest } from 'foldkit/urlRequest'

// ROUTE

const HomeRoute = ts('Home')
const GameRoute = ts('Game', { gameId: S.String })
const NotFoundRoute = ts('NotFound', { path: S.String })

export const AppRoute = S.Union(HomeRoute, GameRoute, NotFoundRoute)

type HomeRoute = ST<typeof HomeRoute>
type GameRoute = ST<typeof GameRoute>
type NotFoundRoute = ST<typeof NotFoundRoute>

export type AppRoute = ST<typeof AppRoute>

const homeRouter = pipe(Route.root, Route.mapTo(HomeRoute))

const gameRouter = pipe(literal('game'), slash(Route.string('gameId')), Route.mapTo(GameRoute))

const routeParser = Route.oneOf(gameRouter, homeRouter)

const urlToAppRoute = Route.parseUrlWithFallback(routeParser, NotFoundRoute)

// MODEL

const Model = S.Struct({
  route: AppRoute,
  nameInput: S.String,
  lobbyIdInput: S.String,
})

type Model = ST<typeof Model>

// MESSAGE

const NoOp = ts('NoOp')
const UrlRequestReceived = ts('UrlRequestReceived', { request: UrlRequest })
const UrlChanged = ts('UrlChanged', { url: Url })
const UpdateName = ts('UpdateName', { nameInput: S.String })
const UpdateLobbyId = ts('UpdateLobbyId', { lobbyIdInput: S.String })
const JoinLobby = ts('JoinLobby', { lobbyId: S.String })
const CreateLobby = ts('CreateLobby')
const LobbyCreated = ts('LobbyCreated')
const LobbyJoined = ts('LobbyJoined')

export const Message = S.Union(
  NoOp,
  UrlRequestReceived,
  UrlChanged,
  UpdateName,
  UpdateLobbyId,
  JoinLobby,
  CreateLobby,
  LobbyCreated,
  LobbyJoined,
)

type NoOp = ST<typeof NoOp>
type UrlRequestReceived = ST<typeof UrlRequestReceived>
type UrlChanged = ST<typeof UrlChanged>
type UpdateLobbyId = ST<typeof UpdateLobbyId>
type CreateLobby = ST<typeof CreateLobby>
type JoinLobby = ST<typeof JoinLobby>
type LobbyCreated = ST<typeof LobbyCreated>
type LobbyJoined = ST<typeof LobbyJoined>

export type Message = ST<typeof Message>

// INIT

const init: Runtime.ApplicationInit<Model, Message> = (url: Url) => {
  return [{ route: urlToAppRoute(url), nameInput: '', lobbyIdInput: '' }, []]
}

// UPDATE

const update = Fold.fold<Model, Message>({
  NoOp: (model) => [model, []],

  UrlRequestReceived: (model, { request }) =>
    Match.value(request).pipe(
      Match.tagsExhaustive({
        Internal: ({ url }): [Model, Runtime.Command<NoOp>[]] => [
          {
            ...model,
            route: urlToAppRoute(url),
          },
          [pushUrl(url.pathname).pipe(Effect.as(NoOp.make()))],
        ],
        External: ({ href }): [Model, Runtime.Command<NoOp>[]] => [
          model,
          [load(href).pipe(Effect.as(NoOp.make()))],
        ],
      }),
    ),

  UrlChanged: (model, { url }) => [
    {
      ...model,
      route: urlToAppRoute(url),
    },
    [],
  ],

  UpdateLobbyId: (model, { lobbyIdInput }) => [
    {
      ...model,
      lobbyIdInput: lobbyIdInput,
    },
    [],
  ],

  UpdateName: (model, { nameInput }) => [
    {
      ...model,
      nameInput,
    },
    [],
  ],

  CreateLobby: (model) => [{ ...model }, [createLobby(model)]],

  JoinLobby: (model, { lobbyId }) => {
    return [
      {
        ...model,
        lobbyIdInput: '',
      },
      [joinLobby(lobbyId)],
    ]
  },

  LobbyJoined: (model) => [{ ...model }, []],

  LobbyCreated: (model) => [{ ...model }, []],
})

// COMMAND

const createLobby = (model: Model): Runtime.Command<LobbyCreated> => {
  return Effect.gen(function* () {
    return LobbyCreated.make()
  })
}

const joinLobby = (lobbyId: string): Runtime.Command<LobbyJoined> => {
  // console.log(`joining lobby: ${lobbyId}`)
  window.location.href = `/game/${lobbyId}` // DEVIN HOW DO I DO THIS
  return Effect.gen(function* () {
    return LobbyJoined.make()
  })
}

// VIEW

const navigationView = (currentRoute: AppRoute): Html => {
  const navLinkClassName = (isActive: boolean) =>
    `hover:bg-blue-600 font-medium px-3 py-1 rounded transition ${isActive ? 'bg-blue-700 bg-opacity-50' : ''}`

  return div(
    [Class('bg-blue-500 text-white p-4 mb-6')],
    [
      div(
        [Class('max-w-4xl mx-auto flex gap-6')],
        [
          a(
            [
              Href(homeRouter.build({ lobbyIdInput: '' })),
              Class(navLinkClassName(currentRoute._tag === 'Home')),
            ],
            ['outsider'],
          ),
        ],
      ),
    ],
  )
}

const homeView = (lobbyIdInput: string): Html =>
  div(
    [Class('max-w-4xl mx-auto px-4')],
    [
      h1([Class('text-4xl font-bold text-gray-800 mb-6')], ['Outsider']),
      p(
        [Class('text-lg text-gray-600 mb-4')],
        ['Weclome to outsider! Enter your name and join or create a lobby to play'],
      ),
      div([Class('w-full border-b m-4')]),
      input([
        Class('border rounded p-1 m-1'),
        Placeholder('Your Name'),
        OnChange((value) => UpdateName.make({ nameInput: value })),
      ]),
      div([Class('w-full border-b m-4')]),
      button([Class('bg-blue-500 text-white p-4 mb-6')], ['Create Lobby']),
      p([], ['Or']),
      input([
        Class('border rounded p-1'),
        Placeholder('Lobby Id'),
        OnChange((value) => UpdateLobbyId.make({ lobbyIdInput: value })),
      ]),
      button(
        [
          Class('bg-blue-500 text-white p-4 mb-6'),
          OnClick(JoinLobby.make({ lobbyId: lobbyIdInput })),
        ],
        ['Join Lobby'],
      ),
    ],
  )

const gameView = (gameId: string): Html =>
  div(
    [Class('max-w-4xl mx-auto px-4')],
    [
      h1([Class('text-4xl font-bold text-red-600 mb-6')], ['game view']),
      p([Class('text-lg text-gray-600 mb-4')], [`game view`]),
      p([Class('')], [`Lobby: ${gameId}`]),
    ],
  )

const notFoundView = (path: string): Html =>
  div(
    [Class('max-w-4xl mx-auto px-4')],
    [
      h1([Class('text-4xl font-bold text-red-600 mb-6')], ['404 - Page Not Found']),
      p([Class('text-lg text-gray-600 mb-4')], [`The path "${path}" was not found.`]),
      // TODO: Can this just be homeRouter.build()? A little cleaner.
      a(
        [Href(homeRouter.build({ lobbyIdInput: '' })), Class('text-blue-500 hover:underline')],
        ['← Go Home'],
      ),
    ],
  )

const view = (model: Model): Html => {
  const routeContent = Match.value(model.route).pipe(
    Match.tagsExhaustive({
      Home: () => homeView(model.lobbyIdInput),
      Game: ({ gameId }) => gameView(gameId),
      NotFound: ({ path }) => notFoundView(path),
    }),
  )

  return div([Class('min-h-screen bg-gray-100')], [navigationView(model.route), routeContent])
}

// RUN

const app = Runtime.makeApplication({
  Model,
  init,
  update,
  view,
  // TODO: Should this be document.getElementById('root') instead?
  container: document.body,
  browser: {
    onUrlRequest: (request) => UrlRequestReceived.make({ request }),
    onUrlChange: (url) => UrlChanged.make({ url }),
  },
})

Runtime.run(app)
