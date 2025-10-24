import { Schema as S } from "effect"
import { ST, ts } from "foldkit/schema"

export const NoOp = ts("NoOp")

// Landing
export const PlayerNameChanged = ts("PlayerNameChanged", { name: S.String })
export const JoinLobbyIdChanged = ts("JoinLobbyIdChanged", { lobbyId: S.String })
export const CreateLobbyClicked = ts("CreateLobbyClicked")
export const JoinLobbyClicked = ts("JoinLobbyClicked")
export const ShowRules = ts("ShowRules")
export const CloseRules = ts("CloseRules")

// Game
export const LeaveLobbyClicked = ts("LeaveLobbyClicked")
export const StartGameClicked = ts("StartGameClicked")
export const ContinueToWordCreation = ts("ContinueToWordCreation")
export const SecretWordChanged = ts("SecretWordChanged", { word: S.String })
export const SubmitSecretWord = ts("SubmitSecretWord")
export const ContinueToGuessing = ts("ContinueToGuessing")
export const TimerTick = ts("TimerTick")
export const WordGuessed = ts("WordGuessed")
export const WordNotGuessed = ts("WordNotGuessed")
export const VoteForPlayer = ts("VoteForPlayer", { playerId: S.String })
export const NewGame = ts("NewGame")

export const Message = S.Union(
  NoOp,

  // Lobby
  PlayerNameChanged,
  JoinLobbyIdChanged,
  CreateLobbyClicked,
  JoinLobbyClicked,
  ShowRules,
  CloseRules,

  // Game
  LeaveLobbyClicked,
  StartGameClicked,
  ContinueToWordCreation,
  SecretWordChanged,
  SubmitSecretWord,
  ContinueToGuessing,
  TimerTick,
  WordGuessed,
  WordNotGuessed,
  VoteForPlayer,
  NewGame,
)

type NoOp = ST<typeof NoOp>

// Landing
type PlayerNameChanged = ST<typeof PlayerNameChanged>
type JoinLobbyIdChanged = ST<typeof JoinLobbyIdChanged>
type CreateLobbyClicked = ST<typeof CreateLobbyClicked>
type JoinLobbyClicked = ST<typeof JoinLobbyClicked>
type ShowRules = ST<typeof ShowRules>
type CloseRules = ST<typeof CloseRules>

// Game
type LeaveLobbyClicked = ST<typeof LeaveLobbyClicked>
type StartGameClicked = ST<typeof StartGameClicked>
type ContinueToWordCreation = ST<typeof ContinueToWordCreation>
type SecretWordChanged = ST<typeof SecretWordChanged>
type SubmitSecretWord = ST<typeof SubmitSecretWord>
type ContinueToGuessing = ST<typeof ContinueToGuessing>
type TimerTick = ST<typeof TimerTick>
type WordGuessed = ST<typeof WordGuessed>
type WordNotGuessed = ST<typeof WordNotGuessed>
type VoteForPlayer = ST<typeof VoteForPlayer>
type NewGame = ST<typeof NewGame>

export type Message = ST<typeof Message>
