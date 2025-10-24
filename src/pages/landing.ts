import { Option, Schema as S } from 'effect'
import {
  Class,
  Html,
  OnClick,
  OnInput,
  Type,
  Value,
  button,
  div,
  h1,
  h2,
  h3,
  input,
  label,
  p,
  span,
} from 'foldkit/html'

import { Lobby, Player } from '../domain'

export const LandingModel = S.Struct({
  playerName: S.String,
  joinLobbyId: S.String,
  nameError: S.Option(S.String),
  lobbyError: S.Option(S.String),
  showRulesModal: S.Boolean,
})

export type LandingModel = S.Schema.Type<typeof LandingModel>

export const init = (): LandingModel => ({
  playerName: '',
  joinLobbyId: '',
  nameError: Option.none(),
  lobbyError: Option.none(),
  showRulesModal: false,
})

export const updatePlayerName =
  (name: string) =>
  (model: LandingModel): LandingModel => ({
    ...model,
    playerName: name,
    nameError: Option.none(),
  })

export const updateJoinLobbyId =
  (lobbyId: string) =>
  (model: LandingModel): LandingModel => ({
    ...model,
    joinLobbyId: lobbyId.toUpperCase(),
    lobbyError: Option.none(),
  })

export const validateName = (model: LandingModel): LandingModel => {
  const nameError = Player.validateName(model.playerName)
  return {
    ...model,
    nameError,
  }
}

export const validateLobbyId = (model: LandingModel): LandingModel => {
  const lobbyError = Lobby.validateLobbyId(model.joinLobbyId)
  return {
    ...model,
    lobbyError,
  }
}

export const toggleRulesModal = (model: LandingModel): LandingModel => ({
  ...model,
  showRulesModal: !model.showRulesModal,
})

