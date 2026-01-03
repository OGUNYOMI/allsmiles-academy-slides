/** Start: This code should always be kept as is */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { AnimationMode } from "@/types/ppt";

// element animation state
interface ElementAnimationState {
  elementId: string;
  enterCompleted: boolean;
  emphasisCompleted: boolean;
  exitCompleted: boolean;
  order?: number;
}

// animation manager context
interface SlideAnimationContextType {
  // state
  isVisible: boolean;
  shouldExit: boolean;
  triggerEmphasis: number;
  animationMode: AnimationMode;
  allowSkip: boolean;

  // animation control
  startSlideAnimations: () => void;
  startExitAnimations: () => void;
  triggerEmphasisAnimations: () => void;
  skipAllAnimations: () => void;

  // element register and state management
  registerElement: (elementId: string, order?: number) => void;
  unregisterElement: (elementId: string) => void;
  onElementEnterComplete: (elementId: string) => void;
  onElementEmphasisComplete: (elementId: string) => void;
  onElementExitComplete: (elementId: string) => void;

  // state query
  areAllEnterAnimationsComplete: () => boolean;
  areAllEmphasisAnimationsComplete: () => boolean;
  areAllExitAnimationsComplete: () => boolean;
}

const SlideAnimationContext = createContext<SlideAnimationContextType | null>(null);

// Hook for accessing animation context
export const useSlideAnimation = () => {
  const context = useContext(SlideAnimationContext);
  if (!context) {
    throw new Error("useSlideAnimation must be used within a SlideAnimationManager");
  }
  return context;
};

// exposed to external methods interface
export interface SlideAnimationManagerRef {
  startSlideAnimations: () => void;
  startExitAnimations: () => void;
  triggerEmphasisAnimations: () => void;
  skipAllAnimations: () => void;
}

interface SlideAnimationManagerProps {
  children: React.ReactNode;
  animationMode?: AnimationMode;
  allowSkip?: boolean;
  onAllEnterComplete?: () => void;
  onAllEmphasisComplete?: () => void;
  onAllExitComplete?: () => void;
  onSkipAnimations?: () => void;
}

