import { useRef, useCallback, useEffect, useState } from "react";
import { ElementAnimation, AnimationMode } from "@/types/ppt";
import { elementAnimationMapping, getDurationClass, getDelayClass, elementEnterInitClassMapping } from "@/lib/animation-mapping";
import { useAppStore } from "@/store/useAppStore";

export function areElementAnimationsEnabled(): boolean {
  return useAppStore.getState().animationEnabled;
}

interface ElementConfig {
  ref: React.RefObject<HTMLElement>;
  enter?: ElementAnimation;
  emphasis?: ElementAnimation;
  exit?: ElementAnimation;
  order?: number;
  group?: number; // animation group
}

interface ElementState {
  id: string;
  config: ElementConfig;
  enterCompleted: boolean;
  emphasisCompleted: boolean;
  exitCompleted: boolean;
  currentAnimation?: "enter" | "emphasis" | "exit";
}

export interface SlideAnimationAPI {
  // add element
  addElement: (
    id: string,
    ref: React.RefObject<HTMLElement>,
    config: {
      enter?: ElementAnimation;
      emphasis?: ElementAnimation;
      exit?: ElementAnimation;
      order?: number;
      group?: number;
    }
  ) => SlideAnimationAPI;

  // set animation mode
  setMode: (mode: AnimationMode) => SlideAnimationAPI;

  // start entrance animation (all groups executed at once, suitable for page initialization)
  start: () => SlideAnimationAPI;

  // start grouped entrance animation (only execute the first group)
  startGrouped: () => SlideAnimationAPI;

  // execute next group animation
  nextGroup: () => SlideAnimationAPI;

  // trigger emphasis animation
  emphasis: () => SlideAnimationAPI;

  // start exit animation
  exit: () => SlideAnimationAPI;

  // skip all animations
  skip: () => SlideAnimationAPI;

  // reset
  reset: () => SlideAnimationAPI;

  // state query
  isAllGroupsComplete: () => boolean;
  getCurrentGroup: () => number;
  getTotalGroups: () => number;
  // new: check if the emphasis/exit animation is complete
  isEmphasisComplete: () => boolean;
  isExitComplete: () => boolean;

  // event listener
  onEnterComplete: (callback: () => void) => SlideAnimationAPI;
  onEmphasisComplete: (callback: () => void) => SlideAnimationAPI;
  onExitComplete: (callback: () => void) => SlideAnimationAPI;
  onGroupComplete: (callback: (group: number, isLastGroup: boolean) => void) => SlideAnimationAPI;
}

// apply animation: use Animate.css class first; if no mapping, fall back to inline style
const applyAnimation = (element: HTMLElement, animation: ElementAnimation, isActive: boolean) => {
  const mappedClass = elementAnimationMapping[animation.type];

  if (mappedClass) {
    // safely remove all animate.css related classes
    const classesToRemove = Array.from(element.classList).filter((cls) => cls.startsWith("animate__"));
    classesToRemove.forEach((cls) => element.classList.remove(cls));

    if (isActive) {
      // remove initial state class (if exists)
      const enterInitClass = elementEnterInitClassMapping[animation.type];
      if (enterInitClass && enterInitClass.trim()) {
        element.classList.remove(enterInitClass);
      }

      // add duration and delay classes
      const durationClass = getDurationClass(animation.duration || 600);
      const delayClass = getDelayClass(animation.delay || 0);

      // split the mapped class names by space and add, ensure no empty strings
      const animationClasses = mappedClass.split(" ").filter((cls) => cls && cls.trim());

      // collect all class names to add, filter out empty values
      const classesToAdd = [...animationClasses, durationClass, delayClass].filter((cls) => cls && cls.trim() && cls !== ""); // ensure the class name is not empty and is not just whitespace

      if (classesToAdd.length > 0) {
        element.classList.add(...classesToAdd);
      }
    } else {
      // when the animation is not active, may need to re-add the initial state class
      const enterInitClass = elementEnterInitClassMapping[animation.type];
      if (enterInitClass && enterInitClass.trim()) {
        element.classList.add(enterInitClass);
      }
    }
  } else {
    // if there is no Animate.css mapping, use CSS animation
    if (isActive) {
      element.style.animation = `${animation.type} ${animation.duration || 600}ms ease ${animation.delay || 0}ms`;
    } else {
      element.style.animation = "";
    }
  }
};

