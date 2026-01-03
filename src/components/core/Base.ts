/** Start: This code should always be kept as is **/
import React, { ComponentType } from "react";
import type { SlideAnimation, SlideAnimationType } from "@/types/ppt";

/**
 * Represents a slide in the PowerPoint presentation.
 */
export class PPTSlide {
  public id: string;
  public title: string;
  public component: ComponentType;
  public enterAnimation?: SlideAnimation;
  public exitAnimation?: SlideAnimation;
  public order?: number; // New sorting weight property

  constructor(id: string, title: string, component: ComponentType, enterAnimation?: SlideAnimation, exitAnimation?: SlideAnimation) {
    this.id = id;
    this.title = title;
    this.component = component;
    this.enterAnimation = enterAnimation;
    this.exitAnimation = exitAnimation;
  }
}
/* End: This code should always be kept as is */
