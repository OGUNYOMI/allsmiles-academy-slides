/** Start: This code should always be kept as is */
import React from "react";
import { PPTSlide } from "@/types/ppt";
import { cn } from "@/lib/utils";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideGridProps {
  slides: PPTSlide[];
  currentIndex: number;
  onSlideSelect: (index: number) => void;
  onClose: () => void;
  thumbnails?: Record<string, string>;
  className?: string;
}

/**
 * Grid view of all slides for quick navigation in fullscreen mode
 */
export const SlideGrid: React.FC<SlideGridProps> = ({ slides, currentIndex, onSlideSelect, onClose, thumbnails = {}, className }) => {
  // Calculate grid layout based on number of slides
  const getGridCols = (count: number) => {
    if (count <= 4) return "grid-cols-4";
    if (count <= 9) return "grid-cols-4";
    if (count <= 16) return "grid-cols-4";
    return "grid-cols-5";
  };

  return (
    <div className={cn("fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8", className)}>
      {/* Close button */}
      <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/10 z-10" onClick={onClose}>
        <X className="w-6 h-6" />
      </Button>

      {/* Grid container */}
      <div className="w-full max-h-full overflow-auto">
        <div className={cn("grid gap-4", getGridCols(slides.length))}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => {
                onSlideSelect(index);
                onClose();
              }}
              className={cn(
                "relative cursor-pointer group transition-all duration-300 rounded-lg overflow-hidden border-2",
                index === currentIndex ? "border-blue-500  shadow-lg shadow-blue-500/50" : "border-white/20 hover:border-white/40 "
              )}
            >
              {/* Slide thumbnail */}
              <div className="relative aspect-video bg-gray-800">
                {thumbnails[slide.id] ? (
                  <img src={thumbnails[slide.id]} alt={slide.title || `Slide ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700 text-white text-sm">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    <span className="text-center">{slide.title || `Slide ${index + 1}`}</span>
                  </div>
                )}

                {/* Overlay with slide number */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-lg font-semibold">{index + 1}</div>
                </div>
              </div>

              {/* Slide title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="text-white text-sm font-medium truncate">{slide.title || `Slide ${index + 1}`}</div>
              </div>

              {/* Current slide indicator */}
              {index === currentIndex && <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">Current</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">Click any slide to navigate • Press ESC to close</div>
    </div>
  );
};

/* End: This code should always be kept as is */
