import SetupPage  from './pages/SetupPage'
import PassPage   from './pages/PassPage'
import GamePage   from './pages/GamePage'
import WinnerPage from './pages/WinnerPage'
import { useGame } from './hooks/useGame'

export default function App() {
  const { game, phase, hasSave, startGame, resumeGame, playerReady, endTurn, quitGame, clearSave } = useGame()

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
        />
      )}

      {phase === 'game' && game && (
        // key resets all local state (dice, pending, najava) on every new turn
        <GamePage
          key={`turn-${game.curIdx}-${game.players.map(p => Object.values(p.sheet).toString()).join('')}`}
          game={game}
          onTurnEnd={endTurn}
          onQuit={quitGame}
        />
      )}

      {phase === 'winner' && game && (
        <WinnerPage
          players={game.players}
          mode={game.mode}
          onNewGame={quitGame}
        />
      )}
    </>
  )
}
