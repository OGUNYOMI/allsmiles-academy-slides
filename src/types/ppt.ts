import type { ComponentType } from "react";

// Page-level animation type definitions
export type SlideAnimationType =
  | "fade" // Fade in/out
  | "slideLeft" // Slide in from right to left
  | "slideRight" // Slide in from left to right
  | "slideUp" // Slide in from bottom to top
  | "slideDown" // Slide in from top to bottom
  | "scale" // Scale
  | "rotate" // Rotate
  | "flip" // Flip
  | "zoom" // Zoom in/out
  | "none"; // No animation
// Element-level animation type definitions
export type ElementAnimationType =
  // Attention Seekers
  | "bounce"
  | "flash"
  | "pulse"
  | "rubberBand"
  | "shakeX"
  | "shakeY"
  | "headShake"
  | "swing"
  | "tada"
  | "wobble"
  | "jello"
  | "heartBeat"

  // Fade in/out
  | "fadeIn"
  | "fadeOut"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "fadeInTopLeft"
  | "fadeInTopRight"
  | "fadeInBottomLeft"
  | "fadeInBottomRight"
  | "fadeInUpBig"
  | "fadeInDownBig"
  | "fadeInLeftBig"
  | "fadeInRightBig"
  | "fadeOutUp"
  | "fadeOutDown"
  | "fadeOutLeft"
  | "fadeOutRight"
  | "fadeOutTopLeft"
  | "fadeOutTopRight"
  | "fadeOutBottomLeft"
  | "fadeOutBottomRight"
  | "fadeOutLeftBig"
  | "fadeOutRightBig"
  | "fadeOutUpBig"
  | "fadeOutDownBig"

  // Slide in/out animations
  | "slideInLeft"
  | "slideInRight"
  | "slideInUp"
  | "slideInDown"
  | "slideOutLeft"
  | "slideOutRight"
  | "slideOutUp"
  | "slideOutDown"

  // Scale animations
  | "zoomIn"
  | "zoomOut"
  | "zoomInLeft"
  | "zoomInRight"
  | "zoomInUp"
  | "zoomInDown"
  | "zoomOutLeft"
  | "zoomOutRight"
  | "zoomOutUp"
  | "zoomOutDown"

  // Rotate and flip
  | "rotateIn"
  | "rotateOut"
  | "rotateInDownLeft"
  | "rotateInDownRight"
  | "rotateInUpLeft"
  | "rotateInUpRight"
  | "rotateOutDownLeft"
  | "rotateOutDownRight"
  | "rotateOutUpLeft"
  | "rotateOutUpRight"
  | "flip"
  | "flipInX"
  | "flipInY"
  | "flipOutX"
  | "flipOutY"

  // Bounce animations
  | "bounceIn"
  | "bounceOut"
  | "bounceInDown"
  | "bounceInLeft"
  | "bounceInRight"
  | "bounceInUp"
  | "bounceOutDown"
  | "bounceOutLeft"
  | "bounceOutRight"
  | "bounceOutUp"

  // Back animations
  | "backInLeft"
  | "backInRight"
  | "backInUp"
  | "backInDown"
  | "backOutLeft"
  | "backOutRight"
  | "backOutUp"
  | "backOutDown"

  // Light speed animations
  | "lightSpeedInRight"
  | "lightSpeedInLeft"
  | "lightSpeedOutRight"
  | "lightSpeedOutLeft"

  // Special animations
  | "jackInTheBox"
  | "hinge"
  | "rollIn"
  | "rollOut"

  // Custom effects
  | "typewriter"

  // No animation
  | "none";

// Page-level animation configuration
export interface SlideAnimation {
  /** Animation type */
  type: SlideAnimationType;
  /** Animation duration (milliseconds) */
  duration?: number;
  /** Animation delay (milliseconds) */
  delay?: number;
  /** Animation easing function */
  easing?: string;
}

// Element-level animation configuration
export interface ElementAnimation {
  /** Animation type */
  type: ElementAnimationType;
  /** Animation duration (milliseconds) */
  duration?: number;
  /** Animation delay (milliseconds) */
  delay?: number;
  /** Animation easing function */
  easing?: string;
  /** Execution order (for sequential mode, smaller numbers execute first) */
  order?: number;
}

// Element animation execution mode
export type AnimationMode = "sequential" | "parallel";

export interface PPTSlide {
  /** Unique identifier */
  id: string;
  /** Optional title to display in navigation / outline */
  title?: string;
  /** For legacy slides: external URL of html/iframe */
  url?: string;
  /** For new slides: React component implementing the slide */
  component?: ComponentType;
  /** Loading flag – mostly used for iframes */
  isLoaded?: boolean;
  /** Entrance animation configuration */
  enterAnimation?: SlideAnimation;
  /** Exit animation configuration */
  exitAnimation?: SlideAnimation;
  /** Element animation execution mode */
  animationMode?: AnimationMode;
  /** Whether to allow skipping animations */
  allowSkip?: boolean;
}

export interface PPTMessage {
  type: "sendHeight" | "SlideNext" | "SlidePrev" | "SlideElementClicked" | "SlideSaveTextStyle" | "SlideModifyImgStyle" | "slideUpdateHtml";
  data?: Record<string, unknown>;
  slideId?: string;
  height?: number;
  elementId?: string;
  styles?: Record<string, string>;
  html?: string;
}

export interface SlideElement {
  id: string;
  type: "text" | "image" | "other";
  selected: boolean;
  styles?: Record<string, string>;
}

export interface VisualEditorProps {
  selectedElement?: SlideElement;
  onStyleChange: (styles: Record<string, string>) => void;
  onImageModify: (imageData: Record<string, unknown>) => void;
}

export interface UsePDFExportOptions {
  /** PDF filename */
  filename?: string;
  /** Whether to show progress callback */
  onProgress?: (current: number, total: number) => void;
  /** Image quality (0-1) */
  imageQuality?: number;
  /** Whether to fill full screen */
  fullScreen?: boolean;
  /** Export mode */
  exportMode?: "image" | "html";
}
