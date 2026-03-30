import { useGameStore } from './store/gameStore';
import { missions } from './data/missions';
import { saveToLeaderboard } from './store/leaderboard';
import { sfx, haptic } from './utils/sound';
import SceneTransition from './components/SceneTransition';
import HomeView from './views/HomeView';
import MapView from './views/MapView';
import DialogView from './views/DialogView';
import MiniGameView from './views/MiniGameView';
import ResultView from './views/ResultView';

export default function App() {
  const store = useGameStore();
  const currentMission = missions.find((m) => m.id === store.currentMissionId);

  const handleStart = (name) => {
    sfx.transition();
    haptic('medium');
    store.setPlayerName(name);
    store.goToScene('Map');
  };

  const handleSelectMission = (missionId) => {
    sfx.click();
    haptic('light');
    store.goToScene('Dialog', missionId);
  };

  const handleStartGame = () => {
    sfx.transition();
    haptic('medium');
    store.goToScene('Game');
  };

  const handleGameComplete = (stars, score, timeUsed) => {
    if (stars > 0) {
      store.completeMission(store.currentMissionId, stars, score);
      sfx.success();
      haptic('success');
      // Save to leaderboard
      setTimeout(() => {
        saveToLeaderboard(store.playerName, store.currentScore + score, store.completedMissions.length + 1);
      }, 100);
    } else {
      // Failed — store result for display but don't save as completed
      store.goToScene('Result');
      sfx.fail();
      haptic('fail');
      // Store a temporary fail result
      store.setLastResult({ stars: 0, score: 0, missionId: store.currentMissionId });
      return;
    }
    store.goToScene('Result');
  };

  const handleBackToMap = () => {
    sfx.click();
    haptic('light');
    store.goToScene('Map');
  };

  const handleRetry = () => {
    sfx.transition();
    haptic('medium');
    store.goToScene('Game');
  };

  const renderScene = () => {
    switch (store.currentScene) {
      case 'Home':
        return <HomeView onStart={handleStart} />;
      case 'Map':
        return (
          <MapView
            playerName={store.playerName}
            currentScore={store.currentScore}
            completedMissions={store.completedMissions}
            onSelectMission={handleSelectMission}
          />
        );
      case 'Dialog':
        return currentMission ? (
          <DialogView
            mission={currentMission}
            onStartGame={handleStartGame}
            onBack={handleBackToMap}
          />
        ) : null;
      case 'Game':
        return currentMission ? (
          <MiniGameView
            key={Date.now()} // force re-mount on retry
            mission={currentMission}
            onComplete={handleGameComplete}
          />
        ) : null;
      case 'Result':
        return currentMission && store.lastGameResult ? (
          <ResultView
            mission={currentMission}
            stars={store.lastGameResult.stars}
            score={store.lastGameResult.score}
            onBackToMap={handleBackToMap}
            onRetry={store.lastGameResult.stars === 0 ? handleRetry : undefined}
          />
        ) : null;
      default:
        return <HomeView onStart={handleStart} />;
    }
  };

  return (
    <div className="relative w-full h-full bg-ink">
      <SceneTransition sceneKey={store.currentScene + '-' + store.currentMissionId}>
        {renderScene()}
      </SceneTransition>
    </div>
  );
}
