/** Start: This code should always be kept as is */
import React, { useEffect, useRef, useState } from "react";
import { PPTSlide } from "@/types/ppt";
import { snapdom, preCache } from "@zumer/snapdom";
import type { SnapdomResult } from "@/types/snapdom";
import type { SlideAnimationAPI } from "@/hooks/useSlideAnimation";

interface SlideThumbnailPreloaderProps {
  slides: PPTSlide[];
  onSnapshot: (slideId: string, dataUrl: string) => void;
  /** Map of already captured thumbnails to avoid duplicates */
  existing?: Record<string, string>;
}

// Helper: schedule a task in next animation frame with an optional delay
const schedule = (fn: () => void, delay = 0) => {
  if (delay > 0) {
    setTimeout(() => requestAnimationFrame(fn), delay);
  } else {
    requestAnimationFrame(fn);
  }
};

/**
 * Renders slides off-screen in batches and captures PNG thumbnails via snapdom.
 * Only renders 4 slides at a time to balance performance and memory usage.
 */
export const SlideThumbnailPreloader: React.FC<SlideThumbnailPreloaderProps> = ({ slides, onSnapshot, existing = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentBatchSlides, setCurrentBatchSlides] = useState<PPTSlide[]>([]);
  const isProcessingRef = useRef(false);

  console.log("SlideThumbnailPreloader");

  useEffect(() => {
    if (!containerRef.current || isProcessingRef.current) return;

    console.log("useEffect");

    const captureSlides = async () => {
      console.log("captureSlides");

      isProcessingRef.current = true;

      // Pre-cache fonts and images for better snapdom performance
      try {
        await preCache(containerRef.current!, { embedFonts: true });
      } catch {
        // Continue even if preCache fails
      }

      const pending = slides.filter((s) => !existing[s.id]);
      const BATCH_SIZE = 6; // 增加批次大小

      // Process slides in batches, rendering only current batch in DOM
      for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        const batch = pending.slice(i, i + BATCH_SIZE);

        // Render current batch in DOM
        setCurrentBatchSlides(batch);

        // Use requestAnimationFrame for faster DOM rendering detection
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve); // Double RAF for better reliability
          });
        });

        // Capture all slides in current batch simultaneously
        const promises = batch.map(async (slide) => {
          const el = containerRef.current!.querySelector(`[data-preload-id="${slide.id}"]`);
          if (el) {
            try {
              const res = (await snapdom(el as HTMLElement)) as SnapdomResult;

              const img = await res.toPng();

              // Wait for image to be fully loaded (especially important for CDN URLs)
              if (img.decode) {
                try {
                  await img.decode();
                } catch {
                  // ignore decode errors
                }
              }

              // Additional wait to ensure CDN images are loaded
              await new Promise(resolve => setTimeout(resolve, 200));

              // Validate image dimensions
              if (!img.naturalWidth || !img.naturalHeight) {
                console.error(`Thumbnail ${slide.id}: invalid image dimensions`);
                return;
              }

              const canvas = document.createElement("canvas");
              canvas.width = 340;
              canvas.height = 185;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png", 0.8); // 降低质量提升速度
                onSnapshot(slide.id, dataUrl);
              }
            } catch (err) {
              console.error(`Thumbnail capture failed for ${slide.id}:`, err);
            }
          }
        });

        // Wait for all slides in current batch to complete
        await Promise.all(promises);

        // Clear current batch from DOM before processing next batch
        setCurrentBatchSlides([]);

        // 减少批次间延迟
        if (i + BATCH_SIZE < pending.length) {
          await new Promise((resolve) => setTimeout(resolve, 16)); // 减少到16ms
        }
      }

      isProcessingRef.current = false;
    };

    // Start capture with minimal delay to allow DOM to stabilize
    const timer = setTimeout(() => schedule(captureSlides), 10);
    return () => clearTimeout(timer);
  }, [slides, onSnapshot, existing]);

  return (
    <div ref={containerRef} style={{ position: "absolute", left: -9999, top: -9999, width: 0, height: 0, overflow: "hidden" }}>
      {currentBatchSlides.map((slide) => (
        <div key={slide.id} data-preload-id={slide.id} style={{ width: 1280, height: 720 }}>
          {slide.component ? <ThumbnailSlideWrapper>{React.createElement(slide.component)}</ThumbnailSlideWrapper> : null}
        </div>
      ))}
    </div>
  );
};

// wrapper component, disable animation API registration
const ThumbnailSlideWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    // save the original global API
    const originalAPI = window.currentSlideAnimationAPI;

    // create a empty mock API to replace
    const mockAPI = {
      addElement: () => mockAPI,
      setMode: () => mockAPI,
      startGrouped: () => mockAPI,
      start: () => {},
      nextGroup: () => {},
      emphasis: () => {},
      exit: () => {},
      reset: () => {},
      skip: () => {},
      getCurrentGroup: () => 0,
      getTotalGroups: () => 0,
      isAllGroupsComplete: () => true,
      isEmphasisComplete: () => true,
      isExitComplete: () => true,
      onEnterComplete: () => {},
      onEmphasisComplete: () => {},
      onExitComplete: () => {},
      onGroupComplete: () => {},
    } as unknown as SlideAnimationAPI;

    // temporarily replace the global API
    window.currentSlideAnimationAPI = mockAPI;

    return () => {
      // restore the original API
      window.currentSlideAnimationAPI = originalAPI;
    };
  }, []);

  return <>{children}</>;
};
/* End: This code should always be kept as is */
