import { Html, HtmlBuilder } from "foldkit/html"

import { Message } from "../../main"
import { buttonClasses } from "./button"

type PastelFamily = "lavender" | "butter" | "sky" | "mint" | "blush"

const pastelClasses: Record<
  PastelFamily,
  { block: string; heading: string; body: string; card: string }
> = {
  lavender: {
    block: "border-l-4 border-pastel-lavender-border bg-pastel-lavender p-4",
    heading: "font-bold text-pastel-lavender-ink text-lg",
    body: "text-pastel-lavender-ink",
    card: "bg-pastel-lavender border-2 border-pastel-lavender-border rounded-lg p-4",
  },
  butter: {
    block: "border-l-4 border-pastel-butter-border bg-pastel-butter p-4",
    heading: "font-bold text-pastel-butter-ink text-lg",
    body: "text-pastel-butter-ink",
    card: "bg-pastel-butter border-2 border-pastel-butter-border rounded-lg p-4",
  },
  sky: {
    block: "border-l-4 border-pastel-sky-border bg-pastel-sky p-4",
    heading: "font-bold text-pastel-sky-ink text-lg",
    body: "text-pastel-sky-ink",
    card: "bg-pastel-sky border-2 border-pastel-sky-border rounded-lg p-4",
  },
  mint: {
    block: "border-l-4 border-pastel-mint-border bg-pastel-mint p-4",
    heading: "font-bold text-pastel-mint-ink text-lg",
    body: "text-pastel-mint-ink",
    card: "bg-pastel-mint border-2 border-pastel-mint-border rounded-lg p-4",
  },
  blush: {
    block: "border-l-4 border-pastel-blush-border bg-pastel-blush p-4",
    heading: "font-bold text-pastel-blush-ink text-lg",
    body: "text-pastel-blush-ink",
    card: "bg-pastel-blush border-2 border-pastel-blush-border rounded-lg p-4",
  },
}

const closeButton = (closeModal: Message, h: HtmlBuilder<Message>): Html => {
  const { button, Class, OnClick } = h
  return button(
    [
      OnClick(closeModal),
      Class("absolute top-4 right-4 text-ink-muted hover:text-ink text-2xl font-bold"),
    ],
    ["×"],
  )
}

const title = (h: HtmlBuilder<Message>): Html => {
  const { h1, Class } = h
  return h1([Class("text-3xl font-bold text-ink mb-6 text-center")], ["How to Play Outsider"])
}

const gameOverview = (h: HtmlBuilder<Message>): Html => {
  const { div, h2, p, Class } = h
  const goal = pastelClasses.sky
  return div(
    [Class("mb-8")],
    [
      h2([Class("text-2xl font-bold text-ink mb-4")], ["🎭 Game Overview"]),
      p(
        [Class("text-ink-muted mb-4 text-lg")],
        [
          "Outsider is a social deduction game where players work together to identify the 'Outsider' among them. One player knows the secret word that everyone else tries to guess!",
        ],
      ),
      div(
        [Class(goal.block)],
        [
          p([Class(`${goal.heading} mb-1`)], ["🎯 Goal:"]),
          p([Class(goal.body)], ["• Commoners & Master: Find and vote out the Outsider"]),
          p([Class(goal.body)], ["• Outsider: Blend in and survive the vote"]),
        ],
      ),
    ],
  )
}

const rolesSection = (h: HtmlBuilder<Message>): Html => {
  const { div, h2, h3, p, Class } = h
  const master = pastelClasses.butter
  const commoner = pastelClasses.sky
  const outsider = pastelClasses.blush

  return div(
    [Class("mb-8")],
    [
      h2([Class("text-2xl font-bold text-ink mb-4")], ["👥 Player Roles"]),
      div(
        [Class("grid md:grid-cols-3 gap-4 mb-4")],
        [
          div(
            [Class(master.card)],
            [
              h3([Class(`${master.heading} mb-2`)], ["👑 Master"]),
              p([Class(`${master.body} text-sm`)], ["• Creates the secret word"]),
              p([Class(`${master.body} text-sm`)], ["• Answers yes or no questions"]),
              p([Class(`${master.body} text-sm`)], ["• Works with commoners to find the Outsider"]),
            ],
          ),
          div(
            [Class(commoner.card)],
            [
              h3([Class(`${commoner.heading} mb-2`)], ["🧑‍🤝‍🧑 Commoners"]),
              p([Class(`${commoner.body} text-sm`)], ["• Don't know the secret word"]),
              p([Class(`${commoner.body} text-sm`)], ["• Majority of players"]),
              p([Class(`${commoner.body} text-sm`)], ["• Works with Master to find the Outsider"]),
            ],
          ),
          div(
            [Class(outsider.card)],
            [
              h3([Class(`${outsider.heading} mb-2`)], ["🎭 Outsider"]),
              p([Class(`${outsider.body} text-sm`)], ["• Knows the secret word"]),
              p([Class(`${outsider.body} text-sm`)], ["• Pretends to be a commoner"]),
              p([Class(`${outsider.body} text-sm`)], ["• Wins by surviving the vote"]),
            ],
          ),
        ],
      ),
    ],
  )
}

