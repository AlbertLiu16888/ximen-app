import { useGameStore } from './store/gameStore';
import { missions } from './data/missions';
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
    store.setPlayerName(name);
    store.goToScene('Map');
  };

  const handleSelectMission = (missionId) => {
    store.goToScene('Dialog', missionId);
  };

  const handleStartGame = () => {
    store.goToScene('Game');
  };

  const handleGameComplete = (stars, score, timeUsed) => {
    store.completeMission(store.currentMissionId, stars, score);
    store.goToScene('Result');
  };

  const handleBackToMap = () => {
    store.goToScene('Map');
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
