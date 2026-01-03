import type { ComponentType } from "react";
import { PPTSlide } from "@/components/core/Base";
import { slideRegistry } from "@/components/core/SlideRegistry";
import type { SlideAnimation } from "@/types/ppt";

interface RegisterSlideOptions {
  title?: string;
  order?: number;
  enterAnimation?: SlideAnimation;
  exitAnimation?: SlideAnimation;
}

/**
 * Use decorator to declare and register a Slide component.
 * Implement automatic import of Slides, easy and efficient, registering is equal to immediately seeing a slide on the page
 *
 * @example
 * ```tsx
 * @RegisterSlide({ id: "intro", order: 0 })
 * export default function Intro() { return <div>...</div>; }
 * ```
 */
export function RegisterSlide(opts: RegisterSlideOptions) {
  return function <T extends ComponentType>(Component: T): T {
    const id = Date.now() + Math.random().toString(36).substring(2, 15); // generate unique ID
    const slide = new PPTSlide(`${id}`, opts.title ?? `${id}`, Component, opts.enterAnimation, opts.exitAnimation);
    slideRegistry.register(slide, opts.order);
    return Component;
  };
}
