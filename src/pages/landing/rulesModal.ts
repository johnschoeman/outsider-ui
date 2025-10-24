import { Class, Html, OnClick, button, div, h1, h2, h3, p, span } from "foldkit/html"

export const renderRulesModal = <Message>(onCloseRules: Message): Html => {
  return div(
    [Class("fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50")],
    [
      div(
        [Class("bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative")],
        [
          // Close button
          button(
            [
              OnClick(onCloseRules),
              Class("absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"),
            ],
            ["×"],
          ),

          // Title
          h1(
            [Class("text-3xl font-bold text-gray-800 mb-6 text-center")],
            ["How to Play Outsider"],
          ),

          // Game Overview
          div(
            [Class("mb-8")],
            [
              h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["🎭 Game Overview"]),
              p(
                [Class("text-gray-700 mb-4 text-lg")],
                [
                  "Outsider is a social deduction game where players work together to identify the 'Outsider' among them. One player knows the secret word that everyone else tries to guess!",
                ],
              ),
              div(
                [Class("bg-blue-50 border-l-4 border-blue-400 p-4 mb-4")],
                [
                  p([Class("text-blue-800 font-semibold")], ["🎯 Goal:"]),
                  p(
                    [Class("text-blue-700")],
                    ["• Commoners & Master: Find and vote out the Outsider"],
                  ),
                  p([Class("text-blue-700")], ["• Outsider: Blend in and survive the vote"]),
                ],
              ),
            ],
          ),

          // Roles Section
          div(
            [Class("mb-8")],
            [
              h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["👥 Player Roles"]),
              div(
                [Class("grid md:grid-cols-3 gap-4 mb-4")],
                [
                  // Master
                  div(
                    [Class("bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4")],
                    [
                      h3([Class("text-lg font-bold text-yellow-800 mb-2")], ["👑 Master"]),
                      p([Class("text-yellow-700 text-sm")], ["• Creates the secret word"]),
                      p([Class("text-yellow-700 text-sm")], ["• Answers yes or no questions"]),
                      p(
                        [Class("text-yellow-700 text-sm")],
                        ["• Works with commoners to find the Outsider"],
                      ),
                    ],
                  ),
                  // Commoners
                  div(
                    [Class("bg-blue-50 border-2 border-blue-300 rounded-lg p-4")],
                    [
                      h3([Class("text-lg font-bold text-blue-800 mb-2")], ["🧑‍🤝‍🧑 Commoners"]),
                      p([Class("text-blue-700 text-sm")], ["• Don't know the secret word"]),
                      p(
                        [Class("text-blue-700 text-sm")],
                        ["• Work together with Master to find the Outsider"],
                      ),
                      p([Class("text-blue-700 text-sm")], ["• Majority of players"]),
                    ],
                  ),
                  // Outsider
                  div(
                    [Class("bg-red-50 border-2 border-red-300 rounded-lg p-4")],
                    [
                      h3([Class("text-lg font-bold text-red-800 mb-2")], ["🎭 Outsider"]),
                      p([Class("text-red-700 text-sm")], ["• Knows the secret word"]),
                      p([Class("text-red-700 text-sm")], ["• Must pretend to not know it"]),
                      p([Class("text-red-700 text-sm")], ["• Wins by surviving the vote"]),
                    ],
                  ),
                ],
              ),
            ],
          ),

          // Game Phases
          div(
            [Class("mb-8")],
            [
              h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["⏳ Game Phases"]),
              div(
                [Class("space-y-4")],
                [
                  // Phase 1
                  div(
                    [Class("border-l-4 border-purple-400 bg-purple-50 p-4")],
                    [
                      h3(
                        [Class("font-bold text-purple-800 text-lg")],
                        ["Phase 1: Role Assignment"],
                      ),
                      p(
                        [Class("text-purple-700")],
                        ["Everyone secretly learns their role. The Master announces themselves."],
                      ),
                    ],
                  ),
                  // Phase 2
                  div(
                    [Class("border-l-4 border-yellow-400 bg-yellow-50 p-4")],
                    [
                      h3([Class("font-bold text-yellow-800 text-lg")], ["Phase 2: Word Creation"]),
                      p([Class("text-yellow-700")], ["The Master creates a secret word."]),
                    ],
                  ),
                  // Phase 3
                  div(
                    [Class("border-l-4 border-blue-400 bg-blue-50 p-4")],
                    [
                      h3([Class("font-bold text-blue-800 text-lg")], ["Phase 3: Word Sharing"]),
                      p(
                        [Class("text-blue-700")],
                        [
                          'The Outsider see the secret word. The Commoners see "Waiting for others..."',
                        ],
                      ),
                    ],
                  ),
                  // Phase 4
                  div(
                    [Class("border-l-4 border-green-400 bg-green-50 p-4")],
                    [
                      h3(
                        [Class("font-bold text-green-800 text-lg")],
                        ["Phase 4: Word Guessing (5 minutes)"],
                      ),
                      p(
                        [Class("text-green-700")],
                        [
                          "Players take turns asking yes or no questions to the Master. If the players guess the word within time they move onto the Voting Phase. If the players **do not** guess the word, everyone loses and the game restarts.",
                        ],
                      ),
                    ],
                  ),
                  // Phase 5
                  div(
                    [Class("border-l-4 border-red-400 bg-red-50 p-4")],
                    [
                      h3(
                        [Class("font-bold text-red-800 text-lg")],
                        ["Phase 5: Discussion & Voting (5 minutes)"],
                      ),
                      p(
                        [Class("text-red-700")],
                        [
                          "Argue for who you think the outsider is. Everyone votes for who they think is the Outsider.",
                        ],
                      ),
                    ],
                  ),
                  // Phase 6
                  div(
                    [Class("border-l-4 border-gray-400 bg-gray-50 p-4")],
                    [
                      h3([Class("font-bold text-gray-800 text-lg")], ["Phase 6: Results"]),
                      p(
                        [Class("text-gray-700")],
                        [
                          "Results are revealed! See who won, how everyone voted, and what roles everyone had.",
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
            [Class("mb-8")],
            [
              h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["💡 Strategy Tips"]),
              div(
                [Class("grid md:grid-cols-3 gap-6")],
                [
                  // For Commoners
                  div(
                    [Class("bg-blue-50 border border-blue-200 rounded-lg p-4")],
                    [
                      h3([Class("text-lg font-bold text-blue-800 mb-3")], ["For Commoners"]),
                      div(
                        [Class("space-y-2 text-blue-700")],
                        [
                          p(
                            [Class("flex items-start")],
                            [span([Class("mr-2 mt-1")], ["• Ask questions quickly"])],
                          ),
                          p(
                            [Class("flex items-start")],
                            [
                              span(
                                [Class("mr-2 mt-1")],
                                ["• Watch for players who give leading questions"],
                              ),
                            ],
                          ),
                          p(
                            [Class("flex items-start")],
                            [
                              span(
                                [Class("mr-2 mt-1")],
                                ["• Accuse others in the voting phase to get more information"],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),

                  // For Outsider
                  div(
                    [Class("bg-red-50 border border-red-200 rounded-lg p-4")],
                    [
                      h3([Class("text-lg font-bold text-red-800 mb-3")], ["For the Outsider:"]),
                      div(
                        [Class("space-y-2 text-red-700")],
                        [
                          p(
                            [Class("flex items-start")],
                            [
                              span(
                                [Class("mr-2 mt-1")],
                                [
                                  "• Ask questions that lead the group to the answer within the time without being to obvious",
                                ],
                              ),
                            ],
                          ),
                          p(
                            [Class("flex items-start")],
                            [
                              span(
                                [Class("mr-2 mt-1")],
                                ["• Agree with others and build on their questions"],
                              ),
                            ],
                          ),
                          p(
                            [Class("flex items-start")],
                            [
                              span(
                                [Class("mr-2 mt-1")],
                                ["• Try to deflect suspicion onto other players"],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),

                  // For Master
                  div(
                    [Class("bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4")],
                    [
                      h3([Class("text-lg font-bold text-yellow-800 mb-3")], ["For the Master:"]),
                      div(
                        [Class("space-y-2 text-yellow-700")],
                        [
                          p(
                            [Class("flex items-start")],
                            [
                              span(
                                [Class("mr-2 mt-1")],
                                [
                                  "• Answer questions quickly, the more questions asked, the more information you have",
                                ],
                              ),
                            ],
                          ),
                          p(
                            [Class("flex items-start")],
                            [
                              span(
                                [Class("mr-2 mt-1")],
                                [
                                  "• If your word has multiple interpretations, try to pick one and be consistent",
                                ],
                              ),
                            ],
                          ),
                          p(
                            [Class("flex items-start")],
                            [
                              span(
                                [Class("mr-2 mt-1")],
                                ["• Keep an eye out for players that guess a little too well"],
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
            [Class("mb-6")],
            [
              h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["🎮 Game Setup"]),
              div(
                [Class("bg-gray-50 border border-gray-200 rounded-lg p-4")],
                [
                  p([Class("text-gray-700 mb-2")], ["• 3-8 players required"]),
                  p(
                    [Class("text-gray-700 mb-2")],
                    ["• Create a lobby or join with a 4-letter code"],
                  ),
                  p([Class("text-gray-700 mb-2")], ["• The first player becomes the host"]),
                  p([Class("text-gray-700")], ["• Host can start the game when ready"]),
                ],
              ),
            ],
          ),

          // Close button at bottom
          div(
            [Class("text-center")],
            [
              button(
                [
                  OnClick(onCloseRules),
                  Class(
                    "bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200",
                  ),
                ],
                ["Start Playing!"],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
