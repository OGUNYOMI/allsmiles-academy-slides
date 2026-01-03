/** Start: This code should always be kept as is */
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ControlBarItem {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

interface ControlBarProps {
  items: ControlBarItem[];
  position?: "bottom" | "bottom-left" | "top-right";
  theme?: "light" | "dark" | "clear"; // add clear theme
  className?: string;
  children?: React.ReactNode; // For custom content like page indicator
}

/**
 * Unified control bar component for PPT controls.
 * Used by both PPTBottomBar and fullscreen operation bar.
 */
export const ControlBar: React.FC<ControlBarProps> = ({ items, position = "bottom", theme = "light", className, children }) => {
  const positionClasses = {
    bottom: "w-full justify-center",
    "bottom-left": "absolute bottom-4 left-4 justify-start",
    "top-right": "absolute top-4 right-4 justify-end",
  };

  const themeClasses = {
    // increase opacity, ensure readability on light/dark backgrounds
    light: "bg-white/90 text-gray-800 border-gray-300 shadow-md",
    dark: "bg-gray-900/70 text-white border-gray-700 shadow-md",
    clear: "bg-white/90 text-gray-800    border-transparent",
  };

  const buttonTheme = {
    light: "hover:bg-gray-100",
    dark: "text-white hover:bg-white/20",
    clear: "text-gray-800 hover:bg-gray-900/10",
  };

  const baseClasses = "flex items-center gap-2 py-2 px-4 rounded-md";

  return (
    <div
      className={cn(
        baseClasses,
        // clear theme remove border
        theme === "clear" ? "" : "border",
        positionClasses[position],
        themeClasses[theme],
        className
      )}
    >
      {children}
      {items.map((item, index) => (
        <Button
          key={index}
          size="icon"
          variant="ghost"
          onClick={item.onClick}
          disabled={item.disabled}
          title={item.title}
          className={cn("w-8 h-8", buttonTheme[theme], item.className)}
        >
          {item.icon}
        </Button>
      ))}
    </div>
  );
};
/* End: This code should always be kept as is */
