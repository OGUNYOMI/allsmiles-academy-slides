import { SlideAnimationType, ElementAnimationType } from "@/types/ppt";

// page-level animation mapping to Animate.css class names
export const slideAnimationMapping: Record<SlideAnimationType, { enter: string; exit: string }> = {
  fade: { enter: "animate__animated animate__fadeIn", exit: "animate__animated animate__fadeOut" },
  slideLeft: { enter: "animate__animated animate__slideInRight", exit: "animate__animated animate__slideOutLeft" },
  slideRight: { enter: "animate__animated animate__slideInLeft", exit: "animate__animated animate__slideOutRight" },
  slideUp: { enter: "animate__animated animate__slideInUp", exit: "animate__animated animate__slideOutDown" },
  slideDown: { enter: "animate__animated animate__slideInDown", exit: "animate__animated animate__slideOutUp" },
  scale: { enter: "animate__animated animate__zoomIn", exit: "animate__animated animate__zoomOut" },
  rotate: { enter: "animate__animated animate__rotateIn", exit: "animate__animated animate__rotateOut" },
  flip: { enter: "animate__animated animate__flipInX", exit: "animate__animated animate__flipOutX" },
  zoom: { enter: "animate__animated animate__zoomIn", exit: "animate__animated animate__zoomOut" },
  none: { enter: "", exit: "" },
};