const renderRulesModal = <Message>(onCloseRules: () => Message): Html => {
  return div(
    [Class('fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50')],
    [
      div(
        [Class('bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative')],
        [
          // Close button
          button(
            [
              OnClick(() => onCloseRules()),
              Class('absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold'),
            ],
            ['×'],
          ),

          // Title
          h1(
            [Class('text-3xl font-bold text-gray-800 mb-6 text-center')],
            ['How to Play Outsider'],
          ),

          // Game Overview
          div(
            [Class('mb-8')],
            [
              h2([Class('text-2xl font-bold text-purple-800 mb-4')], ['🎭 Game Overview']),
              p(
                [Class('text-gray-700 mb-4 text-lg')],
                [
                  'Outsider is a social deduction game where players work together to identify the "Outsider" among them. One player doesn\'t know the secret word that everyone else shares!',
                ],
              ),
              div(
                [Class('bg-blue-50 border-l-4 border-blue-400 p-4 mb-4')],
                [
                  p([Class('text-blue-800 font-semibold')], ['🎯 Goal:']),
                  p(
                    [Class('text-blue-700')],
                    ['• Commoners & Master: Find and vote out the Outsider'],
                  ),
                  p([Class('text-blue-700')], ['• Outsider: Blend in and survive the vote']),
                ],
              ),
            ],
          ),

          // Roles Section
          div(
            [Class('mb-8')],
            [
              h2([Class('text-2xl font-bold text-purple-800 mb-4')], ['👥 Player Roles']),
              div(
                [Class('grid md:grid-cols-3 gap-4 mb-4')],
                [
                  // Master
                  div(
                    [Class('bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4')],
                    [
                      h3([Class('text-lg font-bold text-yellow-800 mb-2')], ['👑 Master']),
                      p([Class('text-yellow-700 text-sm')], ['• Creates the secret word']),
                      p([Class('text-yellow-700 text-sm')], ['• Answers yes or no questions']),
                      p(
                        [Class('text-yellow-700 text-sm')],
                        ['• Works with commoners to find the Outsider'],
                      ),
                    ],
                  ),
                  // Commoner
                  div(
                    [Class('bg-blue-50 border-2 border-blue-300 rounded-lg p-4')],
                    [
                      h3([Class('text-lg font-bold text-blue-800 mb-2')], ['🧑‍🤝‍🧑 Commoners']),
                      p([Class('text-blue-700 text-sm')], ["• Don't know the secret word"]),
                      p(
                        [Class('text-blue-700 text-sm')],
                        ['• Work together with Master to find the Outsider'],
                      ),
                      p([Class('text-blue-700 text-sm')], ['• Majority of players']),
                    ],
                  ),
                  // Outsider
                  div(
                    [Class('bg-red-50 border-2 border-red-300 rounded-lg p-4')],
                    [
                      h3([Class('text-lg font-bold text-red-800 mb-2')], ['🎭 Outsider']),
                      p([Class('text-red-700 text-sm')], ['• Knows the secret word']),
                      p([Class('text-red-700 text-sm')], ['• Must pretend to not know it']),
                      p([Class('text-red-700 text-sm')], ['• Wins by surviving the vote']),
                    ],
                  ),
                ],
              ),
            ],
          ),

          // Game Phases
          div(
            [Class('mb-8')],
            [
              h2([Class('text-2xl font-bold text-purple-800 mb-4')], ['⏳ Game Phases']),
              div(
                [Class('space-y-4')],
                [
                  // Phase 1
                  div(
                    [Class('border-l-4 border-purple-400 bg-purple-50 p-4')],
                    [
                      h3(
                        [Class('font-bold text-purple-800 text-lg')],
                        ['Phase 1: Role Assignment'],
                      ),
                      p(
                        [Class('text-purple-700')],
                        ['Everyone secretly learns their role. The Master announces themselves.'],
                      ),
                    ],
                  ),
                  // Phase 2
                  div(
                    [Class('border-l-4 border-yellow-400 bg-yellow-50 p-4')],
                    [
                      h3([Class('font-bold text-yellow-800 text-lg')], ['Phase 2: Word Creation']),
                      p([Class('text-yellow-700')], ['The Master creates a secret word.']),
                    ],
                  ),
                  // Phase 3
                  div(
                    [Class('border-l-4 border-blue-400 bg-blue-50 p-4')],
                    [
                      h3([Class('font-bold text-blue-800 text-lg')], ['Phase 3: Word Sharing']),
                      p(
                        [Class('text-blue-700')],
                        [
                          'The Outsider see the secret word. The Commoners see "Waiting for others..."',
                        ],
                      ),
                    ],
                  ),
                  // Phase 4
                  div(
                    [Class('border-l-4 border-green-400 bg-green-50 p-4')],
                    [
                      h3(
                        [Class('font-bold text-green-800 text-lg')],
                        ['Phase 4: Word Guessing (5 minutes)'],
                      ),
                      p(
                        [Class('text-green-700')],
                        [
                          'Players take turns asking yes or no questions to the Master. If the players guess the word within time they move onto the Voting Phase. If the players **do not** guess the word, everyone loses and the game restarts.',
                        ],
                      ),
                    ],
                  ),
                  // Phase 5
                  div(
                    [Class('border-l-4 border-red-400 bg-red-50 p-4')],
                    [
                      h3(
                        [Class('font-bold text-red-800 text-lg')],
                        ['Phase 5: Voting (5 minutes)'],
                      ),
                      p(
                        [Class('text-red-700')],
                        [
                          'Everyone votes for who they think is the Outsider. You cannot vote for yourself.',
                        ],
                      ),
                    ],
                  ),
                  // Phase 6
                  div(
                    [Class('border-l-4 border-gray-400 bg-gray-50 p-4')],
                    [
                      h3([Class('font-bold text-gray-800 text-lg')], ['Phase 6: Results']),
                      p(
                        [Class('text-gray-700')],
                        [
                          'Results are revealed! See who won, how everyone voted, and what roles everyone had.',
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          // Strategy Tips
          div(
            [Class('mb-8')],
            [
              h2([Class('text-2xl font-bold text-purple-800 mb-4')], ['💡 Strategy Tips']),
              div(
                [Class('grid md:grid-cols-2 gap-6')],
                [
                  // For Commoners
                  div(
                    [Class('bg-green-50 border border-green-200 rounded-lg p-4')],
                    [
                      h3([Class('text-lg font-bold text-green-800 mb-3')], ['For Commoners']),
                      div(
                        [Class('space-y-2 text-green-700')],
                        [
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span(
                                [],
                                [
                                  'Do your best to ask questions quickly, the more questions asked the more information you have',
                                ],
                              ),
                            ],
                          ),
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span(
                                [],
                                ['Watch for players who give very direct or leading questions'],
                              ),
                            ],
                          ),
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span([], ['Pay attention to who avoids giving direct descriptions']),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),

                  // For Outsider
                  div(
                    [Class('bg-red-50 border border-red-200 rounded-lg p-4')],
                    [
                      h3([Class('text-lg font-bold text-red-800 mb-3')], ['For the Outsider:']),
                      div(
                        [Class('space-y-2 text-red-700')],
                        [
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span(
                                [],
                                [
                                  'Ask questions that lead the group to the answer within the time without being to obvious',
                                ],
                              ),
                            ],
                          ),
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span([], ['Agree with others and build on their questions']),
                            ],
                          ),
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span([], ['Try to deflect suspicion onto other players']),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),

                  // For Master
                  div(
                    [Class('bg-red-50 border border-red-200 rounded-lg p-4')],
                    [
                      h3([Class('text-lg font-bold text-red-800 mb-3')], ['For the Outsider:']),
                      div(
                        [Class('space-y-2 text-red-700')],
                        [
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span(
                                [],
                                [
                                  'Answer questions quickly, the more questions asked, the more information you have',
                                ],
                              ),
                            ],
                          ),
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span(
                                [],
                                [
                                  'If your word has multiple interpretations, try to pick one and be consistent',
                                ],
                              ),
                            ],
                          ),
                          p(
                            [Class('flex items-start')],
                            [
                              span([Class('mr-2 mt-1')], ['•']),
                              span(
                                [],
                                ['Keep an eye out for players that guess a little too well'],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          // Game Setup
          div(
            [Class('mb-6')],
            [
              h2([Class('text-2xl font-bold text-purple-800 mb-4')], ['🎮 Game Setup']),
              div(
                [Class('bg-gray-50 border border-gray-200 rounded-lg p-4')],
                [
                  p([Class('text-gray-700 mb-2')], ['• 3-8 players required']),
                  p(
                    [Class('text-gray-700 mb-2')],
                    ['• Create a lobby or join with a 4-letter code'],
                  ),
                  p(
                    [Class('text-gray-700 mb-2')],
                    ['• The first player becomes the host and Master'],
                  ),
                  p([Class('text-gray-700')], ['• Host can start the game when ready']),
                ],
              ),
            ],
          ),

          // Close button at bottom
          div(
            [Class('text-center')],
            [
              button(
                [
                  OnClick(() => onCloseRules()),
                  Class(
                    'bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200',
                  ),
                ],
                ['Start Playing!'],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

export function view<Message>(
  model: LandingModel,
  onPlayerNameChange: (name: string) => Message,
  onJoinLobbyIdChange: (lobbyId: string) => Message,
  onCreateLobby: () => Message,
  onJoinLobby: () => Message,
  onShowRules: () => Message,
  onCloseRules: () => Message,
): Html {
  const nameHasError = Option.isSome(model.nameError)
  const lobbyHasError = Option.isSome(model.lobbyError)

  console.log('view hellasdfsdf')

  const onClickHowToPlay = () => {
    console.log('OnClick onShowRules')
    onShowRules()
  }

  return div(
    [
      Class(
        'min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4',
      ),
    ],
    [
      div(
        [Class('bg-white rounded-lg shadow-2xl p-8 w-full max-w-md')],
        [
          // Header
          div(
            [Class('text-center mb-8')],
            [
              h1([Class('text-4xl font-bold text-gray-800 mb-2')], ['Outsider']),
              p([Class('text-gray-600 mb-4')], ['A social deduction game']),
              button(
                [
                  OnClick(onShowRules()),
                  Class(
                    'text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200',
                  ),
                ],
                ['📖 How to Play'],
              ),
            ],
          ),

          // Player Name Section
          div(
            [Class('mb-6')],
            [
              label([Class('block text-sm font-medium text-gray-700 mb-2')], ['Your Name']),
              input([
                Type('text'),
                Value(model.playerName),
                OnInput((value) => onPlayerNameChange(value)),
                Class(
                  `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    nameHasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`,
                ),
              ]),
              ...(nameHasError
                ? [
                    p(
                      [Class('text-red-500 text-sm mt-1')],
                      [Option.getOrElse(model.nameError, () => '')],
                    ),
                  ]
                : []),
            ],
          ),

          // Game Actions Section
          div(
            [Class('space-y-4')],
            [
              // Create New Game
              div(
                [Class('border-t pt-4')],
                [
                  h2([Class('text-lg font-semibold text-gray-800 mb-3')], ['Start New Game']),
                  button(
                    [
                      OnClick(() => onCreateLobby()),
                      Class(
                        'w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                      ),
                    ],
                    ['Create Lobby'],
                  ),
                ],
              ),

              // Join Existing Game
              div(
                [Class('border-t pt-4')],
                [
                  h2([Class('text-lg font-semibold text-gray-800 mb-3')], ['Join Existing Game']),
                  div(
                    [Class('space-y-3')],
                    [
                      div(
                        [],
                        [
                          label(
                            [Class('block text-sm font-medium text-gray-700 mb-1')],
                            ['Lobby ID'],
                          ),
                          input([
                            Type('text'),
                            Value(model.joinLobbyId),
                            OnInput((value) => onJoinLobbyIdChange(value)),
                            Class(
                              `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                lobbyHasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`,
                            ),
                          ]),
                          ...(lobbyHasError
                            ? [
                                p(
                                  [Class('text-red-500 text-sm mt-1')],
                                  [Option.getOrElse(model.lobbyError, () => '')],
                                ),
                              ]
                            : []),
                        ],
                      ),
                      button(
                        [
                          OnClick(() => onJoinLobby()),
                          Class(
                            'w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                          ),
                        ],
                        ['Join Lobby'],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),

      // Rules Modal
      ...(model.showRulesModal ? [renderRulesModal(onCloseRules)] : []),
    ],
  )
}
