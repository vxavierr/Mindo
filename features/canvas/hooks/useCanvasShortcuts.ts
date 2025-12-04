
import { useEffect, useRef } from 'react';
import { useMindoStore } from '../../../store/useMindoStore';

export function useCanvasShortcuts() {
  const interactionMode = useMindoStore(state => state.interactionMode);
  const setInteractionMode = useMindoStore(state => state.setInteractionMode);
  const isSelectingForReview = useMindoStore(state => state.isSelectingForReview);
  const cancelReviewSelection = useMindoStore(state => state.cancelReviewSelection);
  
  const isSpaceHeld = useRef(false);
  const previousMode = useRef(interactionMode);

  useEffect(() => {
    if (!isSpaceHeld.current) {
        previousMode.current = interactionMode;
    }
  }, [interactionMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpaceHeld.current && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        isSpaceHeld.current = true;
        setInteractionMode('hand');
      }

      if (e.key === 'Escape' && isSelectingForReview) {
          cancelReviewSelection();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceHeld.current = false;
        setInteractionMode(previousMode.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setInteractionMode, isSelectingForReview, cancelReviewSelection]);
}
