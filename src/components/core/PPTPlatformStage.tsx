/** Start: This code should always be kept as is */
import React, { useRef, useState, useCallback, useEffect, ReactNode, useImperativeHandle, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PPTPlatformStageProps {
  children: ReactNode;
  className?: string;
}

export interface PPTPlatformStageRef {
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

/**
 * A draggable & zoomable stage for displaying the PPT container.
 *
 * 1. Shallow gray background fills the available space.
 * 2. The inner `children` element (PPT display) is locked to 16:9 via the caller
 *    but can be freely dragged around by the user (mouse / touch).
 * 3. Wheel event zooms in/out (scales) the display, clamped between 0.3 – 3x.
 */
export const PPTPlatformStage = forwardRef<PPTPlatformStageRef, PPTPlatformStageProps>(({ children, className }, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Calculate initial scale based on wrapper size and PPT container size (1280x720)
  const calculateInitialScale = useCallback(() => {
    if (!wrapperRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const pptWidth = 1280;
    const pptHeight = 720;

    // calculate scale to fit the PPT container within the wrapper
    // Leave some padding (20px on each side)
    const padding = 40;
    const availableWidth = wrapperRect.width - padding;
    const availableHeight = wrapperRect.height - padding;

    // calculate scale based on both width and height constraints
    const scaleX = availableWidth / pptWidth;
    const scaleY = availableHeight / pptHeight;

    // use the smaller scale to ensure the PPT fits completely
    const initialScale = Math.min(scaleX, scaleY, 1); // Cap at 1 to avoid initial zoom

    setScale(initialScale);

    // center the PPT container
    setPosition({
      x: wrapperRect.width / 2,
      y: wrapperRect.height / 2,
    });
  }, []);

  // --------- Public Methods ---------
  const reset = useCallback(() => {
    calculateInitialScale();
  }, [calculateInitialScale]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(3, prev * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.3, prev / 1.2));
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      reset,
      zoomIn,
      zoomOut,
    }),
    [reset, zoomIn, zoomOut]
  );

  // --------- Drag Logic ---------
  const dragStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Only primary button
      if (e.button !== 0) return;

      // Capture pointer for smoother drag
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: position.x,
        originY: position.y,
      };
    },
    [position]
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) return;
    const { startX, startY, originX, originY } = dragStateRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    setPosition({ x: originX + dx, y: originY + dy });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current) {
      dragStateRef.current = null;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  // Add wheel event listener with non-passive option
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheelNonPassive = (e: WheelEvent) => {
      e.preventDefault();

      // Get mouse position relative to wrapper
      if (!wrapperRef.current || !contentRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom
      const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(3, Math.max(0.3, scale * scaleFactor));
      const scaleChange = newScale / scale;

      // Adjust position to zoom towards mouse position
      const newX = mouseX - (mouseX - position.x) * scaleChange;
      const newY = mouseY - (mouseY - position.y) * scaleChange;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    };

    // Add event listener with non-passive option
    wrapper.addEventListener("wheel", handleWheelNonPassive, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", handleWheelNonPassive);
    };
  }, [scale, position]);

  // Center child on initial mount and calculate initial scale
  useEffect(() => {
    calculateInitialScale();
  }, [calculateInitialScale]);

  return (
    <div ref={wrapperRef} className={cn("relative  w-full h-full bg-gray-100 overflow-hidden", className)}>
      <div
        ref={contentRef}
        className="absolute top-0 left-0"
        style={{
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "center center",
          cursor: dragStateRef.current ? "grabbing" : "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
});

PPTPlatformStage.displayName = "PPTPlatformStage";
/* End: This code should always be kept as is */
