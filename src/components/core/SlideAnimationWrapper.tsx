/** Start: This code should always be kept as is */
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { SlideAnimation, SlideAnimationType } from "@/types/ppt";
import { slideAnimationMapping, getDurationClass, getDelayClass } from "@/lib/animation-mapping";

interface SlideAnimationWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
  enterAnimation?: SlideAnimation;
  exitAnimation?: SlideAnimation;
  className?: string;
  onEnterComplete?: () => void;
  onExitComplete?: () => void;
}

export const SlideAnimationWrapper: React.FC<SlideAnimationWrapperProps> = ({ children, isVisible, enterAnimation, exitAnimation, className, onEnterComplete, onExitComplete }) => {
  const [animationState, setAnimationState] = useState<"idle" | "entering" | "entered" | "exiting" | "exited">("idle");
  const [lastVisibleState, setLastVisibleState] = useState<boolean | null>(null);

  // use ref to save the latest callback function, avoid dependency change
  const onEnterCompleteRef = useRef(onEnterComplete);
  const onExitCompleteRef = useRef(onExitComplete);

  useEffect(() => {
    onEnterCompleteRef.current = onEnterComplete;
    onExitCompleteRef.current = onExitComplete;
  });

  // select the current used animation
  const currentAnimation = isVisible ? enterAnimation : exitAnimation;
  const animationType = currentAnimation?.type || "fade";
  const duration = currentAnimation?.duration || 500;
  const delay = currentAnimation?.delay || 0;

  // handle visibility change
  useEffect(() => {
    if (lastVisibleState === isVisible) return;
    setLastVisibleState(isVisible);

    if (!currentAnimation || animationType === "none") {
      if (isVisible) {
        setAnimationState("entered");
        onEnterCompleteRef.current?.();
      } else {
        setAnimationState("exited");
        onExitCompleteRef.current?.();
      }
      return;
    }

    if (isVisible) {
      setAnimationState("entering");
    } else {
      setAnimationState("exiting");
    }

    const timer = setTimeout(() => {
      if (isVisible) {
        setAnimationState("entered");
        onEnterCompleteRef.current?.();
      } else {
        setAnimationState("exited");
        onExitCompleteRef.current?.();
      }
    }, duration + delay);

    return () => clearTimeout(timer);
  }, [isVisible, currentAnimation, animationType, duration, delay]);

  // calculate Animate.css className
  let animateClass = "";
  if (animationType !== "none") {
    const mapping = slideAnimationMapping[animationType];
    // add safety check
    if (mapping) {
      if (animationState === "entering" || animationState === "entered") {
        animateClass = mapping.enter;
      } else if (animationState === "exiting" || animationState === "exited") {
        animateClass = mapping.exit;
      }
      animateClass = cn(animateClass, getDurationClass(duration), getDelayClass(delay));
    } else {
      // if no mapping found, use default fade animation
      console.warn(`Animation type '${animationType}' not found in slideAnimationMapping, using default fade`);
      const defaultMapping = slideAnimationMapping.fade;
      if (animationState === "entering" || animationState === "entered") {
        animateClass = defaultMapping.enter;
      } else if (animationState === "exiting" || animationState === "exited") {
        animateClass = defaultMapping.exit;
      }
      animateClass = cn(animateClass, getDurationClass(duration), getDelayClass(delay));
    }
  }

  // control display
  if (animationState === "exited" && !isVisible) {
    return null;
  }

  return <div className={cn("w-full h-full", className, animateClass)}>{children}</div>;
};

/* End: This code should always be kept as is */