export function useSlideAnimation(): SlideAnimationAPI {
  const animationsEnabled = areElementAnimationsEnabled();
  const elementsRef = useRef<Map<string, ElementState>>(new Map());
  const [currentGroup, setCurrentGroup] = useState(0);
  // use ref to synchronize the current group, avoid reading the old value caused by setState asynchronous
  const currentGroupRef = useRef(0);
  const [mode, setMode] = useState<AnimationMode>("parallel");
  const [isGrouped, setIsGrouped] = useState(false);

  // performance optimization: cache the calculation results
  const groupCacheRef = useRef<{ totalGroups: number; lastElementCount: number }>({ totalGroups: 0, lastElementCount: 0 });

  // performance optimization: reduce log output, only output critical logs in development environment
  const isDev = process.env.NODE_ENV === "development";
  const logPerformance = useCallback(
    (message: string, ...args: unknown[]) => {
      if (isDev && Math.random() < 0.1) {
        // only output 10% of the logs
        console.log(message, ...args);
      }
    },
    [isDev]
  );

  // event listener
  const enterCompleteCallbacks = useRef<Array<() => void>>([]);
  const emphasisCompleteCallbacks = useRef<Array<() => void>>([]);
  const exitCompleteCallbacks = useRef<Array<() => void>>([]);
  const groupCompleteCallbacks = useRef<Array<(group: number, isLastGroup: boolean) => void>>([]);

  const updateCurrentGroup = useCallback(
    (newGroup: number) => {
      if (currentGroupRef.current !== newGroup) {
        currentGroupRef.current = newGroup;
        setCurrentGroup(newGroup);
        logPerformance(`🔄 update current group: ${currentGroupRef.current} -> ${newGroup}`);
      }
    },
    [logPerformance]
  );

  // get all elements of the specified group (performance optimization: cache the results)
  const getGroupElements = useCallback((group: number) => {
    const elements = Array.from(elementsRef.current.values()).filter((el) => el.config.group === group);
    return elements;
  }, []);

  // calculate the total number of groups (performance optimization: only recalculate when the number of elements changes)
  const getTotalGroups = useCallback(() => {
    const currentElementCount = elementsRef.current.size;

    if (groupCacheRef.current.lastElementCount === currentElementCount) {
      return groupCacheRef.current.totalGroups;
    }

    const groups = new Set<number>();
    elementsRef.current.forEach((element) => {
      if (element.config.group !== undefined) {
        groups.add(element.config.group);
      }
    });

    const totalGroups = groups.size;
    groupCacheRef.current = { totalGroups, lastElementCount: currentElementCount };

    return totalGroups;
  }, []);

  // use ref to avoid circular dependency
  const checkGroupCompletionRef = useRef<(group: number) => void>();
  const animateGroupRef = useRef<(group: number, forcedTotalGroups?: number) => void>();

  // check the completion status of the group animation
  const checkGroupCompletion = useCallback(
    (group: number) => {
      const groupElements = getGroupElements(group);
      const allCompleted = groupElements.every((el) => el.enterCompleted);

      if (allCompleted && groupElements.length > 0) {
        // real-time calculate the total number of groups, not using the passed parameters
        const totalGroups = getTotalGroups();
        const isLastGroup = group >= totalGroups - 1;

        logPerformance(`🔥 group ${group} animation completed, total groups: ${totalGroups}, is last group: ${isLastGroup} (${group} >= ${totalGroups - 1})`);

        // trigger the group complete callback
        groupCompleteCallbacks.current.forEach((callback) => callback(group, isLastGroup));

        if (isLastGroup) {
          logPerformance(`🔥 all grouped animations completed`);
          // trigger the overall complete callback
          enterCompleteCallbacks.current.forEach((callback) => callback());
        } else if (isGrouped && mode === "sequential") {
          // automatically switch to the next group
          const nextGroup = group + 1;
          logPerformance(`🔥 automatically switch to the next group: ${group} -> ${nextGroup}`);
          updateCurrentGroup(nextGroup);
          // use ref to call animateGroup to avoid circular dependency
          console.log(`🔧 about to call animateGroupRef.current(${nextGroup}), function exists: ${!!animateGroupRef.current}`);
          animateGroupRef.current?.(nextGroup);
        } else {
          // temporary debug log
          console.log(`⚠️ not switched to the next group: isGrouped=${isGrouped}, mode=${mode}, isLastGroup=${isLastGroup}`);
        }
      }
    },
    [getGroupElements, getTotalGroups, isGrouped, mode, updateCurrentGroup, logPerformance]
  );

  // execute the animation of the specified group
  const animateGroup = useCallback(
    (group: number, forcedTotalGroups?: number) => {
      // ensure the current group state is updated in time (parallel/sequential are both applicable)
      updateCurrentGroup(group);

      const totalGroups = forcedTotalGroups || getTotalGroups();

      logPerformance(`🔥 animateGroup is called: group=${group}, forcedTotalGroups=${forcedTotalGroups}`);
      logPerformance(`🔥 final used total groups: ${totalGroups} (source: ${forcedTotalGroups ? "parameters" : "real-time calculation"})`);

      const groupElements = getGroupElements(group);

      groupElements.forEach((element) => {
        const ref = element.config.ref;
        const enterConfig = element.config.enter;

        if (ref?.current && enterConfig && !element.enterCompleted) {
          element.currentAnimation = "enter";
          applyAnimation(ref.current, enterConfig, true);

          // animation completion handling
          const duration = enterConfig.duration || 600;
          const delay = enterConfig.delay || 0;

          setTimeout(() => {
            element.enterCompleted = true;
            element.currentAnimation = undefined;

            // clean up animation classes, keep the final visible state of the element
            if (ref.current) {
              const classesToRemove = Array.from(ref.current.classList).filter((cls) => cls.startsWith("animate__"));
              classesToRemove.forEach((cls) => ref.current!.classList.remove(cls));
            }

            // use ref to call checkGroupCompletion to avoid circular dependency
            checkGroupCompletionRef.current?.(group);
          }, duration + delay);
        }
      });
    },
    [getTotalGroups, getGroupElements, logPerformance, updateCurrentGroup]
  );

  // update ref
  checkGroupCompletionRef.current = checkGroupCompletion;
  animateGroupRef.current = animateGroup;

  // add element
  const addElement: SlideAnimationAPI["addElement"] = useCallback(
    (id, ref, config) => {
      const elementState: ElementState = {
        id,
        config: { ref, ...config },
        enterCompleted: false,
        emphasisCompleted: false,
        exitCompleted: false,
      };

      elementsRef.current.set(id, elementState);

      // immediately add the initial state class (if there is enter animation configuration)
      if (ref?.current && config.enter) {
        const enterInitClass = elementEnterInitClassMapping[config.enter.type];
        if (enterInitClass && enterInitClass.trim()) {
          ref.current.classList.add(enterInitClass);
          logPerformance(`add initial state class to element ${id}: ${enterInitClass}`);
        }
      }

      const group = config.group || 0;
      logPerformance(`add element ${id} to group ${group}`);

      // clear cache, force recalculation
      groupCacheRef.current.lastElementCount = -1;
      const totalGroups = getTotalGroups();
      logPerformance(`current calculated total groups: ${totalGroups}, element count: ${elementsRef.current.size}`);

      return api;
    },
    [getTotalGroups, logPerformance]
  );

  // set mode
  const setAnimationMode: SlideAnimationAPI["setMode"] = useCallback((newMode) => {
    setMode(newMode);
    return api;
  }, []);

  // start all animations
  const start: SlideAnimationAPI["start"] = useCallback(() => {
    const allElements = Array.from(elementsRef.current.values());

    if (mode === "parallel") {
      // parallel mode: all animations start at the same time
      allElements.forEach((element) => {
        const ref = element.config.ref;
        const enterConfig = element.config.enter;

        if (ref?.current && enterConfig) {
          element.currentAnimation = "enter";
          applyAnimation(ref.current, enterConfig, true);

          const duration = enterConfig.duration || 600;
          const delay = enterConfig.delay || 0;

          setTimeout(() => {
            element.enterCompleted = true;
            element.currentAnimation = undefined;

            // clean up animation classes, keep the final visible state of the element
            if (ref.current) {
              const classesToRemove = Array.from(ref.current.classList).filter((cls) => cls.startsWith("animate__"));
              classesToRemove.forEach((cls) => ref.current!.classList.remove(cls));
            }

            // check if all animations are complete
            const allCompleted = allElements.every((el) => el.enterCompleted);
            if (allCompleted) {
              enterCompleteCallbacks.current.forEach((callback) => callback());
            }
          }, duration + delay);
        }
      });
    } else {
      // sequential mode: execute the groups one by one
      const groups = new Set<number>();
      allElements.forEach((el) => {
        if (el.config.group !== undefined) groups.add(el.config.group);
      });

      const sortedGroups = Array.from(groups).sort((a, b) => a - b);

      sortedGroups.forEach((group, index) => {
        setTimeout(() => {
          animateGroupRef.current?.(group);
        }, index * 300); // delay 300ms between groups
      });
    }

    return api;
  }, [mode]);

  // start grouped animation
  const startGrouped: SlideAnimationAPI["startGrouped"] = useCallback(() => {
    setIsGrouped(true);
    updateCurrentGroup(0);

    // delay execution of the animation, ensure all addElement are complete
    setTimeout(() => {
      const totalGroups = getTotalGroups();
      logPerformance(`🚀 startGrouped: delay calculated total groups: ${totalGroups}`);
      logPerformance(`🚀 startGrouped: about to call animateGroup(0, ${totalGroups})`);

      animateGroupRef.current?.(0, totalGroups);
    }, 0); // use setTimeout(0) to ensure execution in the next event loop

    return api;
  }, [getTotalGroups, updateCurrentGroup, logPerformance]);

  // next group
  const nextGroup: SlideAnimationAPI["nextGroup"] = useCallback(() => {
    const totalGroups = getTotalGroups();
    const nextGroupIndex = Math.min(currentGroupRef.current + 1, totalGroups - 1);

    if (nextGroupIndex !== currentGroupRef.current) {
      updateCurrentGroup(nextGroupIndex);
      animateGroupRef.current?.(nextGroupIndex);
    }

    return api;
  }, [currentGroupRef.current, getTotalGroups, updateCurrentGroup]);

  // emphasis animation
  const emphasis: SlideAnimationAPI["emphasis"] = useCallback(() => {
    const allElements = Array.from(elementsRef.current.values());

    allElements.forEach((element) => {
      const ref = element.config.ref;
      const emphasisConfig = element.config.emphasis;

      if (ref?.current && emphasisConfig && element.enterCompleted) {
        element.currentAnimation = "emphasis";
        applyAnimation(ref.current, emphasisConfig, true);

        const duration = emphasisConfig.duration || 600;

        setTimeout(() => {
          element.emphasisCompleted = true;
          element.currentAnimation = undefined;

          // clean up emphasis animation classes
          if (ref.current) {
            const classesToRemove = Array.from(ref.current.classList).filter((cls) => cls.startsWith("animate__"));
            classesToRemove.forEach((cls) => ref.current!.classList.remove(cls));
          }

          // check if all emphasis animations are complete
          const allEmphasisCompleted = allElements.every((el) => !el.config.emphasis || el.emphasisCompleted);
          if (allEmphasisCompleted) {
            emphasisCompleteCallbacks.current.forEach((callback) => callback());
          }
        }, duration);
      }
    });

    return api;
  }, []);

  // exit animation
  const exit: SlideAnimationAPI["exit"] = useCallback(() => {
    const allElements = Array.from(elementsRef.current.values());

    allElements.forEach((element) => {
      const ref = element.config.ref;
      const exitConfig = element.config.exit;

      if (ref?.current && exitConfig) {
        element.currentAnimation = "exit";
        applyAnimation(ref.current, exitConfig, true);

        const duration = exitConfig.duration || 600;

        setTimeout(() => {
          element.exitCompleted = true;
          element.currentAnimation = undefined;

          // clean up exit animation classes
          if (ref.current) {
            const classesToRemove = Array.from(ref.current.classList).filter((cls) => cls.startsWith("animate__"));
            classesToRemove.forEach((cls) => ref.current!.classList.remove(cls));
          }

          // check if all exit animations are complete
          const allExitCompleted = allElements.every((el) => !el.config.exit || el.exitCompleted);
          if (allExitCompleted) {
            exitCompleteCallbacks.current.forEach((callback) => callback());
          }
        }, duration);
      }
    });

    return api;
  }, []);

  // skip animation
  const skip: SlideAnimationAPI["skip"] = useCallback(() => {
    const allElements = Array.from(elementsRef.current.values());

    allElements.forEach((element) => {
      element.enterCompleted = true;
      element.emphasisCompleted = true;
      element.exitCompleted = true;
      element.currentAnimation = undefined;

      const ref = element.config.ref;
      if (ref?.current) {
        // safely clear all animate.css related classes
        const classesToRemove = Array.from(ref.current.classList).filter((cls) => cls.startsWith("animate__"));
        classesToRemove.forEach((cls) => ref.current!.classList.remove(cls));

        // clear all initial state classes, let the element display the final state
        const initClassesToRemove = Array.from(ref.current.classList).filter((cls) => cls.startsWith("ppt-init-"));
        initClassesToRemove.forEach((cls) => ref.current!.classList.remove(cls));

        ref.current.style.animation = "";
      }
    });

    // trigger all complete callbacks
    enterCompleteCallbacks.current.forEach((callback) => callback());
    emphasisCompleteCallbacks.current.forEach((callback) => callback());
    exitCompleteCallbacks.current.forEach((callback) => callback());

    return api;
  }, []);

  // reset
  const reset: SlideAnimationAPI["reset"] = useCallback(() => {
    logPerformance("reset: clean up the animation state and elements");

    // clean up the animation state of all elements
    elementsRef.current.forEach((element) => {
      const ref = element.config.ref;
      if (ref?.current) {
        // safely remove all animate.css related classes
        const classesToRemove = Array.from(ref.current.classList).filter((cls) => cls.startsWith("animate__"));
        classesToRemove.forEach((cls) => ref.current!.classList.remove(cls));

        // remove all initial state classes
        const initClassesToRemove = Array.from(ref.current.classList).filter((cls) => cls.startsWith("ppt-init-"));
        initClassesToRemove.forEach((cls) => ref.current!.classList.remove(cls));

        ref.current.style.animation = "";
      }
    });

    // clear the element mapping
    elementsRef.current.clear();

    // reset the state
    updateCurrentGroup(0);
    setIsGrouped(false);

    // clear the callbacks
    enterCompleteCallbacks.current = [];
    emphasisCompleteCallbacks.current = [];
    exitCompleteCallbacks.current = [];
    groupCompleteCallbacks.current = [];

    // clear the cache
    groupCacheRef.current = { totalGroups: 0, lastElementCount: 0 };

    logPerformance("🧹 reset: set grouped mode to false");

    return api;
  }, [updateCurrentGroup, logPerformance]);

  // state query method
  const isAllGroupsComplete = useCallback(() => {
    const totalGroups = getTotalGroups();
    return currentGroupRef.current >= totalGroups - 1;
  }, [currentGroupRef.current, getTotalGroups]);

  const getCurrentGroup = useCallback(() => currentGroupRef.current, [currentGroupRef.current]);

  const isEmphasisComplete = useCallback(() => {
    const allElements = Array.from(elementsRef.current.values());
    return allElements.every((el) => !el.config.emphasis || el.emphasisCompleted);
  }, []);

  const isExitComplete = useCallback(() => {
    const allElements = Array.from(elementsRef.current.values());
    return allElements.every((el) => !el.config.exit || el.exitCompleted);
  }, []);

  // event listener method
  const onEnterComplete: SlideAnimationAPI["onEnterComplete"] = useCallback((callback) => {
    enterCompleteCallbacks.current.push(callback);
    return api;
  }, []);

  const onEmphasisComplete: SlideAnimationAPI["onEmphasisComplete"] = useCallback((callback) => {
    emphasisCompleteCallbacks.current.push(callback);
    return api;
  }, []);

  const onExitComplete: SlideAnimationAPI["onExitComplete"] = useCallback((callback) => {
    exitCompleteCallbacks.current.push(callback);
    return api;
  }, []);

  const onGroupComplete: SlideAnimationAPI["onGroupComplete"] = useCallback((callback) => {
    groupCompleteCallbacks.current.push(callback);
    return api;
  }, []);

  // API object
  const api: SlideAnimationAPI = {
    addElement,
    setMode: setAnimationMode,
    start,
    startGrouped,
    nextGroup,
    emphasis,
    exit,
    skip,
    reset,
    isAllGroupsComplete,
    getCurrentGroup,
    getTotalGroups,
    isEmphasisComplete,
    isExitComplete,
    onEnterComplete,
    onEmphasisComplete,
    onExitComplete,
    onGroupComplete,
  };

  if (!animationsEnabled) {
    const noopApi = {} as SlideAnimationAPI;
    const noop = () => noopApi;
    const noopBoolTrue = () => true;

    Object.assign(noopApi, {
      addElement: noop,
      setMode: noop,
      start: noop,
      startGrouped: noop,
      nextGroup: noop,
      emphasis: noop,
      exit: noop,
      skip: noop,
      reset: noop,
      isAllGroupsComplete: noopBoolTrue,
      getCurrentGroup: () => 0,
      getTotalGroups: () => 0,
      isEmphasisComplete: noopBoolTrue,
      isExitComplete: noopBoolTrue,
      onEnterComplete: noop,
      onEmphasisComplete: noop,
      onExitComplete: noop,
      onGroupComplete: noop,
    } as SlideAnimationAPI);

    return noopApi;
  }

  return api;
}
