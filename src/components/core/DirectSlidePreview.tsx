/** Start: This code should always be kept as is */
import React from "react";
import { PPTSlide } from "@/types/ppt";
import { cn } from "@/lib/utils";

interface DirectSlidePreviewProps {
  slide: PPTSlide;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Directly renders a slide component in a small preview container.
 * This replaces the thumbnail-based approach with direct component rendering.
 */
export const DirectSlidePreview: React.FC<DirectSlidePreviewProps> = ({ slide, isActive, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer select-none transition-all duration-300",
        isActive ? "border-1 border-blue-600" : "hover:border-1 hover:border-blue-400",
        "rounded-md border bg-white p-1 transition box-border",
        className
      )}
    >
      <div className="relative w-full h-32 overflow-hidden rounded bg-gray-50">
        {slide.component ? (
          <div
            className="w-full h-full transform-gpu origin-top-left overflow-hidden"
            style={{
              transform: "scale(0.178)", // Scale to fill container better (1280px * 0.178 ≈ 228px, 720px * 0.178 ≈ 128px)
              width: "562%", // 100% / 0.178 ≈ 562%
              height: "562%", // 100% / 0.178 ≈ 562%
            }}
          >
            <div
              className="w-full h-full bg-white overflow-hidden"
              style={{
                width: "1280px",
                height: "720px",
              }}
            >
              <div className="w-full h-full">{React.createElement(slide.component)}</div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-500">
            <span className="text-center">{slide.title || "Slide"}</span>
          </div>
        )}
      </div>
    </div>
  );
};
/* End: This code should always be kept as is */
