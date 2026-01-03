/// <reference types="vite/client" />
import type { SlideAnimationAPI } from "@/hooks/useSlideAnimation";

declare global {
  interface Window {
    /** Current slide animation control API, mounted/cleaned by each Slide component in useEffect */
    currentSlideAnimationAPI: SlideAnimationAPI | null;
  }
}
