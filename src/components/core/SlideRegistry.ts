/** Start: This code should always be kept as is */
import { PPTSlide } from "./Base";

/**
 * Global Slide registry, for managing all PPTSlide instances
 */
export class SlideRegistry {
  private static instance: SlideRegistry;
  private slides: Map<string, PPTSlide> = new Map();
  private slideOrder: string[] = [];

  private constructor() {}

  /**
   * Get the singleton instance of the registry
   */
  static getInstance(): SlideRegistry {
    if (!SlideRegistry.instance) {
      SlideRegistry.instance = new SlideRegistry();
    }
    return SlideRegistry.instance;
  }

  /**
   * Register a new slide
   * @param slide PPTSlide instance
   * @param order optional sorting weight, the smaller the number, the earlier it will be, the default is the maximum value
   */
  register(slide: PPTSlide, order?: number): void {
    if (!slide.id) {
      throw new Error("Slide must have a valid id");
    }

    if (this.slides.has(slide.id)) {
      console.warn(`Slide with id "${slide.id}" already exists. Overwriting...`);
    }

    // store slide and its sorting weight
    slide.order = order ?? Number.MAX_SAFE_INTEGER;
    this.slides.set(slide.id, slide);

    // rebuild the sorting array
    this.rebuildSlideOrder();
  }

  /**
   * Rebuild the slide order array, sorted by order weight
   */
  private rebuildSlideOrder(): void {
    const slidesWithOrder = Array.from(this.slides.values()).sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

    this.slideOrder = slidesWithOrder.map((slide) => slide.id);
  }

  /**
   * Get all slides, sorted by order weight
   */
  getAllSlides(): PPTSlide[] {
    return this.slideOrder.map((id) => this.slides.get(id)).filter((slide): slide is PPTSlide => slide !== undefined);
  }

  /**
   * Get the total number of slides
   */
  getSlideCount(): number {
    return this.slides.size;
  }

  /**
   * Get the slide by index
   * @param index index position
   */
  getSlideByIndex(index: number): PPTSlide | undefined {
    const id = this.slideOrder[index];
    return id ? this.slides.get(id) : undefined;
  }

  /**
   * Get the index of the slide
   * @param id slide id
   */
  getSlideIndex(id: string): number {
    return this.slideOrder.indexOf(id);
  }

  /**
   * Remove the slide
   * @param id slide id
   */
  unregister(id: string): boolean {
    const removed = this.slides.delete(id);
    const orderIndex = this.slideOrder.indexOf(id);
    if (orderIndex !== -1) {
      this.slideOrder.splice(orderIndex, 1);
    }
    return removed;
  }

  /**
   * Clear all slides
   */
  clear(): void {
    this.slides.clear();
    this.slideOrder = [];
  }

  /**
   * Reorder the slides
   * @param newOrder new id order array
   */
  reorder(newOrder: string[]): void {
    // validate all ids exist
    const validIds = newOrder.filter((id) => this.slides.has(id));

    if (validIds.length !== this.slides.size) {
      console.warn("Some slide IDs in new order don't exist or are missing");
    }

    this.slideOrder = validIds;
  }

  /**
   * Check if the slide exists
   * @param id slide id
   */
  hasSlide(id: string): boolean {
    return this.slides.has(id);
  }
}

// export the global registry instance
export const slideRegistry = SlideRegistry.getInstance();
/* End: This code should always be kept as is */
