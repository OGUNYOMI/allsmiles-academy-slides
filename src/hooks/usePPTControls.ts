import { useState, useCallback, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

interface UsePPTControlsProps {
  totalSlides: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isFullScreen?: boolean;
  onFullScreenChange?: (fullScreen: boolean) => void;
  showSlideGrid?: boolean;
  onSlideGridChange?: (show: boolean) => void;
}

/**
 * Manages PPT control logic:
 * - Auto-play with 5s intervals
 * - Keyboard navigation (←/→/Esc)
 * - Navigation methods (prev/next/reset)
 */
export function usePPTControls({
  totalSlides,
  currentIndex,
  onIndexChange,
  isFullScreen = false,
  onFullScreenChange,
  showSlideGrid = false,
  onSlideGridChange,
}: UsePPTControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation methods
  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange]);

  const goNext = useCallback(() => {
    console.log("🎮 goNext is called");

    const currentSlideAPI = useAppStore.getState().currentSlideAPI;
    console.log("🎮 currentSlideAPI exists:", !!currentSlideAPI);

    if (currentSlideAPI) {
      // 1️⃣ first handle the entrance grouped animation
      const isEnterComplete = currentSlideAPI.isAllGroupsComplete();
      const currentGroup = currentSlideAPI.getCurrentGroup();
      const totalGroups = currentSlideAPI.getTotalGroups();

      if (!isEnterComplete) {
        console.log(`🎮 entrance animation not complete, current group ${currentGroup}/${totalGroups - 1}, execute next group`);
        currentSlideAPI.nextGroup();
        return;
      }

      // 2️⃣ after the entrance, first execute the emphasis animation
      if (currentSlideAPI.isEmphasisComplete && !currentSlideAPI.isEmphasisComplete()) {
        console.log("🎮 entrance complete, but emphasis animation not executed, start emphasis animation");
        currentSlideAPI.emphasis();
        return;
      }

      // 3️⃣ after the emphasis, execute the exit animation
      if (currentSlideAPI.isExitComplete && !currentSlideAPI.isExitComplete()) {
        console.log("🎮 emphasis animation completed, start exit animation");
        currentSlideAPI.exit();
        return;
      }
      // 4️⃣ all animations must be completed before allowing page switching
    }

    console.log("🎮 switch to the next page or try to exit");
    if (currentIndex < totalSlides - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      // already the last page, exit full screen when trying to switch to the next page
      if (isFullScreen) {
        onFullScreenChange?.(false);
      }
    }
  }, [currentIndex, totalSlides, onIndexChange]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) {
        onIndexChange(index);
      }
    },
    [totalSlides, onIndexChange]
  );

  const reset = useCallback(() => {
    onIndexChange(0);
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, [onIndexChange]);

  // Auto-play control
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Stop playing
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start playing
      const interval = setInterval(() => {
        // Check current index from props
        if (currentIndex < totalSlides - 1) {
          onIndexChange(currentIndex + 1);
        } else {
          // Stop at the end
          setIsPlaying(false);
          if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
          }
        }
      }, 5000);
      playIntervalRef.current = interval;
      setIsPlaying(true);
    }
  }, [isPlaying, totalSlides, onIndexChange, currentIndex]);

  // Stop auto-play when reaching the end
  useEffect(() => {
    if (isPlaying && currentIndex === totalSlides - 1) {
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
  }, [currentIndex, totalSlides, isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle ESC key for SlideGrid
      if (e.key === "Escape" && showSlideGrid && onSlideGridChange) {
        e.preventDefault();
        onSlideGridChange(false);
        return;
      }

      // now also supports left and right arrow page switching in non-full screen mode, so no longer limit the isFullScreen condition.

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case " ": // Spacebar key
        case "Spacebar":
        case "Space":
          if (isFullScreen) {
            e.preventDefault();
            goNext();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen, showSlideGrid, goPrev, goNext, onFullScreenChange, onSlideGridChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    isPlaying,
    canGoPrev: currentIndex > 0,
    canGoNext: currentIndex < totalSlides - 1,

    // Methods
    goPrev,
    goNext,
    goToSlide,
    reset,
    togglePlay,
  };
}
