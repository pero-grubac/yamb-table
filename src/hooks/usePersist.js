import { SAVE_KEY } from '../constants'

export function usePersist() {
  function save(game) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(game))
    } catch (_) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!data?.players?.length) return null
      return data
    } catch (_) {
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
