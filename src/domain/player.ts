import { Schema as S, Option } from 'effect'

export const PlayerRole = S.Literal('Master', 'Outsider', 'Commoner')
export type PlayerRole = S.Schema.Type<typeof PlayerRole>

export const Player = S.Struct({
  id: S.String,
  name: S.String,
  role: S.Option(PlayerRole),
  vote: S.Option(S.String), // Player ID they voted for
  hasVoted: S.Boolean,
})

export type Player = S.Schema.Type<typeof Player>

export const createPlayer = (id: string, name: string): Player => ({
  id,
  name,
  role: Option.none(),
  vote: Option.none(),
  hasVoted: false,
})

export const assignRole = (role: PlayerRole) => (player: Player): Player => ({
  ...player,
  role: Option.some(role),
})

export const castVote = (targetPlayerId: string) => (player: Player): Player => ({
  ...player,
  vote: Option.some(targetPlayerId),
  hasVoted: true,
})

export const clearVote = (player: Player): Player => ({
  ...player,
  vote: Option.none(),
  hasVoted: false,
})

export const validateName = (name: string): Option.Option<string> => {
  const trimmedName = name.trim()
  
  if (trimmedName.length === 0) {
    return Option.some('Please enter your name')
  }
  
  if (trimmedName.length > 20) {
    return Option.some('Name must be 20 characters or less')
  }
  
  return Option.none()
}
