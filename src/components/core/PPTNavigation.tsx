/** Start: This code should always be kept as is */
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Circle, Dot } from "lucide-react";
import { PPTSlide } from "@/types/ppt";
import { cn } from "@/lib/utils";

interface PPTNavigationProps {
  currentIndex: number;
  totalSlides: number;
  onNext: () => void;
  onPrev: () => void;
  onGoToSlide: (index: number) => void;
  slides: PPTSlide[];
  className?: string;
}

export const PPTNavigation: React.FC<PPTNavigationProps> = ({ currentIndex, totalSlides, onNext, onPrev, onGoToSlide, slides, className }) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* previous button */}
      <Button variant="outline" size="sm" onClick={onPrev} disabled={currentIndex === 0} className="flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {/* slide indicators */}
      <div className="flex items-center gap-1 px-4">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => onGoToSlide(index)}
            className={cn("w-3 h-3 rounded-full transition-all duration-200 hover:scale-110", index === currentIndex ? "bg-blue-600 scale-110" : "bg-gray-300 hover:bg-gray-400")}
            title={slide.title || `Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* next button */}
      <Button variant="outline" size="sm" onClick={onNext} disabled={currentIndex === totalSlides - 1} className="flex items-center gap-2">
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

// alternative compact navigation for smaller spaces
export const CompactPPTNavigation: React.FC<PPTNavigationProps> = ({ currentIndex, totalSlides, onNext, onPrev, onGoToSlide, slides, className }) => {
  return (
    <Card className={cn("p-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onPrev} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{currentIndex + 1}</span>
          <span className="text-sm text-gray-500">/</span>
          <span className="text-sm text-gray-500">{totalSlides}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={onNext} disabled={currentIndex === totalSlides - 1}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* progress bar */}
      <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / totalSlides) * 100}%`,
          }}
        />
      </div>
    </Card>
  );
};
/* End: This code should always be kept as is */
