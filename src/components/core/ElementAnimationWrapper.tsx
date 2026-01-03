/** Start: This code should always be kept as is */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ElementAnimation, ElementAnimationType } from "@/types/ppt";
import { useSlideAnimation } from "./SlideAnimationManager";
import { elementAnimationMapping, getDurationClass, getDelayClass } from "@/lib/animation-mapping";

interface ElementAnimationWrapperProps {
  children: React.ReactNode;
  elementId: string;
  className?: string;
  enterAnimation?: ElementAnimation;
  emphasisAnimation?: ElementAnimation;
  exitAnimation?: ElementAnimation;
}

export const ElementAnimationWrapper: React.FC<ElementAnimationWrapperProps> = ({ children, elementId, className, enterAnimation, emphasisAnimation, exitAnimation }) => {
  const { isVisible, shouldExit, triggerEmphasis, registerElement, unregisterElement, onElementEnterComplete, onElementEmphasisComplete, onElementExitComplete } =
    useSlideAnimation();

  const [animationState, setAnimationState] = useState<"hidden" | "entering" | "visible" | "emphasizing" | "exiting">("hidden");
  const [emphasisCount, setEmphasisCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const enterCompletedRef = useRef(false);
  const emphasisCompletedRef = useRef(false);
  const exitCompletedRef = useRef(false);

  // register/unregister element
  useEffect(() => {
    enterCompletedRef.current = false;
    emphasisCompletedRef.current = false;
    exitCompletedRef.current = false;
    registerElement(elementId, enterAnimation?.order);
    return () => {
      unregisterElement(elementId);
    };
  }, [elementId, enterAnimation?.order, registerElement, unregisterElement]);

  // handle enter animation
  useEffect(() => {
    if (isVisible && animationState === "hidden") {
      setAnimationState("entering");
      const duration = enterAnimation?.duration || 500;
      const delay = enterAnimation?.delay || 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setAnimationState("visible");
        if (!enterCompletedRef.current) {
          enterCompletedRef.current = true;
          onElementEnterComplete(elementId);
        }
      }, duration + delay);
    }
  }, [isVisible, animationState, enterAnimation, elementId, onElementEnterComplete]);

  // handle emphasis animation
  useEffect(() => {
    if (triggerEmphasis > emphasisCount && animationState === "visible" && emphasisAnimation) {
      setAnimationState("emphasizing");
      setEmphasisCount(triggerEmphasis);
      const duration = emphasisAnimation.duration || 500;
      const delay = emphasisAnimation.delay || 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setAnimationState("visible");
        if (!emphasisCompletedRef.current) {
          emphasisCompletedRef.current = true;
          onElementEmphasisComplete(elementId);
        }
      }, duration + delay);
    }
  }, [triggerEmphasis, emphasisCount, animationState, emphasisAnimation, elementId, onElementEmphasisComplete]);

  // handle exit animation
  useEffect(() => {
    if (shouldExit && (animationState === "visible" || animationState === "emphasizing")) {
      setAnimationState("exiting");
      const duration = exitAnimation?.duration || 500;
      const delay = exitAnimation?.delay || 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!exitCompletedRef.current) {
          exitCompletedRef.current = true;
          onElementExitComplete(elementId);
        }
      }, duration + delay);
    }
  }, [shouldExit, animationState, exitAnimation, elementId, onElementExitComplete]);

  // calculate Animate.css className
  let animateClass = "";
  let duration = 500;
  let delay = 0;
  if (animationState === "entering" && enterAnimation) {
    animateClass = elementAnimationMapping[enterAnimation.type];
    duration = enterAnimation.duration || 500;
    delay = enterAnimation.delay || 0;
  } else if (animationState === "emphasizing" && emphasisAnimation) {
    animateClass = elementAnimationMapping[emphasisAnimation.type];
    duration = emphasisAnimation.duration || 500;
    delay = emphasisAnimation.delay || 0;
  } else if (animationState === "exiting" && exitAnimation) {
    animateClass = elementAnimationMapping[exitAnimation.type];
    duration = exitAnimation.duration || 500;
    delay = exitAnimation.delay || 0;
  }
  animateClass = cn(animateClass, getDurationClass(duration), getDelayClass(delay));

  // control display
  if (animationState === "hidden" || (animationState === "exiting" && shouldExit)) {
    return null;
  }

  return <div className={cn(className, animateClass)}>{children}</div>;
};
/* End: This code should always be kept as is */
