import { useState, useCallback } from 'react'
import { createGame } from '../models/gameModel'
import { playTurn, undoMove } from '../services/gameService'
import { usePersist } from './usePersist'

export function useGame() {
  const [game,  setGame]  = useState(null)
  const [phase, setPhase] = useState('setup') // setup | pass | game | winner
  const { save, load, clear, hasSave } = usePersist()

  /* ── Start a new game ── */
  const startGame = useCallback((playerNames, mode, rules) => {
    const g = createGame(playerNames, mode, rules)
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

    const { game: updatedGame, error } = playTurn(game, playerIdx, pending, najava)
    if (error) return error

    setGame(updatedGame)
    save(updatedGame)
    setPhase(updatedGame.phase)
    return null
  }, [game, save])

  /* ── Take back the last move ── */
  const undo = useCallback(() => {
    const prev = undoMove(game)
    if (!prev) return
    setGame(prev)
    save(prev)
    setPhase(prev.phase)
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
    undo,
    quitGame,
    clearSave: clear,
  }
}
