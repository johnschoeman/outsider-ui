import { Schema as S } from 'effect'

export const generateLobbyId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const isValidLobbyId = (lobbyId: string): boolean => {
  return /^[A-Z]{4}$/.test(lobbyId)
}

export const LobbyId = S.String.pipe(
  S.filter(isValidLobbyId, {
    message: () => 'Lobby ID must be 4 uppercase letters (e.g., ABCD)'
  })
)

export type LobbyId = S.Schema.Type<typeof LobbyId>