import { useState, useCallback } from 'react'
import { createGame } from '../models/gameModel'
import { isPlayerDone, applyTurn } from '../services/gameService'
import { usePersist } from './usePersist'

export function useGame() {
  const [game,  setGame]  = useState(null)
  const [phase, setPhase] = useState('setup') // setup | pass | game | winner
  const { save, load, clear, hasSave } = usePersist()

  /* ── Start a new game ── */
  const startGame = useCallback((playerNames, mode) => {
    const g = createGame(playerNames, mode)
    setGame(g)
    save(g)
    setPhase('pass')
  }, [save])

  /* ── Resume from localStorage ── */
  const resumeGame = useCallback(() => {
    const g = load()
    if (!g) return false
    setGame(g)
    setPhase(g.phase === 'winner' ? 'winner' : 'pass')
    return true
  }, [load])

  /* ── Player ready on pass screen ── */
  const playerReady = useCallback(() => {
    setPhase('game')
  }, [])

  /* ── End current player's turn ── */
  const endTurn = useCallback((playerIdx, pending, najava) => {
    if (!game) return null

    const { newSheet, error } = applyTurn(
      game.players[playerIdx].sheet,
      game.mode,
      pending,
      najava
    )

    if (error) return error

    const updatedGame = JSON.parse(JSON.stringify(game))
    updatedGame.players[playerIdx].sheet = newSheet

    // Check if all players are done
    const allDone = updatedGame.players.every(p => isPlayerDone(p.sheet, updatedGame.mode))
    if (allDone) {
      updatedGame.phase = 'winner'
      setGame(updatedGame)
      save(updatedGame)
      setPhase('winner')
      return null
    }

    // Advance to next non-done player
    let next = (playerIdx + 1) % updatedGame.players.length
    let safety = 0
    while (isPlayerDone(updatedGame.players[next].sheet, updatedGame.mode) && safety < updatedGame.players.length) {
      next = (next + 1) % updatedGame.players.length
      safety++
    }

    updatedGame.curIdx = next
    updatedGame.phase  = 'pass'
    setGame(updatedGame)
    save(updatedGame)
    setPhase('pass')
    return null
  }, [game, save])

  /* ── Quit and reset ── */
  const quitGame = useCallback(() => {
    clear()
    setGame(null)
    setPhase('setup')
  }, [clear])

  return {
    game,
    phase,
    hasSave,
    startGame,
    resumeGame,
    playerReady,
    endTurn,
    quitGame,
    clearSave: clear,
  }
}
