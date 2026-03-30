import PuzzleGame from '../games/PuzzleGame';
import TeaGame from '../games/TeaGame';
import PlaceholderGame from '../games/PlaceholderGame';

const gameComponents = {
  puzzle: PuzzleGame,
  tea: TeaGame,
  placeholder: PlaceholderGame,
};

export default function MiniGameView({ mission, onComplete }) {
  const GameComponent = gameComponents[mission.gameType] || PlaceholderGame;

  return (
    <GameComponent
      mission={mission}
      timeLimit={mission.timeLimit}
      onComplete={onComplete}
    />
  );
}
