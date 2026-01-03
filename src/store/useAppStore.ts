import { create } from "zustand";
import type { SlideAnimationAPI } from "@/hooks/useSlideAnimation";

interface AppState {
  // Fullscreen flag
  isFullScreen: boolean;
  setFullScreen: (v: boolean) => void;

  // Theme example (can be expanded later)
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;

  /* Global animation toggle (element-level animation enabled state) */
  animationEnabled: boolean;
  setAnimationEnabled: (v: boolean) => void;

  /* Current page SlideAnimationAPI */
  currentSlideAPI: SlideAnimationAPI | null;
  setCurrentSlideAPI: (api: SlideAnimationAPI | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isFullScreen: false,
  setFullScreen: (v) => {
    if (typeof document !== "undefined") {
      if (v) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
      }
    }
    set({ isFullScreen: v });
  },

  theme: "light",
  setTheme: (theme) => set({ theme }),

  /* Global animation toggle (element-level animation enabled state) */
  animationEnabled: false,
  setAnimationEnabled: (v: boolean) => {
    (window as unknown as { presentationAnimationsEnabled?: boolean }).presentationAnimationsEnabled = v;
    set({ animationEnabled: v });
  },

  /* Current page SlideAnimationAPI */
  currentSlideAPI: null,
  setCurrentSlideAPI: (api) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).currentSlideAnimationAPI = api;
    set({ currentSlideAPI: api });
  },
}));