// element-level animation mapping to Animate.css class names
export const elementAnimationMapping: Record<ElementAnimationType, string> = {
  // emphasis animation (Attention Seekers)
  bounce: "animate__animated animate__bounce",
  flash: "animate__animated animate__flash",
  pulse: "animate__animated animate__pulse",
  rubberBand: "animate__animated animate__rubberBand",
  shakeX: "animate__animated animate__shakeX",
  shakeY: "animate__animated animate__shakeY",
  headShake: "animate__animated animate__headShake",
  swing: "animate__animated animate__swing",
  tada: "animate__animated animate__tada",
  wobble: "animate__animated animate__wobble",
  jello: "animate__animated animate__jello",
  heartBeat: "animate__animated animate__heartBeat",

  // fade in/out
  fadeIn: "animate__animated animate__fadeIn",
  fadeOut: "animate__animated animate__fadeOut",
  fadeInUp: "animate__animated animate__fadeInUp",
  fadeInDown: "animate__animated animate__fadeInDown",
  fadeInLeft: "animate__animated animate__fadeInLeft",
  fadeInRight: "animate__animated animate__fadeInRight",
  fadeInTopLeft: "animate__animated animate__fadeInTopLeft",
  fadeInTopRight: "animate__animated animate__fadeInTopRight",
  fadeInBottomLeft: "animate__animated animate__fadeInBottomLeft",
  fadeInBottomRight: "animate__animated animate__fadeInBottomRight",
  fadeInUpBig: "animate__animated animate__fadeInUpBig",
  fadeInDownBig: "animate__animated animate__fadeInDownBig",
  fadeInLeftBig: "animate__animated animate__fadeInLeftBig",
  fadeInRightBig: "animate__animated animate__fadeInRightBig",
  fadeOutUp: "animate__animated animate__fadeOutUp",
  fadeOutDown: "animate__animated animate__fadeOutDown",
  fadeOutLeft: "animate__animated animate__fadeOutLeft",
  fadeOutRight: "animate__animated animate__fadeOutRight",
  fadeOutTopLeft: "animate__animated animate__fadeOutTopLeft",
  fadeOutTopRight: "animate__animated animate__fadeOutTopRight",
  fadeOutBottomLeft: "animate__animated animate__fadeOutBottomLeft",
  fadeOutBottomRight: "animate__animated animate__fadeOutBottomRight",
  fadeOutLeftBig: "animate__animated animate__fadeOutLeftBig",
  fadeOutRightBig: "animate__animated animate__fadeOutRightBig",
  fadeOutUpBig: "animate__animated animate__fadeOutUpBig",
  fadeOutDownBig: "animate__animated animate__fadeOutDownBig",

  // slide in/out animation
  slideInLeft: "animate__animated animate__slideInLeft",
  slideInRight: "animate__animated animate__slideInRight",
  slideInUp: "animate__animated animate__slideInUp",
  slideInDown: "animate__animated animate__slideInDown",
  slideOutLeft: "animate__animated animate__slideOutLeft",
  slideOutRight: "animate__animated animate__slideOutRight",
  slideOutUp: "animate__animated animate__slideOutUp",
  slideOutDown: "animate__animated animate__slideOutDown",

  // scale animation
  zoomIn: "animate__animated animate__zoomIn",
  zoomOut: "animate__animated animate__zoomOut",
  zoomInLeft: "animate__animated animate__zoomInLeft",
  zoomInRight: "animate__animated animate__zoomInRight",
  zoomInUp: "animate__animated animate__zoomInUp",
  zoomInDown: "animate__animated animate__zoomInDown",
  zoomOutLeft: "animate__animated animate__zoomOutLeft",
  zoomOutRight: "animate__animated animate__zoomOutRight",
  zoomOutUp: "animate__animated animate__zoomOutUp",
  zoomOutDown: "animate__animated animate__zoomOutDown",

  // rotate and flip
  rotateIn: "animate__animated animate__rotateIn",
  rotateOut: "animate__animated animate__rotateOut",
  rotateInDownLeft: "animate__animated animate__rotateInDownLeft",
  rotateInDownRight: "animate__animated animate__rotateInDownRight",
  rotateInUpLeft: "animate__animated animate__rotateInUpLeft",
  rotateInUpRight: "animate__animated animate__rotateInUpRight",
  rotateOutDownLeft: "animate__animated animate__rotateOutDownLeft",
  rotateOutDownRight: "animate__animated animate__rotateOutDownRight",
  rotateOutUpLeft: "animate__animated animate__rotateOutUpLeft",
  rotateOutUpRight: "animate__animated animate__rotateOutUpRight",
  flip: "animate__animated animate__flip",
  flipInX: "animate__animated animate__flipInX",
  flipInY: "animate__animated animate__flipInY",
  flipOutX: "animate__animated animate__flipOutX",
  flipOutY: "animate__animated animate__flipOutY",

  // bounce animation
  bounceIn: "animate__animated animate__bounceIn",
  bounceOut: "animate__animated animate__bounceOut",
  bounceInDown: "animate__animated animate__bounceInDown",
  bounceInLeft: "animate__animated animate__bounceInLeft",
  bounceInRight: "animate__animated animate__bounceInRight",
  bounceInUp: "animate__animated animate__bounceInUp",
  bounceOutDown: "animate__animated animate__bounceOutDown",
  bounceOutLeft: "animate__animated animate__bounceOutLeft",
  bounceOutRight: "animate__animated animate__bounceOutRight",
  bounceOutUp: "animate__animated animate__bounceOutUp",

  // back animation
  backInLeft: "animate__animated animate__backInLeft",
  backInRight: "animate__animated animate__backInRight",
  backInUp: "animate__animated animate__backInUp",
  backInDown: "animate__animated animate__backInDown",
  backOutLeft: "animate__animated animate__backOutLeft",
  backOutRight: "animate__animated animate__backOutRight",
  backOutUp: "animate__animated animate__backOutUp",
  backOutDown: "animate__animated animate__backOutDown",

  // light speed animation
  lightSpeedInRight: "animate__animated animate__lightSpeedInRight",
  lightSpeedInLeft: "animate__animated animate__lightSpeedInLeft",
  lightSpeedOutRight: "animate__animated animate__lightSpeedOutRight",
  lightSpeedOutLeft: "animate__animated animate__lightSpeedOutLeft",

  // special animation
  jackInTheBox: "animate__animated animate__jackInTheBox",
  hinge: "animate__animated animate__hinge",
  rollIn: "animate__animated animate__rollIn",
  rollOut: "animate__animated animate__rollOut",

  // custom effect
  typewriter: "",

  // no animation
  none: "",
};

