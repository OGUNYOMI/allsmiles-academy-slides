import { useCallback, useRef } from "react";
import { jsPDF } from "jspdf";
import { snapdom } from "@zumer/snapdom";
import type { SnapdomResult } from "@/types/snapdom";
import type { PPTSlide, UsePDFExportOptions } from "@/types/ppt";

export function usePDFExport(options: UsePDFExportOptions = {}) {
  const { filename = "presentation.pdf", onProgress, imageQuality = 1, fullScreen = true } = options;
  const isExportingRef = useRef(false);

  const exportToPDF = useCallback(
    async (slides: PPTSlide[], containerRef: React.RefObject<HTMLElement>, onSlideChange?: (index: number) => void) => {
      if (isExportingRef.current || !containerRef.current) {
        return;
      }

      isExportingRef.current = true;

      // temporarily display the hidden container for screenshot
      const originalStyle = containerRef.current.style.cssText;
      containerRef.current.style.visibility = "visible";
      containerRef.current.style.opacity = "1";
      containerRef.current.style.transform = "translateX(0)";
      containerRef.current.style.zIndex = "9999";

      console.log("PDF export: temporarily display the hidden container");

      // wait for the container to be fully displayed
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [297, 167],
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // calculate the size of the image in the PDF, keeping the 16:9 ratio
        const margin = fullScreen ? 0 : 10; // full screen mode no margin, otherwise 10mm margin
        const imageWidth = pageWidth - margin * 2;
        const imageHeight = (imageWidth * 9) / 16;

        // if the image height exceeds the page height, scale by height
        const maxImageHeight = pageHeight - margin * 2;
        const finalImageWidth = imageHeight > maxImageHeight ? (maxImageHeight * 16) / 9 : imageWidth;
        const finalImageHeight = imageHeight > maxImageHeight ? maxImageHeight : imageHeight;

        // calculate the center position
        const x = (pageWidth - finalImageWidth) / 2;
        const y = (pageHeight - finalImageHeight) / 2;

        // loop through all slides
        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];

          // update progress
          onProgress?.(i + 1, slides.length);

          // switch to the current slide
          console.log(`PDF export: switch to the current slide ${i + 1}/${slides.length}`);
          onSlideChange?.(i);

          // wait for DOM update and slide load
          // use shorter wait time, because this is the hidden container
          await new Promise((resolve) => setTimeout(resolve, 300));

          // wait for React state update to complete
          await new Promise((resolve) => {
            // use requestAnimationFrame to ensure DOM update complete
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                resolve(undefined);
              });
            });
          });

          try {
            // verify the container still exists
            if (!containerRef.current) {
              throw new Error("Container element not found");
            }

            console.log(`PDF export: start capturing slide ${i + 1}`);
            // use snapdom to capture the current slide
            const result = (await snapdom(containerRef.current!)) as SnapdomResult;
            const img = await result.toPng();

            // ensure the image decode complete
            if (img.decode) {
              try {
                await img.decode();
              } catch {
                /* ignore */
              }
            }

            // create canvas for image compression
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              throw new Error("Failed to get canvas context");
            }

            // calculate the size of the compressed image (keeping the 16:9 ratio)
            const maxWidth = 1920; // maximum width
            const maxHeight = 1080; // maximum height
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;

            // draw and compress the image
            ctx.drawImage(img, 0, 0, width, height);

            // convert to JPEG format and compress
            const compressedDataUrl = canvas.toDataURL("image/jpeg", imageQuality);

            // add the compressed image to the PDF
            pdf.addImage(compressedDataUrl, "JPEG", x, y, finalImageWidth, finalImageHeight);

            // if not the last page, add a new page
            if (i < slides.length - 1) {
              pdf.addPage();
            }
          } catch (error) {
            console.error(`Failed to capture slide ${i + 1}:`, error);
            // add a blank page
            if (i < slides.length - 1) {
              pdf.addPage();
            }
          }
        }

        // save the PDF
        pdf.save(filename);
      } catch (error) {
        console.error("PDF export failed:", error);
      } finally {
        // restore the original style of the hidden container
        if (containerRef.current) {
          containerRef.current.style.cssText = originalStyle;
          console.log("PDF export: restore the hidden container style");
        }
        isExportingRef.current = false;
      }
    },
    [filename, onProgress, imageQuality, fullScreen]
  );

  return {
    exportToPDF,
    isExporting: isExportingRef.current,
  };
}
