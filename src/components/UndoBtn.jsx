import { useState } from 'react'
import Btn from './Btn'
import Overlay from './Overlay'

// "Take back the last move" button with a confirmation; renders nothing when there is nothing to undo.
export default function UndoBtn({ playerName, onUndo, style }) {
  const [confirm, setConfirm] = useState(false)
  if (!playerName) return null

  return (
    <>
      <Btn onClick={() => setConfirm(true)} color='var(--orange)' sm style={style}>↶ PONIŠTI POTEZ</Btn>
      {confirm && (
        <Overlay
          title='PONIŠTI POTEZ?'
          message={`Zadnji upis se briše i ${playerName} ponovo igra svoj red.`}
          titleColor='var(--orange)'
          onConfirm={() => { setConfirm(false); onUndo() }}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  )
}
