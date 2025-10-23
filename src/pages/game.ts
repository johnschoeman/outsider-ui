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
  h4,
  h5,
  p,
  button, 
  span,
  input,
  label 
} from 'foldkit/html'
import { Game, Player } from '../domain'

export const GameModel = S.Struct({
  gameState: Game.GameState,
  currentPlayerId: S.String,
  secretWordInput: S.String,
  secretWordError: S.Option(S.String),
})

export type GameModel = S.Schema.Type<typeof GameModel>

const getCurrentPlayer = (gameState: Game.GameState, playerId: string): Player.Player | undefined => {
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

const renderRoleAssignment = (currentPlayer: Player.Player): Html => {
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

const renderShareSecretWord = <Message>(
  model: GameModel,
  onContinueToGuessing: () => Message,
): Html => {
  const currentPlayer = getCurrentPlayer(model.gameState, model.currentPlayerId)
  const timeRemaining = Option.getOrElse(model.gameState.phaseTimer, () => 0)
  
  if (!currentPlayer || Option.isNone(currentPlayer.role)) {
    return div(
      [Class('text-center')],
      [p([Class('text-gray-600')], ['Loading...'])]
    )
  }

  const isOutsider = currentPlayer.role.value === 'Outsider'
  const isMaster = currentPlayer.role.value === 'Master'
  const secretWord = Option.getOrElse(model.gameState.secretWord, () => '')

  if (isOutsider) {
    return div(
      [Class('max-w-2xl mx-auto text-center')],
      [
        div(
          [Class('bg-red-50 border-2 border-red-200 rounded-lg p-6 shadow-lg')],
          [
            h2([Class('text-3xl font-bold text-red-800 mb-4')], ['Word Sharing Phase']),
            div(
              [Class('bg-red-100 rounded-lg p-6 mb-6')],
              [
                h3([Class('text-xl font-bold text-red-800 mb-3')], ['⏰ Wait Here']),
                p([Class('text-red-700 text-lg mb-4')], ['The other players are learning the secret word...']),
                div(
                  [Class('text-3xl font-bold text-red-800 mb-4')],
                  [`${timeRemaining}s`]
                ),
              ]
            ),
            div(
              [Class('bg-red-100 rounded-lg p-4')],
              [
                h3([Class('text-lg font-semibold text-red-800 mb-2')], ['Your Mission:']),
                div(
                  [Class('text-red-700 space-y-2 text-left')],
                  [
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['You are the OUTSIDER - you don\'t know the secret word']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Listen carefully to the discussion for clues']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Try to blend in and avoid being discovered']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Guess what the word might be from the hints']),
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
    [Class('max-w-2xl mx-auto text-center')],
    [
      div(
        [Class('bg-green-50 border-2 border-green-200 rounded-lg p-6 shadow-lg')],
        [
          h2([Class('text-3xl font-bold text-green-800 mb-4')], ['Word Sharing Phase']),
          div(
            [Class('bg-green-100 rounded-lg p-6 mb-6')],
            [
              h3([Class('text-lg font-semibold text-green-800 mb-3')], ['🔍 The Secret Word Is:']),
              div(
                [Class('text-4xl font-bold text-green-900 bg-white rounded-lg p-4 border-2 border-green-300 mb-4')],
                [secretWord.toUpperCase()]
              ),
              p([Class('text-green-700')], ['Memorize this word - the Outsider cannot see it!']),
              div(
                [Class('text-2xl font-bold text-green-800 mt-4')],
                [`${timeRemaining}s remaining`]
              ),
            ]
          ),
          div(
            [Class('bg-green-100 rounded-lg p-4')],
            [
              h3([Class('text-lg font-semibold text-green-800 mb-2')], ['Your Mission:']),
              div(
                [Class('text-green-700 space-y-2 text-left')],
                [
                  div([Class('flex items-start space-x-2')], [
                    span([Class('text-lg mt-0.5')], ['•']),
                    span([], ['Remember this word for the discussion phase']),
                  ]),
                  div([Class('flex items-start space-x-2')], [
                    span([Class('text-lg mt-0.5')], ['•']),
                    span([], ['Give hints about the word without saying it directly']),
                  ]),
                  div([Class('flex items-start space-x-2')], [
                    span([Class('text-lg mt-0.5')], ['•']),
                    span([], ['Watch for who seems confused or out of place']),
                  ]),
                  div([Class('flex items-start space-x-2')], [
                    span([Class('text-lg mt-0.5')], ['•']),
                    span([], ['Work together to identify the Outsider']),
                  ]),
                ]
              ),
            ]
          ),
          
          ...(isMaster && timeRemaining === 0 ? [
            div(
              [Class('mt-6')],
              [
                button([
                  OnClick(() => onContinueToGuessing()),
                  Class('bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200'),
                ], ['Start Discussion Phase']),
              ]
            ),
          ] : []),
        ]
      ),
    ]
  )
}

const renderPlayerGuessing = <Message>(
  model: GameModel,
  onWordGuessed: () => Message,
  onWordNotGuessed: () => Message,
): Html => {
  const currentPlayer = getCurrentPlayer(model.gameState, model.currentPlayerId)
  const timeRemaining = Option.getOrElse(model.gameState.phaseTimer, () => 0)
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`
  
  if (!currentPlayer || Option.isNone(currentPlayer.role)) {
    return div(
      [Class('text-center')],
      [p([Class('text-gray-600')], ['Loading...'])]
    )
  }

  const isOutsider = currentPlayer.role.value === 'Outsider'
  const isMaster = currentPlayer.role.value === 'Master'
  const secretWord = Option.getOrElse(model.gameState.secretWord, () => '')

  return div(
    [Class('max-w-4xl mx-auto')],
    [
      // Main Discussion Area
      div(
        [Class('bg-white rounded-lg shadow-2xl p-6 mb-6')],
        [
          div(
            [Class('text-center mb-6')],
            [
              h2([Class('text-3xl font-bold text-gray-800 mb-2')], ['Discussion Phase']),
              div(
                [Class('flex items-center justify-center space-x-4 mb-4')],
                [
                  div(
                    [Class('bg-blue-100 px-4 py-2 rounded-lg')],
                    [
                      span([Class('text-blue-800 font-semibold')], ['Time Remaining: ']),
                      span([Class('text-blue-900 font-bold text-xl')], [timeDisplay]),
                    ]
                  ),
                ]
              ),
              p([Class('text-gray-600 text-lg')], ['Discuss and give hints about the secret word. Try to identify the Outsider!']),
            ]
          ),

          // Role-specific Information
          ...(isOutsider ? [
            div(
              [Class('bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6')],
              [
                h3([Class('text-lg font-bold text-red-800 mb-2')], ['🕵️ Your Mission (Outsider)']),
                div(
                  [Class('text-red-700 space-y-2')],
                  [
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Listen carefully to hints about the secret word']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Try to participate naturally without revealing you don\'t know the word']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Blend in and avoid suspicion']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['You win if you\'re not voted out!']),
                    ]),
                  ]
                ),
              ]
            ),
          ] : [
            div(
              [Class('bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6')],
              [
                h3([Class('text-lg font-bold text-green-800 mb-2')], ['🔍 Your Mission (Team)']),
                div(
                  [Class('text-green-700 space-y-2')],
                  [
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], [`The secret word is: "${secretWord.toUpperCase()}"`]),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Give hints without saying the word directly']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Watch for who seems confused or gives vague responses']),
                    ]),
                    div([Class('flex items-start space-x-2')], [
                      span([Class('text-lg mt-0.5')], ['•']),
                      span([], ['Work together to identify the Outsider']),
                    ]),
                  ]
                ),
              ]
            ),
          ]),

          // Discussion Guidelines
          div(
            [Class('bg-gray-50 rounded-lg p-4 mb-6')],
            [
              h3([Class('text-lg font-semibold text-gray-800 mb-3')], ['💬 Discussion Guidelines']),
              div(
                [Class('grid md:grid-cols-2 gap-4 text-sm text-gray-700')],
                [
                  div(
                    [Class('space-y-2')],
                    [
                      div([Class('flex items-start space-x-2')], [
                        span([Class('text-green-600 mt-0.5')], ['✓']),
                        span([], ['Give clues about the word\'s category, use, or properties']),
                      ]),
                      div([Class('flex items-start space-x-2')], [
                        span([Class('text-green-600 mt-0.5')], ['✓']),
                        span([], ['Share personal experiences related to the word']),
                      ]),
                      div([Class('flex items-start space-x-2')], [
                        span([Class('text-green-600 mt-0.5')], ['✓']),
                        span([], ['Ask others what they think about the word']),
                      ]),
                    ]
                  ),
                  div(
                    [Class('space-y-2')],
                    [
                      div([Class('flex items-start space-x-2')], [
                        span([Class('text-red-600 mt-0.5')], ['✗']),
                        span([], ['Don\'t say the secret word directly']),
                      ]),
                      div([Class('flex items-start space-x-2')], [
                        span([Class('text-red-600 mt-0.5')], ['✗']),
                        span([], ['Don\'t spell out the word or give obvious rhymes']),
                      ]),
                      div([Class('flex items-start space-x-2')], [
                        span([Class('text-red-600 mt-0.5')], ['✗']),
                        span([], ['Don\'t directly accuse someone of being the Outsider yet']),
                      ]),
                    ]
                  ),
                ]
              ),
            ]
          ),

          // Master Controls (when time is up)
          ...(timeRemaining === 0 ? [
            div(
              [Class('border-t pt-6')],
              [
                h3([Class('text-xl font-bold text-gray-800 mb-4 text-center')], ['Discussion Time Over!']),
                ...(isMaster ? [
                  div(
                    [Class('bg-purple-50 border-2 border-purple-200 rounded-lg p-4')],
                    [
                      h4([Class('text-lg font-semibold text-purple-800 mb-3')], ['Master: Was the word guessed?']),
                      p([Class('text-purple-700 mb-4 text-sm')], ['Based on the discussion, do you think the Outsider figured out the secret word?']),
                      div(
                        [Class('flex gap-4 justify-center')],
                        [
                          button([
                            OnClick(() => onWordGuessed()),
                            Class('bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200'),
                          ], ['Word Was Guessed']),
                          button([
                            OnClick(() => onWordNotGuessed()),
                            Class('bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200'),
                          ], ['Word Not Guessed']),
                        ]
                      ),
                    ]
                  ),
                ] : [
                  div(
                    [Class('text-center')],
                    [
                      p([Class('text-gray-600')], ['Waiting for the Master to decide if the word was guessed...']),
                    ]
                  ),
                ]),
              ]
            ),
          ] : []),
        ]
      ),
    ]
  )
}

const renderVoting = <Message>(
  model: GameModel,
  onVoteForPlayer: (playerId: string) => Message,
): Html => {
  const currentPlayer = getCurrentPlayer(model.gameState, model.currentPlayerId)
  const timeRemaining = Option.getOrElse(model.gameState.phaseTimer, () => 0)
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`
  
  if (!currentPlayer || Option.isNone(currentPlayer.role)) {
    return div(
      [Class('text-center')],
      [p([Class('text-gray-600')], ['Loading...'])]
    )
  }

  const currentVote = Option.getOrElse(currentPlayer.vote, () => '')
  const allPlayersVoted = model.gameState.players.every(p => p.hasVoted)
  const votedPlayersCount = model.gameState.players.filter(p => p.hasVoted).length
  const totalPlayers = model.gameState.players.length

  return div(
    [Class('max-w-4xl mx-auto')],
    [
      // Voting Header
      div(
        [Class('bg-white rounded-lg shadow-2xl p-6 mb-6')],
        [
          div(
            [Class('text-center mb-6')],
            [
              h2([Class('text-3xl font-bold text-gray-800 mb-2')], ['Voting Phase']),
              div(
                [Class('flex items-center justify-center space-x-6 mb-4')],
                [
                  div(
                    [Class('bg-blue-100 px-4 py-2 rounded-lg')],
                    [
                      span([Class('text-blue-800 font-semibold')], ['Time Remaining: ']),
                      span([Class('text-blue-900 font-bold text-xl')], [timeDisplay]),
                    ]
                  ),
                  div(
                    [Class('bg-gray-100 px-4 py-2 rounded-lg')],
                    [
                      span([Class('text-gray-800 font-semibold')], ['Votes: ']),
                      span([Class('text-gray-900 font-bold text-xl')], [`${votedPlayersCount}/${totalPlayers}`]),
                    ]
                  ),
                ]
              ),
              p([Class('text-gray-600 text-lg')], ['Vote for who you think is the Outsider!']),
            ]
          ),

          // Voting Status
          ...(allPlayersVoted ? [
            div(
              [Class('bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6')],
              [
                h3([Class('text-lg font-bold text-green-800 text-center')], ['🗳️ All Players Have Voted!']),
                p([Class('text-green-700 text-center')], ['Results will be revealed shortly...']),
              ]
            ),
          ] : [
            div(
              [Class('bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6')],
              [
                h3([Class('text-lg font-bold text-orange-800 text-center')], ['⏳ Waiting for All Votes']),
                p([Class('text-orange-700 text-center')], [`${totalPlayers - votedPlayersCount} player${totalPlayers - votedPlayersCount === 1 ? '' : 's'} still need to vote`]),
              ]
            ),
          ]),
        ]
      ),

      // Player Selection
      div(
        [Class('bg-white rounded-lg shadow-2xl p-6')],
        [
          h3([Class('text-xl font-bold text-gray-800 mb-4 text-center')], ['Select Who to Vote Out']),
          div(
            [Class('grid gap-4 md:grid-cols-2 lg:grid-cols-3')],
            [...model.gameState.players].map(player => {
              const isSelected = currentVote === player.id
              const isCurrentPlayer = player.id === model.currentPlayerId
              
              return div(
                [Class(`border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-red-500 bg-red-50' 
                    : isCurrentPlayer
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`)],
                [
                  div(
                    [
                      OnClick(() => {
                        if (!isCurrentPlayer && !allPlayersVoted) {
                          onVoteForPlayer(player.id)
                        }
                      }),
                      Class('text-center'),
                    ],
                    [
                      div(
                        [Class(`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-bold ${
                          isSelected 
                            ? 'bg-red-200 text-red-800' 
                            : isCurrentPlayer
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-blue-200 text-blue-800'
                        }`)],
                        [player.name.charAt(0).toUpperCase()]
                      ),
                      h4([Class(`font-semibold mb-2 ${
                        isSelected 
                          ? 'text-red-800' 
                          : isCurrentPlayer
                            ? 'text-gray-600'
                            : 'text-gray-800'
                      }`)], [player.name]),
                      ...(isCurrentPlayer ? [
                        p([Class('text-xs text-gray-500')], ['(You)'])
                      ] : isSelected ? [
                        p([Class('text-xs text-red-600 font-medium')], ['✓ Selected'])
                      ] : allPlayersVoted ? [
                        p([Class('text-xs text-gray-500')], ['Voting Closed'])
                      ] : [
                        p([Class('text-xs text-blue-600')], ['Click to Vote'])
                      ]),
                    ]
                  ),
                ]
              )
            })
          ),

          // Current Vote Display
          ...(currentVote ? [
            div(
              [Class('mt-6 pt-6 border-t text-center')],
              [
                p([Class('text-lg text-gray-700 mb-2')], ['Your current vote:']),
                div(
                  [Class('inline-flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-lg')],
                  [
                    span([Class('text-red-800 font-bold')], [
                      model.gameState.players.find(p => p.id === currentVote)?.name || 'Unknown'
                    ]),
                    ...(allPlayersVoted ? [] : [
                      span([Class('text-red-600 text-sm')], ['(Click another player to change)'])
                    ]),
                  ]
                ),
              ]
            ),
          ] : [
            div(
              [Class('mt-6 pt-6 border-t text-center')],
              [
                p([Class('text-gray-600')], ['Click on a player above to cast your vote']),
              ]
            ),
          ]),
        ]
      ),
    ]
  )
}

const renderResults = <Message>(
  model: GameModel,
  onNewGame: () => Message,
): Html => {
  const players = [...model.gameState.players]
  const outsiderPlayer = players.find(p => Option.isSome(p.role) && p.role.value === 'Outsider')
  const _masterPlayer = players.find(p => Option.isSome(p.role) && p.role.value === 'Master')
  
  // Count votes for each player
  const voteCounts = new Map<string, number>()
  const votersByTarget = new Map<string, string[]>()
  
  players.forEach(player => {
    if (Option.isSome(player.vote)) {
      const targetId = player.vote.value
      voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1)
      
      if (!votersByTarget.has(targetId)) {
        votersByTarget.set(targetId, [])
      }
      votersByTarget.get(targetId)!.push(player.name)
    }
  })
  
  // Find the player with the most votes
  let eliminatedPlayerId: string | null = null
  let maxVotes = 0
  
  for (const [playerId, voteCount] of voteCounts.entries()) {
    if (voteCount > maxVotes) {
      maxVotes = voteCount
      eliminatedPlayerId = playerId
    }
  }
  
  const eliminatedPlayer = eliminatedPlayerId ? players.find(p => p.id === eliminatedPlayerId) : null
  const outsiderEliminated = eliminatedPlayer?.id === outsiderPlayer?.id
  const secretWord = Option.getOrElse(model.gameState.secretWord, () => 'Unknown')
  
  // Determine winner
  const commonersWin = outsiderEliminated
  const _outsiderWins = !outsiderEliminated
  
  return div(
    [Class('space-y-6')],
    [
      // Results Header
      div(
        [Class(`text-center p-6 rounded-lg ${commonersWin ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'}`)],
        [
          h2([Class(`text-3xl font-bold mb-4 ${commonersWin ? 'text-green-800' : 'text-red-800'}`)], 
            [commonersWin ? '🎉 Commoners & Master Win!' : '🎭 Outsider Wins!']
          ),
          p([Class(`text-lg ${commonersWin ? 'text-green-700' : 'text-red-700'}`)], [
            commonersWin 
              ? 'The Outsider was successfully identified and eliminated!'
              : 'The Outsider survived and wins the game!'
          ]),
        ]
      ),
      
      // Secret Word Reveal
      div(
        [Class('bg-blue-50 border-2 border-blue-200 rounded-lg p-6')],
        [
          h3([Class('text-xl font-bold text-blue-800 mb-3 text-center')], ['🔍 Secret Word Revealed']),
          div(
            [Class('text-center')],
            [
              span([Class('text-3xl font-bold text-blue-900 bg-blue-200 px-6 py-3 rounded-lg')], [secretWord]),
            ]
          ),
        ]
      ),
      
      // Voting Results
      div(
        [Class('bg-gray-50 rounded-lg p-6')],
        [
          h3([Class('text-xl font-bold text-gray-800 mb-4 text-center')], ['📊 Voting Results']),
          
          // Eliminated Player
          ...(eliminatedPlayer ? [
            div(
              [Class('mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg')],
              [
                h4([Class('text-lg font-bold text-red-800 mb-2 text-center')], ['⚰️ Eliminated']),
                div(
                  [Class('text-center')],
                  [
                    div(
                      [Class('w-20 h-20 mx-auto mb-3 rounded-full bg-red-200 flex items-center justify-center text-3xl font-bold text-red-800')],
                      [eliminatedPlayer.name.charAt(0).toUpperCase()]
                    ),
                    p([Class('text-xl font-bold text-red-800')], [eliminatedPlayer.name]),
                    p([Class('text-red-700')], [`${maxVotes} vote${maxVotes === 1 ? '' : 's'}`]),
                    ...(eliminatedPlayer.role && Option.isSome(eliminatedPlayer.role) ? [
                      p([Class('text-sm text-red-600 font-medium mt-2')], [`Role: ${eliminatedPlayer.role.value}`]),
                    ] : []),
                  ]
                ),
              ]
            ),
          ] : [
            div(
              [Class('mb-6 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-center')],
              [
                p([Class('text-yellow-800 font-bold')], ['No player was eliminated (tie vote or no votes)']),
              ]
            ),
          ]),
          
          // All Vote Results
          div(
            [Class('grid gap-4 md:grid-cols-2 lg:grid-cols-3')],
            [
              ...Array.from(voteCounts.entries())
                .sort(([, a], [, b]) => b - a)
                .map(([playerId, voteCount]) => {
                  const player = players.find(p => p.id === playerId)
                  const voters = votersByTarget.get(playerId) || []
                  
                  if (!player) return div([], [])
                  
                  return div(
                    [Class(`border-2 rounded-lg p-4 ${playerId === eliminatedPlayerId ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`)],
                    [
                      div(
                        [Class('text-center')],
                        [
                          div(
                            [Class(`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-lg font-bold ${
                              playerId === eliminatedPlayerId ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                            }`)],
                            [player.name.charAt(0).toUpperCase()]
                          ),
                          h5([Class('font-semibold mb-1')], [player.name]),
                          p([Class('text-lg font-bold text-blue-600')], [`${voteCount} vote${voteCount === 1 ? '' : 's'}`]),
                          p([Class('text-xs text-gray-600 mt-2')], [`Voted by: ${voters.join(', ')}`]),
                        ]
                      ),
                    ]
                  )
                })
            ]
          ),
        ]
      ),
      
      // Player Roles Reveal
      div(
        [Class('bg-purple-50 border-2 border-purple-200 rounded-lg p-6')],
        [
          h3([Class('text-xl font-bold text-purple-800 mb-4 text-center')], ['👥 Player Roles']),
          div(
            [Class('grid gap-4 md:grid-cols-2 lg:grid-cols-3')],
            [
              ...players.map(player => {
                const role = Option.isSome(player.role) ? player.role.value : 'Unknown'
                const roleColors: Record<string, string> = {
                  Master: 'bg-yellow-100 border-yellow-300 text-yellow-800',
                  Outsider: 'bg-red-100 border-red-300 text-red-800',
                  Commoner: 'bg-blue-100 border-blue-300 text-blue-800',
                }
                
                return div(
                  [Class(`border-2 rounded-lg p-4 ${roleColors[role] || 'bg-gray-100 border-gray-300 text-gray-800'}`)],
                  [
                    div(
                      [Class('text-center')],
                      [
                        div(
                          [Class('w-12 h-12 mx-auto mb-2 rounded-full bg-white flex items-center justify-center text-lg font-bold')],
                          [player.name.charAt(0).toUpperCase()]
                        ),
                        h5([Class('font-semibold mb-1')], [player.name]),
                        p([Class('font-bold')], [role]),
                        ...(player.id === model.currentPlayerId ? [
                          p([Class('text-xs mt-1 opacity-75')], ['(You)'])
                        ] : [])
                      ]
                    ),
                  ]
                )
              })
            ]
          ),
        ]
      ),
      
      // New Game Button
      div(
        [Class('text-center')],
        [
          button([
            OnClick(() => onNewGame()),
            Class('bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200'),
          ], ['Play Again']),
        ]
      ),
    ]
  )
}

const renderGameInfo = (gameState: Game.GameState): Html => {
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
  onContinueToGuessing: () => Message,
  onWordGuessed: () => Message,
  onWordNotGuessed: () => Message,
  onVoteForPlayer: (playerId: string) => Message,
  onNewGame: () => Message,
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
              ] : currentPhase === 'ShareSecretWord' ? [
                renderShareSecretWord(model, onContinueToGuessing),
              ] : currentPhase === 'PlayerGuessing' ? [
                renderPlayerGuessing(model, onWordGuessed, onWordNotGuessed),
              ] : currentPhase === 'Voting' ? [
                renderVoting(model, onVoteForPlayer),
              ] : currentPhase === 'Results' ? [
                renderResults(model, onNewGame),
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