export const SlideAnimationManager = forwardRef<SlideAnimationManagerRef, SlideAnimationManagerProps>(
  ({ children, animationMode = "parallel", allowSkip = true, onAllEnterComplete, onAllEmphasisComplete, onAllExitComplete, onSkipAnimations }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldExit, setShouldExit] = useState(false);
    const [triggerEmphasis, setTriggerEmphasis] = useState(0);
    const [elements, setElements] = useState<Map<string, ElementAnimationState>>(new Map());
    const [enterAnimationsStarted, setEnterAnimationsStarted] = useState(false);

    const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // register element
    const registerElement = useCallback((elementId: string, order?: number) => {
      setElements((prev) => {
        const newElements = new Map(prev);
        newElements.set(elementId, {
          elementId,
          enterCompleted: false,
          emphasisCompleted: false,
          exitCompleted: false,
          order,
        });
        return newElements;
      });
    }, []);

    // unregister element
    const unregisterElement = useCallback((elementId: string) => {
      setElements((prev) => {
        const newElements = new Map(prev);
        newElements.delete(elementId);
        return newElements;
      });
    }, []);

    // get sorted element list (for sequential mode)
    const getSortedElements = useCallback(() => {
      const elementArray = Array.from(elements.values());
      return elementArray.sort((a, b) => {
        const orderA = a.order ?? 999;
        const orderB = b.order ?? 999;
        return orderA - orderB;
      });
    }, [elements]);

    // check all enter animations are complete
    const areAllEnterAnimationsComplete = useCallback(() => {
      if (elements.size === 0) return true;
      return Array.from(elements.values()).every((element) => element.enterCompleted);
    }, [elements]);

    // check all emphasis animations are complete
    const areAllEmphasisAnimationsComplete = useCallback(() => {
      if (elements.size === 0) return true;
      return Array.from(elements.values()).every((element) => element.emphasisCompleted);
    }, [elements]);

    // check all exit animations are complete
    const areAllExitAnimationsComplete = useCallback(() => {
      if (elements.size === 0) return true;
      return Array.from(elements.values()).every((element) => element.exitCompleted);
    }, [elements]);

    // start enter animations
    const startSlideAnimations = useCallback(() => {
      if (enterAnimationsStarted) return;

      setEnterAnimationsStarted(true);

      if (animationMode === "sequential") {
        // sequential mode: display elements in order
        const sortedElements = getSortedElements();
        let currentIndex = 0;

        const showNextElement = () => {
          if (currentIndex < sortedElements.length) {
            setIsVisible(true); // this will trigger the element with the current order to display
            currentIndex++;

            // wait for the current element to complete before displaying the next one
            if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
            enterTimeoutRef.current = setTimeout(showNextElement, 500); // 固定间隔
          }
        };

        showNextElement();
      } else {
        // parallel mode: display all elements at the same time
        setIsVisible(true);
      }
    }, [animationMode, getSortedElements, enterAnimationsStarted]);

    // start exit animations
    const startExitAnimations = useCallback(() => {
      setShouldExit(true);
    }, []);

    // trigger emphasis animations
    const triggerEmphasisAnimations = useCallback(() => {
      setTriggerEmphasis((prev) => prev + 1);
    }, []);

    // skip all animations
    const skipAllAnimations = useCallback(() => {
      // clear all timers
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
      }

      // immediately set all elements to completed state
      setElements((prev) => {
        const newElements = new Map(prev);
        newElements.forEach((element, key) => {
          newElements.set(key, {
            ...element,
            enterCompleted: true,
            emphasisCompleted: true,
            exitCompleted: shouldExit,
          });
        });
        return newElements;
      });

      // immediately display all elements
      setIsVisible(true);

      // if exiting, immediately complete exiting
      if (shouldExit) {
        setShouldExit(true);
      }

      onSkipAnimations?.();
    }, [shouldExit, onSkipAnimations]);

    // expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        startSlideAnimations,
        startExitAnimations,
        triggerEmphasisAnimations,
        skipAllAnimations,
      }),
      [startSlideAnimations, startExitAnimations, triggerEmphasisAnimations, skipAllAnimations]
    );

    // element enter complete callback
    const onElementEnterComplete = useCallback((elementId: string) => {
      setElements((prev) => {
        const newElements = new Map(prev);
        const element = newElements.get(elementId);
        if (element) {
          newElements.set(elementId, { ...element, enterCompleted: true });
        }
        return newElements;
      });
    }, []);

    // element emphasis complete callback
    const onElementEmphasisComplete = useCallback((elementId: string) => {
      setElements((prev) => {
        const newElements = new Map(prev);
        const element = newElements.get(elementId);
        if (element) {
          newElements.set(elementId, { ...element, emphasisCompleted: true });
        }
        return newElements;
      });
    }, []);

    // element exit complete callback
    const onElementExitComplete = useCallback((elementId: string) => {
      setElements((prev) => {
        const newElements = new Map(prev);
        const element = newElements.get(elementId);
        if (element) {
          newElements.set(elementId, { ...element, exitCompleted: true });
        }
        return newElements;
      });
    }, []);

    // listen to all enter animations complete
    useEffect(() => {
      if (enterAnimationsStarted) {
        const allComplete = Array.from(elements.values()).every((element) => element.enterCompleted);
        if (allComplete && elements.size > 0) {
          onAllEnterComplete?.();
        }
      }
    }, [enterAnimationsStarted, elements, onAllEnterComplete]);

    // listen to all emphasis animations complete
    useEffect(() => {
      const allComplete = Array.from(elements.values()).every((element) => element.emphasisCompleted);
      if (allComplete && elements.size > 0) {
        onAllEmphasisComplete?.();
      }
    }, [elements, onAllEmphasisComplete]);

    // listen to all exit animations complete
    useEffect(() => {
      if (shouldExit) {
        const allComplete = Array.from(elements.values()).every((element) => element.exitCompleted);
        if (allComplete && elements.size > 0) {
          onAllExitComplete?.();
        }
      }
    }, [shouldExit, elements, onAllExitComplete]);

    // clear timers
    useEffect(() => {
      return () => {
        if (enterTimeoutRef.current) {
          clearTimeout(enterTimeoutRef.current);
        }
      };
    }, []);

    const contextValue: SlideAnimationContextType = {
      // state
      isVisible,
      shouldExit,
      triggerEmphasis,
      animationMode,
      allowSkip,

      // animation control
      startSlideAnimations,
      startExitAnimations,
      triggerEmphasisAnimations,
      skipAllAnimations,

      // element management
      registerElement,
      unregisterElement,
      onElementEnterComplete,
      onElementEmphasisComplete,
      onElementExitComplete,

      // state query
      areAllEnterAnimationsComplete,
      areAllEmphasisAnimationsComplete,
      areAllExitAnimationsComplete,
    };

    return <SlideAnimationContext.Provider value={contextValue}>{children}</SlideAnimationContext.Provider>;
  }
);
/* End: This code should always be kept as is */
