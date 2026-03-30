import { useState, useEffect } from 'react';

export default function SceneTransition({ sceneKey, children }) {
  const [visible, setVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(sceneKey);
  const [currentChildren, setCurrentChildren] = useState(children);

  useEffect(() => {
    if (sceneKey !== currentKey) {
      setVisible(false);
      const timer = setTimeout(() => {
        setCurrentKey(sceneKey);
        setCurrentChildren(children);
        setVisible(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [sceneKey]);

  useEffect(() => {
    if (sceneKey === currentKey) {
      setCurrentChildren(children);
    }
  }, [children]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="absolute inset-0 transition-opacity duration-600 ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {currentChildren}
    </div>
  );
}
