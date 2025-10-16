import { Schema as S, Option } from 'effect'
import { 
  Class, 
  Html, 
  OnClick,
  OnInput,
  Type,
  Value,
  div, 
  h1, 
  h2,
  h3,
  p,
  button, 
  span,
  input,
  form,
  label 
} from 'foldkit/html'
import { GameState, Player } from '../domain'

export const GameModel = S.Struct({
  gameState: GameState,
  currentPlayerId: S.String,
  secretWordInput: S.String,
  secretWordError: S.Option(S.String),
})

export type GameModel = S.Schema.Type<typeof GameModel>

const getCurrentPlayer = (gameState: GameState, playerId: string): Player | undefined => {
  return gameState.players.find(p => p.id === playerId)
}

export const updateSecretWordInput = (word: string) => (model: GameModel): GameModel => ({
  ...model,
  secretWordInput: word,
  secretWordError: Option.none(),
})

export const validateSecretWord = (model: GameModel): GameModel => {
  const trimmedWord = model.secretWordInput.trim()
  if (trimmedWord.length === 0) {
    return {
      ...model,
      secretWordError: Option.some('Please enter a secret word'),
    }
  }
  if (trimmedWord.length < 2) {
    return {
      ...model,
      secretWordError: Option.some('Word must be at least 2 characters'),
    }
  }
  if (trimmedWord.length > 30) {
    return {
      ...model,
      secretWordError: Option.some('Word must be 30 characters or less'),
    }
  }
  if (!/^[a-zA-Z\s]+$/.test(trimmedWord)) {
    return {
      ...model,
      secretWordError: Option.some('Word must contain only letters and spaces'),
    }
  }
  return {
    ...model,
    secretWordError: Option.none(),
  }
}

const getRoleDisplayInfo = (role: 'Master' | 'Outsider' | 'Commoner') => {
  switch (role) {
    case 'Master':
      return {
        title: 'Master',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300',
        description: 'You are the Master! You will create the secret word that everyone except the Outsider will know.',
        instructions: [
          'Share your role with everyone',
          'You will select a secret word next',
          'Help guide the discussion to identify the Outsider'
        ]
      }
    case 'Outsider':
      return {
        title: 'Outsider',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800', 
        borderColor: 'border-red-300',
        description: 'You are the Outsider! You don\'t know the secret word, but you must blend in and avoid being discovered.',
        instructions: [
          'Keep your role SECRET!',
          'Listen carefully to others\' hints',
          'Try to figure out the secret word',
          'Blend in during discussions'
        ]
      }
    case 'Commoner':
      return {
        title: 'Commoner',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300', 
        description: 'You are a Commoner! You will know the secret word and must help identify the Outsider.',
        instructions: [
          'Keep your role SECRET!',
          'You will learn the secret word soon',
          'Give hints without revealing the word',
          'Help identify the Outsider'
        ]
      }
  }
}

const renderRoleAssignment = (currentPlayer: Player): Html => {
  if (Option.isNone(currentPlayer.role)) {
    return div(
      [Class('text-center')],
      [p([Class('text-gray-600')], ['Assigning roles...'])]
    )
  }

  const role = currentPlayer.role.value
  const roleInfo = getRoleDisplayInfo(role)

  return div(
    [Class('max-w-2xl mx-auto')],
    [
      // Role Card
      div(
        [Class(`${roleInfo.bgColor} ${roleInfo.borderColor} border-2 rounded-lg p-6 shadow-lg mb-6`)],
        [
          div(
            [Class('text-center mb-4')],
            [
              h2([Class(`text-3xl font-bold ${roleInfo.textColor} mb-2`)], ['Your Role']),
              h1([Class(`text-4xl font-bold ${roleInfo.textColor}`)], [roleInfo.title]),
            ]
          ),
          
          p([Class(`${roleInfo.textColor} text-lg mb-4 text-center`)], [roleInfo.description]),
          
          div(
            [Class('mt-6')],
            [
              h3([Class(`text-lg font-semibold ${roleInfo.textColor} mb-3`)], ['Instructions:']),
              div(
                [Class('space-y-2')],
                roleInfo.instructions.map(instruction =>
                  div(
                    [Class(`flex items-start space-x-2 ${roleInfo.textColor}`)],
                    [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], [instruction])
                    ]
                  )
                )
              ),
            ]
          ),
        ]
      ),
    ]
  )
}

