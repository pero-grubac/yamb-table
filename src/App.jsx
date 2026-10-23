import SetupPage  from './pages/SetupPage'
import PassPage   from './pages/PassPage'
import GamePage   from './pages/GamePage'
import WinnerPage from './pages/WinnerPage'
import { useGame } from './hooks/useGame'
import { canUndo } from './services/gameService'

export default function App() {
  const { game, phase, hasSave, startGame, resumeGame, playerReady, endTurn, undo, quitGame, clearSave } = useGame()

  // Name of the player whose move "undo" would take back (null = nothing to undo)
  const undoName = canUndo(game) ? game.players[game.history[game.history.length - 1].curIdx]?.name : null

  return (
    <>
      {phase === 'setup' && (
        <SetupPage
          onStart={startGame}
          hasSave={hasSave}
          onResume={resumeGame}
          onClearSave={clearSave}
        />
      )}

      {phase === 'pass' && game && (
        <PassPage
          playerName={game.players[game.curIdx].name}
          onReady={playerReady}
          undoName={undoName}
          onUndo={undo}
        />
      )}

      {phase === 'game' && game && (
        // key resets all local state (dice, pending, najava) on every new turn
        <GamePage
          key={`turn-${game.curIdx}-${game.players.map(p => Object.values(p.sheet).toString()).join('')}`}
          game={game}
          onTurnEnd={endTurn}
          onQuit={quitGame}
          undoName={undoName}
          onUndo={undo}
        />
      )}

      {phase === 'winner' && game && (
        <WinnerPage
          players={game.players}
          mode={game.mode}
          rules={game.rules}
          onNewGame={quitGame}
          undoName={undoName}
          onUndo={undo}
        />
      )}
    </>
  )
}
