import { Html } from "foldkit/html"

import { Class, OnClick, button, div, h1, h2, h3, p, span } from "../../html"
import { Message } from "../../main"

const closeButton = (closeModal: Message): Html => {
  return button(
    [
      OnClick(closeModal),
      Class("absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"),
    ],
    ["×"],
  )
}

const title = (): Html => {
  return h1([Class("text-3xl font-bold text-gray-800 mb-6 text-center")], ["How to Play Outsider"])
}

const gameOverview = (): Html => {
  return div(
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
          p([Class("text-blue-700")], ["• Commoners & Master: Find and vote out the Outsider"]),
          p([Class("text-blue-700")], ["• Outsider: Blend in and survive the vote"]),
        ],
      ),
    ],
  )
}

const rolesSection = (): Html => {
  return div(
    [Class("mb-8")],
    [
      h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["👥 Player Roles"]),
      div(
        [Class("grid md:grid-cols-3 gap-4 mb-4")],
        [
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
          div(
            [Class("bg-blue-50 border-2 border-blue-300 rounded-lg p-4")],
            [
              h3([Class("text-lg font-bold text-blue-800 mb-2")], ["🧑‍🤝‍🧑 Commoners"]),
              p([Class("text-blue-700 text-sm")], ["• Don't know the secret word"]),
              p([Class("text-blue-700 text-sm")], ["• Majority of players"]),
              p([Class("text-blue-700 text-sm")], ["• Works with Master to find the Outsider"]),
            ],
          ),
          div(
            [Class("bg-red-50 border-2 border-red-300 rounded-lg p-4")],
            [
              h3([Class("text-lg font-bold text-red-800 mb-2")], ["🎭 Outsider"]),
              p([Class("text-red-700 text-sm")], ["• Knows the secret word"]),
              p([Class("text-red-700 text-sm")], ["• Pretends to be a commoner"]),
              p([Class("text-red-700 text-sm")], ["• Wins by surviving the vote"]),
            ],
          ),
        ],
      ),
    ],
  )
}

const gamePhase = (color: string, phaseTitle: string, description: string): Html => {
  return div(
    [Class(`border-l-4 border-${color}-400 bg-${color}-50 p-4`)],
    [
      h3([Class(`font-bold text-${color}-800 text-lg`)], [phaseTitle]),
      p([Class(`text-${color}-700`)], [description]),
    ],
  )
}

const gamePhaseSection = (): Html => {
  return div(
    [Class("mb-8")],
    [
      h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["⏳ Game Phases"]),
      div(
        [Class("space-y-4")],
        [
          gamePhase(
            "purple",
            "Phase 1: Role Assignment",
            "Everyone secretly learns their role. The Master announces themselves.",
          ),
          gamePhase("yellow", "Phase 2: Word Creation", "The Master creates a secret word."),
          gamePhase(
            "blue",
            "Phase 3: Word Sharing",
            'The Outsider see the secret word. The Commoners see "Waiting for others..."',
          ),
          gamePhase(
            "green",
            "Phase 4: Word Guessing (5 minutes)",
            "Players take turns asking yes or no questions to the Master. If the players guess the word within time they move onto the Voting Phase. If the players do not guess the word, everyone loses and the game restarts.",
          ),
          gamePhase(
            "red",
            "Phase 5: Discussion & Voting (5 minutes)",
            "Argue for who you think the outsider is. Everyone votes for who they think is the Outsider.",
          ),
          gamePhase(
            "gray",
            "Phase 6: Results",
            "Results are revealed! See who won, how everyone voted, and what roles everyone had.",
          ),
        ],
      ),
    ],
  )
}

const strategyTip = (color: string, headerText: string, tips: string[]): Html => {
  return div(
    [Class(`bg-${color}-50 border border-${color}-300 rounded-lg p-4`)],
    [
      h3([Class(`text-lg font-bold text-${color}-800 mb-3`)], [headerText]),
      div(
        [Class(`space-y-2 text-${color}-700`)],
        tips.map((tip) => {
          return p([Class("flex items-start")], [span([Class("mr-2 mt-1")], [`• ${tip}`])])
        }),
      ),
    ],
  )
}

const strategyTips = (): Html => {
  return div(
    [Class("mb-8")],
    [
      h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["💡 Strategy Tips"]),
      div(
        [Class("grid md:grid-cols-3 gap-6")],
        [
          strategyTip("blue", "For Commoners:", [
            "Ask questions quickly",
            "Watch for players who give leading questions",
            "Accuse others during the vote to get more information",
          ]),

          strategyTip("red", "For the Outsider:", [
            "Lead the group to right answer without being too obvious",
            "Agree with others and build on their questions",
            "Deflect suspicion onto other players",
          ]),

          strategyTip("yellow", "For the Master:", [
            "Answer questions quickly",
            "If your word has multiple meanings, pick one and be consistent",
            "Keep an eye out for players that guess a little too well",
          ]),
        ],
      ),
    ],
  )
}

const gameSetup = (): Html => {
  return div(
    [Class("mb-6")],
    [
      h2([Class("text-2xl font-bold text-purple-800 mb-4")], ["🎮 Game Setup"]),
      div(
        [Class("bg-gray-50 border border-gray-200 rounded-lg p-4")],
        [
          p([Class("text-gray-700 mb-2")], ["• 3-8 players required"]),
          p([Class("text-gray-700 mb-2")], ["• Create a lobby or join with a 4-letter code"]),
          p([Class("text-gray-700 mb-2")], ["• The first player becomes the host"]),
          p([Class("text-gray-700")], ["• Host can start the game when ready"]),
        ],
      ),
    ],
  )
}

const startPlayingButton = (closeModal: Message): Html => {
  return div(
    [Class("text-center")],
    [
      button(
        [
          OnClick(closeModal),
          Class(
            "bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200",
          ),
        ],
        ["Start Playing!"],
      ),
    ],
  )
}

export const rulesModal = (showModal: boolean, closeModal: Message): Html => {
  if (!showModal) {
    return div([], [])
  } else {
    return div(
      [Class("fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50")],
      [
        div(
          [Class("bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative")],
          [
            closeButton(closeModal),
            title(),
            gameOverview(),
            rolesSection(),
            gamePhaseSection(),
            strategyTips(),
            gameSetup(),
            startPlayingButton(closeModal),
          ],
        ),
      ],
    )
  }
}
