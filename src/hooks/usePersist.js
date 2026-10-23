import { SAVE_KEY } from '../constants'
import { normalizeGame } from '../models/gameModel'

export function usePersist() {
  function save(game) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(game))
    } catch {
      // Storage blocked or full: the game continues, it just won't be resumable.
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!data?.players?.length) return null
      return normalizeGame(data)
    } catch {
      return null
    }
  }

  function clear() {
    localStorage.removeItem(SAVE_KEY)
  }

  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY)
  }

  return { save, load, clear, hasSave }
}