const gamePhase = (
  family: PastelFamily,
  phaseTitle: string,
  description: string,
  h: HtmlBuilder<Message>,
): Html => {
  const { div, h3, p, Class } = h
  const classes = pastelClasses[family]
  return div(
    [Class(classes.block)],
    [h3([Class(classes.heading)], [phaseTitle]), p([Class(classes.body)], [description])],
  )
}

const gamePhaseSection = (h: HtmlBuilder<Message>): Html => {
  const { div, h2, Class } = h
  return div(
    [Class("mb-8")],
    [
      h2([Class("text-2xl font-bold text-ink mb-4")], ["⏳ Game Phases"]),
      div(
        [Class("space-y-4")],
        [
          gamePhase(
            "lavender",
            "Phase 1: Role Assignment",
            "Everyone secretly learns their role. The Master announces themselves.",
            h,
          ),
          gamePhase("butter", "Phase 2: Word Creation", "The Master creates a secret word.", h),
          gamePhase(
            "sky",
            "Phase 3: Word Sharing",
            'The Outsider see the secret word. The Commoners see "Waiting for others..."',
            h,
          ),
          gamePhase(
            "mint",
            "Phase 4: Word Guessing (5 minutes)",
            "Players take turns asking yes or no questions to the Master. If the players guess the word within time they move onto the Voting Phase. If the players do not guess the word, everyone loses and the game restarts.",
            h,
          ),
          gamePhase(
            "blush",
            "Phase 5: Discussion & Voting (5 minutes)",
            "Argue for who you think the outsider is. Everyone votes for who they think is the Outsider.",
            h,
          ),
          gamePhase(
            "lavender",
            "Phase 6: Results",
            "Results are revealed! See who won, how everyone voted, and what roles everyone had.",
            h,
          ),
        ],
      ),
    ],
  )
}

const strategyTip = (
  family: PastelFamily,
  headerText: string,
  tips: string[],
  h: HtmlBuilder<Message>,
): Html => {
  const { div, h3, p, span, Class } = h
  const classes = pastelClasses[family]
  return div(
    [Class(classes.card)],
    [
      h3([Class(`${classes.heading} mb-3`)], [headerText]),
      div(
        [Class(`space-y-2 ${classes.body}`)],
        tips.map((tip) => {
          return p([Class("flex items-start")], [span([Class("mr-2 mt-1")], [`• ${tip}`])])
        }),
      ),
    ],
  )
}

const strategyTips = (h: HtmlBuilder<Message>): Html => {
  const { div, h2, Class } = h
  return div(
    [Class("mb-8")],
    [
      h2([Class("text-2xl font-bold text-ink mb-4")], ["💡 Strategy Tips"]),
      div(
        [Class("grid md:grid-cols-3 gap-6")],
        [
          strategyTip(
            "sky",
            "For Commoners:",
            [
              "Ask questions quickly",
              "Watch for players who give leading questions",
              "Accuse others during the vote to get more information",
            ],
            h,
          ),

          strategyTip(
            "blush",
            "For the Outsider:",
            [
              "Lead the group to right answer without being too obvious",
              "Agree with others and build on their questions",
              "Deflect suspicion onto other players",
            ],
            h,
          ),

          strategyTip(
            "butter",
            "For the Master:",
            [
              "Answer questions quickly",
              "If your word has multiple meanings, pick one and be consistent",
              "Keep an eye out for players that guess a little too well",
            ],
            h,
          ),
        ],
      ),
    ],
  )
}

const gameSetup = (h: HtmlBuilder<Message>): Html => {
  const { div, h2, p, Class } = h
  return div(
    [Class("mb-6")],
    [
      h2([Class("text-2xl font-bold text-ink mb-4")], ["🎮 Game Setup"]),
      div(
        [Class("bg-surface border border-border-default rounded-lg p-4")],
        [
          p([Class("text-ink-muted mb-2")], ["• 3-8 players required"]),
          p([Class("text-ink-muted mb-2")], ["• Create a lobby or join with a 4-letter code"]),
          p([Class("text-ink-muted mb-2")], ["• The first player becomes the host"]),
          p([Class("text-ink-muted")], ["• Host can start the game when ready"]),
        ],
      ),
    ],
  )
}

const startPlayingButton = (closeModal: Message, h: HtmlBuilder<Message>): Html => {
  const { div, button, Class, OnClick } = h
  return div(
    [Class("text-center")],
    [
      button(
        [OnClick(closeModal), Class(`text-lg px-8 ${buttonClasses("primary")}`)],
        ["Start Playing!"],
      ),
    ],
  )
}

export const rulesModal = (
  showModal: boolean,
  closeModal: Message,
  h: HtmlBuilder<Message>,
): Html => {
  const { div, Class } = h

  if (!showModal) {
    return div([], [])
  } else {
    return div(
      [Class("fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50")],
      [
        div(
          [Class("bg-surface-card rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative")],
          [
            closeButton(closeModal, h),
            title(h),
            gameOverview(h),
            rolesSection(h),
            gamePhaseSection(h),
            strategyTips(h),
            gameSetup(h),
            startPlayingButton(closeModal, h),
          ],
        ),
      ],
    )
  }
}
