/** Start: This code should always be kept as is */
/** Ensure all slides are imported in the project build, otherwise the slides will not display properly */
import { slideRegistry } from "./SlideRegistry";

// Import all .tsx files in the current directory using Vite's import.meta.globEager,
// just execute them to trigger RegisterSlide registration logic.
const modules = import.meta.glob("@/pages/slides/*.tsx", { eager: true });
void modules; // eslint disable unused variable warning

export const Slides = slideRegistry.getAllSlides();
export { slideRegistry };
/* End: This code should always be kept as is */

/* Start: Another method, import each file one by one
import { slideRegistry } from "./SlideRegistry";

// Import all slides
import "@/pages/slides/IntroSlide";
import "@/pages/slides/CompanyBackgroundSlide";
import "@/pages/slides/BusinessModelSlide";
import "@/pages/slides/SupplyChainSlide";
import "@/pages/slides/MarketStrategySlide";
import "@/pages/slides/GlobalImpactSlide";
import "@/pages/slides/FutureOutlookSlide";
import "@/pages/slides/ConclusionSlide";
import "@/pages/slides/end";

// Export slides in order
export const Slides = slideRegistry.getAllSlides();  // note that the method called here is `getAllSlides`;

End: Another method, import each file one by one */
