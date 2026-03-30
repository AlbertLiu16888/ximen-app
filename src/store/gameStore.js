import { useState, useCallback } from 'react';

const INITIAL_STATE = {
  playerName: '',
  currentScore: 0,
  completedMissions: [], // { id, stars, score }
  currentScene: 'Home', // Home | Map | Dialog | Game | Result
  currentMissionId: null,
  lastGameResult: null, // { stars, score, timeUsed }
};

export function useGameStore() {
  const [state, setState] = useState(INITIAL_STATE);

  const setPlayerName = useCallback((name) => {
    setState((s) => ({ ...s, playerName: name }));
  }, []);

  const goToScene = useCallback((scene, missionId = null) => {
    setState((s) => ({
      ...s,
      currentScene: scene,
      currentMissionId: missionId !== null ? missionId : s.currentMissionId,
    }));
  }, []);

  const completeMission = useCallback((missionId, stars, score) => {
    setState((s) => {
      const existing = s.completedMissions.find((m) => m.id === missionId);
      if (existing && existing.score >= score) return s;
      const filtered = s.completedMissions.filter((m) => m.id !== missionId);
      return {
        ...s,
        currentScore: s.currentScore - (existing?.score || 0) + score,
        completedMissions: [...filtered, { id: missionId, stars, score }],
        lastGameResult: { stars, score, missionId },
      };
    });
  }, []);

  const isMissionCompleted = useCallback(
    (missionId) => state.completedMissions.some((m) => m.id === missionId),
    [state.completedMissions]
  );

  const getMissionResult = useCallback(
    (missionId) => state.completedMissions.find((m) => m.id === missionId),
    [state.completedMissions]
  );

  const setLastResult = useCallback((result) => {
    setState((s) => ({ ...s, lastGameResult: result }));
  }, []);

  return {
    ...state,
    setPlayerName,
    goToScene,
    completeMission,
    isMissionCompleted,
    getMissionResult,
    setLastResult,
  };
}
