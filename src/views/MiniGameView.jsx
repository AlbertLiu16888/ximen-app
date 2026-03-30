import PuzzleGame from '../games/PuzzleGame';
import TeaGame from '../games/TeaGame';
import ShrineGame from '../games/ShrineGame';
import DetectiveGame from '../games/DetectiveGame';
import QuizGame from '../games/QuizGame';
import CookingGame from '../games/CookingGame';
import SortingGame from '../games/SortingGame';
import AuctionGame from '../games/AuctionGame';
import CipherGame from '../games/CipherGame';
import MatchingGame from '../games/MatchingGame';

const gameComponents = {
  puzzle: PuzzleGame,
  tea: TeaGame,
  shrine: ShrineGame,
  detective: DetectiveGame,
  quiz: QuizGame,
  cooking: CookingGame,
  sorting: SortingGame,
  auction: AuctionGame,
  cipher: CipherGame,
  matching: MatchingGame,
};

export default function MiniGameView({ mission, onComplete }) {
  const GameComponent = gameComponents[mission.gameType] || PuzzleGame;
  return <GameComponent mission={mission} timeLimit={mission.timeLimit} onComplete={onComplete} />;
}