const renderWordCreation = <Message>(
  model: GameModel,
  onSecretWordChange: (word: string) => Message,
  onSubmitSecretWord: () => Message,
): Html => {
  const currentPlayer = getCurrentPlayer(model.gameState, model.currentPlayerId)
  
  if (!currentPlayer || Option.isNone(currentPlayer.role)) {
    return div(
      [Class('text-center')],
      [p([Class('text-gray-600')], ['Loading...'])]
    )
  }

  const isMaster = currentPlayer.role.value === 'Master'
  const hasError = Option.isSome(model.secretWordError)

  if (!isMaster) {
    return div(
      [Class('max-w-2xl mx-auto text-center')],
      [
        div(
          [Class('bg-blue-50 border-2 border-blue-200 rounded-lg p-6 shadow-lg')],
          [
            h2([Class('text-2xl font-bold text-blue-800 mb-4')], ['Word Creation Phase']),
            p([Class('text-blue-700 text-lg mb-4')], ['The Master is creating the secret word...']),
            div(
              [Class('bg-blue-100 rounded-lg p-4')],
              [
                h3([Class('text-lg font-semibold text-blue-800 mb-2')], ['What to expect:']),
                div(
                  [Class('text-blue-700 space-y-2 text-left')],
                  [
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['The Master will choose a word that you and others will know']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['The Outsider will NOT know this word']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Use this knowledge to identify the Outsider later']),
                    ]),
                  ]
                ),
              ]
            ),
          ]
        )
      ]
    )
  }

  return div(
    [Class('max-w-2xl mx-auto')],
    [
      div(
        [Class('bg-purple-50 border-2 border-purple-200 rounded-lg p-6 shadow-lg')],
        [
          div(
            [Class('text-center mb-6')],
            [
              h2([Class('text-3xl font-bold text-purple-800 mb-2')], ['Create Secret Word']),
              p([Class('text-purple-700 text-lg')], ['Choose a word that everyone except the Outsider will know']),
            ]
          ),

          div(
            [Class('space-y-4')],
            [
              div(
                [],
                [
                  label([Class('block text-sm font-medium text-purple-700 mb-2')], ['Secret Word']),
                  input([
                    Type('text'),
                    Value(model.secretWordInput),
                    OnInput((value) => onSecretWordChange(value)),
                    Class(`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      hasError ? 'border-red-500 bg-red-50' : 'border-purple-300'
                    }`),
                  ]),
                  ...(hasError ? [
                    p([Class('text-red-500 text-sm mt-1')], [Option.getOrElse(model.secretWordError, () => '')])
                  ] : []),
                ]
              ),

              div(
                [Class('bg-purple-100 rounded-lg p-4')],
                [
                  h3([Class('text-lg font-semibold text-purple-800 mb-2')], ['Tips for choosing a word:']),
                  div(
                    [Class('text-purple-700 space-y-1 text-sm')],
                    [
                      div([Class('flex items-start space-x-2')], [
                        span([Class('mt-0.5')], ['•']),
                        span([], ['Choose something specific but not too obscure']),
                      ]),
                      div([Class('flex items-start space-x-2')], [
                        span([Class('mt-0.5')], ['•']),
                        span([], ['Examples: "coffee", "bicycle", "ocean", "birthday"']),
                      ]),
                      div([Class('flex items-start space-x-2')], [
                        span([Class('mt-0.5')], ['•']),
                        span([], ['Avoid very abstract concepts or proper nouns']),
                      ]),
                    ]
                  ),
                ]
              ),

              button([
                OnClick(() => onSubmitSecretWord()),
                Class('w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200'),
              ], ['Share Word with Others']),
            ]
          ),
        ]
      ),
    ]
  )
}

const renderGameInfo = (gameState: GameState): Html => {
  const currentPhase = Option.getOrElse(gameState.phase, () => 'Unknown')
  
  return div(
    [Class('bg-white rounded-lg p-4 border border-gray-200 mb-6')],
    [
      div(
        [Class('flex items-center justify-between mb-2')],
        [
          span([Class('text-sm font-medium text-gray-600')], ['Game Phase:']),
          span([Class('px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium')], 
            [currentPhase.replace(/([A-Z])/g, ' $1').trim()]
          ),
        ]
      ),
      div(
        [Class('flex items-center justify-between')],
        [
          span([Class('text-sm font-medium text-gray-600')], ['Players:']),
          span([Class('text-sm text-gray-800')], [`${gameState.players.length} players`]),
        ]
      ),
    ]
  )
}

export function view<Message>(
  model: GameModel,
  onContinueToWordCreation: () => Message,
  onSecretWordChange: (word: string) => Message,
  onSubmitSecretWord: () => Message,
): Html {
  const currentPlayer = getCurrentPlayer(model.gameState, model.currentPlayerId)
  const currentPhase = Option.getOrElse(model.gameState.phase, () => 'Unknown')
  
  if (!currentPlayer) {
    return div(
      [Class('min-h-screen bg-gray-100 flex items-center justify-center')],
      [h1([Class('text-2xl text-red-600')], ['Error: Player not found'])]
    )
  }

  const isMaster = Option.isSome(currentPlayer.role) && currentPlayer.role.value === 'Master'

  return div(
    [Class('min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-4')],
    [
      div(
        [Class('max-w-4xl mx-auto')],
        [
          // Header
          div(
            [Class('text-center mb-6')],
            [
              h1([Class('text-4xl font-bold text-white mb-2')], ['Outsider Game']),
              p([Class('text-indigo-200')], [`Lobby: ${model.gameState.lobbyId}`]),
            ]
          ),

          // Game Info
          renderGameInfo(model.gameState),

          // Main Content
          div(
            [Class('bg-white rounded-lg shadow-2xl p-6')],
            [
              ...(currentPhase === 'RoleAssignment' ? [
                renderRoleAssignment(currentPlayer),
                
                // Action Section for Role Assignment
                div(
                  [Class('text-center mt-8')],
                  [
                    ...(isMaster ? [
                      p([Class('text-gray-600 mb-4')], ['When everyone has seen their role, you can continue to word creation.']),
                      button([
                        OnClick(() => onContinueToWordCreation()),
                        Class('bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200'),
                      ], ['Continue to Word Creation']),
                    ] : [
                      p([Class('text-gray-600')], ['Waiting for the Master to continue...']),
                    ]),
                  ]
                ),
              ] : currentPhase === 'WordCreation' ? [
                renderWordCreation(model, onSecretWordChange, onSubmitSecretWord),
              ] : [
                div(
                  [Class('text-center')],
                  [
                    h2([Class('text-2xl font-bold text-gray-800 mb-4')], [`Phase: ${currentPhase}`]),
                    p([Class('text-gray-600')], ['This phase is not yet implemented.']),
                  ]
                ),
              ]),
            ]
          ),
        ]
      )
    ]
  )
}