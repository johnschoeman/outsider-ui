const PLAYER_NAME_KEY = "outsider-player-name"

export const loadPlayerName = (): string => {
  try {
    return localStorage.getItem(PLAYER_NAME_KEY) || ""
  } catch {
    return ""
  }
}

export const savePlayerName = (name: string): void => {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name)
  } catch {
    // Ignore storage errors
  }
}
