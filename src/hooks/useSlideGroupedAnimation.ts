import { useRef, useCallback } from "react";
import { SlideAnimationAPI } from "./useSlideAnimation";

export interface SlideGroupedAnimationController {
  // register animation API
  registerAnimation: (api: SlideAnimationAPI) => void;

  // handle next page request (Maybe animation or page change)
  handleNextRequest: () => "animation" | "page-change" | "blocked";

  // force switch to the next page
  forceNextPage: () => void;

  // reset state
  reset: () => void;

  // state query
  isAnimationMode: () => boolean;
  hasNextGroup: () => boolean;
  isAllComplete: () => boolean;
}

export const useSlideGroupedAnimation = (onPageChange?: () => void): SlideGroupedAnimationController => {
  const animationAPIRef = useRef<SlideAnimationAPI | null>(null);
  const isRegisteredRef = useRef(false);

  // register animation API
  const registerAnimation = useCallback((api: SlideAnimationAPI) => {
    animationAPIRef.current = api;
    isRegisteredRef.current = true;

    // set group complete callback
    api.onGroupComplete((group, isLastGroup) => {
      console.log(`animation group ${group} completed${isLastGroup ? " (last group)" : ""}`);
    });
  }, []);

  // handle next page request
  const handleNextRequest = useCallback((): "animation" | "page-change" | "blocked" => {
    const api = animationAPIRef.current;

    // if the animation API is not registered, allow page change directly
    if (!api || !isRegisteredRef.current) {
      onPageChange?.();
      return "page-change";
    }

    // check if all animation groups are completed
    if (api.isAllGroupsComplete()) {
      onPageChange?.();
      return "page-change";
    }

    // if there are still incomplete animation groups, trigger the next group
    const currentGroup = api.getCurrentGroup();
    const totalGroups = api.getTotalGroups();

    if (currentGroup < totalGroups - 1) {
      api.nextGroup();
      return "animation";
    }

    // theoretically should not reach here, but for safety
    return "blocked";
  }, [onPageChange]);

  // force switch to the next page
  const forceNextPage = useCallback(() => {
    onPageChange?.();
  }, [onPageChange]);

  // reset state
  const reset = useCallback(() => {
    animationAPIRef.current = null;
    isRegisteredRef.current = false;
  }, []);

  // state query
  const isAnimationMode = useCallback(() => {
    return isRegisteredRef.current && animationAPIRef.current !== null;
  }, []);

  const hasNextGroup = useCallback(() => {
    const api = animationAPIRef.current;
    if (!api) return false;

    return api.getCurrentGroup() < api.getTotalGroups() - 1;
  }, []);

  const isAllComplete = useCallback(() => {
    const api = animationAPIRef.current;
    if (!api) return true;

    return api.isAllGroupsComplete();
  }, []);

  return {
    registerAnimation,
    handleNextRequest,
    forceNextPage,
    reset,
    isAnimationMode,
    hasNextGroup,
    isAllComplete,
  };
};
