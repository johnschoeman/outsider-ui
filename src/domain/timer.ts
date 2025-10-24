import { Option, Schema as S } from 'effect'

export const Timer = S.Struct({
  remaining: S.Number, // seconds
  isActive: S.Boolean,
  startTime: S.Option(S.Number), // timestamp
})

export type Timer = S.Schema.Type<typeof Timer>

export const createTimer = (seconds: number): Timer => ({
  remaining: seconds,
  isActive: false,
  startTime: Option.none(),
})

export const startTimer = (timer: Timer): Timer => ({
  ...timer,
  isActive: true,
  startTime: Option.some(Date.now()),
})

export const stopTimer = (timer: Timer): Timer => ({
  ...timer,
  isActive: false,
})

export const updateTimer = (timer: Timer): Timer => {
  if (!timer.isActive || Option.isNone(timer.startTime)) {
    return timer
  }

  const elapsed = Math.floor((Date.now() - Option.getOrElse(timer.startTime, () => 0)) / 1000)
  const remaining = Math.max(0, timer.remaining - elapsed)

  return {
    ...timer,
    remaining,
    isActive: remaining > 0,
  }
}

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
