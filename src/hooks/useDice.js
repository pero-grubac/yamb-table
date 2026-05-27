import { useState, useCallback } from 'react'
import { MAX_ROLLS } from '../constants'

const EMPTY_VALS  = [null, null, null, null, null]
const EMPTY_HELD  = [false, false, false, false, false]

export function useDice() {
  const [vals,  setVals]  = useState(EMPTY_VALS)
  const [held,  setHeld]  = useState(EMPTY_HELD)
  const [rolls, setRolls] = useState(0)

  const roll = useCallback(() => {
    if (rolls >= MAX_ROLLS) return
    setVals(prev => prev.map((v, i) => held[i] ? v : Math.floor(Math.random() * 6) + 1))
    setRolls(r => r + 1)
  }, [rolls, held])

  const toggleHold = useCallback((idx) => {
    if (rolls === 0 || rolls >= MAX_ROLLS) return
    setHeld(prev => prev.map((h, i) => i === idx ? !h : h))
  }, [rolls])

  const reset = useCallback(() => {
    setVals(EMPTY_VALS)
    setHeld(EMPTY_HELD)
    setRolls(0)
  }, [])

  return { vals, held, rolls, roll, toggleHold, reset }
}