// initial state class of enter animation (used to hide/position elements before animation starts)
export const elementEnterInitClassMapping: Partial<Record<ElementAnimationType, string>> = {
  // emphasis animation (Attention Seekers)
  bounce: "ppt-init-bounce",
  flash: "ppt-init-flash",
  pulse: "ppt-init-pulse",
  rubberBand: "ppt-init-rubberBand",
  shakeX: "ppt-init-shakeX",
  shakeY: "ppt-init-shakeY",
  headShake: "ppt-init-headShake",
  swing: "ppt-init-swing",
  tada: "ppt-init-tada",
  wobble: "ppt-init-wobble",
  jello: "ppt-init-jello",
  heartBeat: "ppt-init-heartBeat",

  // fade in animation
  fadeIn: "ppt-init-fadeIn",
  fadeInUp: "ppt-init-fadeInUp",
  fadeInDown: "ppt-init-fadeInDown",
  fadeInLeft: "ppt-init-fadeInLeft",
  fadeInRight: "ppt-init-fadeInRight",
  fadeInTopLeft: "ppt-init-fadeInTopLeft",
  fadeInTopRight: "ppt-init-fadeInTopRight",
  fadeInBottomLeft: "ppt-init-fadeInBottomLeft",
  fadeInBottomRight: "ppt-init-fadeInBottomRight",
  fadeInLeftBig: "ppt-init-fadeInLeftBig",
  fadeInRightBig: "ppt-init-fadeInRightBig",
  fadeInDownBig: "ppt-init-fadeInDownBig",
  fadeInUpBig: "ppt-init-fadeInUpBig",

  // slide in animation
  slideInLeft: "ppt-init-slideInLeft",
  slideInRight: "ppt-init-slideInRight",
  slideInUp: "ppt-init-slideInUp",
  slideInDown: "ppt-init-slideInDown",

  // scale animation
  zoomIn: "ppt-init-zoomIn",
  zoomInLeft: "ppt-init-zoomInLeft",
  zoomInRight: "ppt-init-zoomInRight",
  zoomInUp: "ppt-init-zoomInUp",
  zoomInDown: "ppt-init-zoomInDown",

  // rotate and flip animation
  rotateIn: "ppt-init-rotateIn",
  rotateInDownLeft: "ppt-init-rotateInDownLeft",
  rotateInDownRight: "ppt-init-rotateInDownRight",
  rotateInUpLeft: "ppt-init-rotateInUpLeft",
  rotateInUpRight: "ppt-init-rotateInUpRight",
  flip: "ppt-init-flip",
  flipInX: "ppt-init-flipInX",
  flipInY: "ppt-init-flipInY",

  // bounce animation
  bounceIn: "ppt-init-bounceIn",
  bounceInDown: "ppt-init-bounceInDown",
  bounceInLeft: "ppt-init-bounceInLeft",
  bounceInRight: "ppt-init-bounceInRight",
  bounceInUp: "ppt-init-bounceInUp",

  // back animation
  backInLeft: "ppt-init-backInLeft",
  backInRight: "ppt-init-backInRight",
  backInUp: "ppt-init-backInUp",
  backInDown: "ppt-init-backInDown",

  // light speed animation
  lightSpeedInRight: "ppt-init-lightSpeedInRight",
  lightSpeedInLeft: "ppt-init-lightSpeedInLeft",

  // special animation
  jackInTheBox: "ppt-init-jackInTheBox",
  rollIn: "ppt-init-rollIn",

  // custom effect
  typewriter: "ppt-init-typewriter",
};

// get animation duration class name (Animate.css only supports limited speed class names)
export const getDurationClass = (duration: number): string => {
  if (duration <= 500) return "animate__faster";
  if (duration <= 1000) return ""; // default
  if (duration <= 1500) return "animate__slow";
  return "animate__slower";
};

// get animation delay class name (Animate.css supports animate__delay-1s ~ animate__delay-5s)
export const getDelayClass = (delay: number): string => {
  if (delay < 1000) return "";
  if (delay < 2000) return "animate__delay-1s";
  if (delay < 3000) return "animate__delay-2s";
  if (delay < 4000) return "animate__delay-3s";
  if (delay < 5000) return "animate__delay-4s";
  return "animate__delay-5s";
};
