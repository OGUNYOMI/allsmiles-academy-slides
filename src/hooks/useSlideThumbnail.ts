import { useRef, useCallback } from "react";
import { snapdom } from "@zumer/snapdom";
import type { SnapdomResult } from "@/types/snapdom";

/**
 * Provides a ref callback that captures a slide element once using snapdom
 * and delivers the PNG dataURL via `onSnapshot`.
 */
export function useSlideThumbnail(slideId: string, onSnapshot?: (id: string, dataUrl: string) => void, alreadyCaptured?: boolean) {
  const capturedRef = useRef(false);

  return useCallback(
    (el: HTMLElement | null) => {
      if (!el || capturedRef.current || alreadyCaptured || !onSnapshot) return;
      capturedRef.current = true;
      // capture full size then downscale to 320x180
      (async () => {
        try {
          const res = (await snapdom(el)) as SnapdomResult;
          const img = await res.toPng();

          // Ensure image decode to populate intrinsic size (avoids 0×0 canvas)
          if (img.decode) {
            try {
              await img.decode();
            } catch {
              /* ignore */
            }
          }

          // Wait a bit for image to be fully loaded
          await new Promise(resolve => setTimeout(resolve, 100));

          // Validate image dimensions before drawing
          if (!img.naturalWidth || !img.naturalHeight) {
            console.error("snapdom thumbnail error: image has invalid dimensions", {
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
            return;
          }

          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = 180;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/png");
            onSnapshot(slideId, dataUrl);
          }
        } catch (err) {
          console.error("snapdom thumbnail error", err);
        }
      })();
    },
    [slideId, onSnapshot, alreadyCaptured]
  );
}
