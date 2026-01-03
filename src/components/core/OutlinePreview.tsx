/** Start: This code should always be kept as is */
import React from "react";
import { PPTSlide } from "@/types/ppt";
import { cn } from "@/lib/utils";
import { DirectSlidePreview } from "./DirectSlidePreview";

interface OutlinePreviewProps {
  slides: PPTSlide[];
  currentIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

/**
 * Vertical list of slide previews used as an outline navigator.
 * Slides are rendered directly as components instead of using thumbnails.
 */
export const OutlinePreview: React.FC<OutlinePreviewProps> = ({ slides, currentIndex, onSelect, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {slides.map((slide, index) => (
        <DirectSlidePreview key={slide.id} slide={slide} isActive={index === currentIndex} onClick={() => onSelect(index)} />
      ))}
    </div>
  );
};
/* End: This code should always be kept as is */
