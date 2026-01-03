import { useState, useRef, useCallback } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

import { Slides } from "@/components/core/importSlide";
import { PPTPlatformStage, PPTPlatformStageRef } from "@/components/core/PPTPlatformStage";
import { PPTContainer } from "@/components/core/PPTContainer";
import { PPTBottomBar } from "@/components/core/PPTBottomBar";
import { SlideThumbnailPreloader } from "@/components/core/SlideThumbnailPreloader";
import { usePPTControls } from "@/hooks/usePPTControls";
import { SlideGrid } from "@/components/core/SlideGrid";
import { usePDFExport } from "@/hooks/usePDFExport";
import { FullScreenPortal } from "@/components/core/FullScreenPortal";

import { useAppStore } from "@/store/useAppStore";

export default function Page() {
  const { t } = useTranslation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const isFullScreen = useAppStore((s) => s.isFullScreen);
  const setFullScreen = useAppStore((s) => s.setFullScreen);
  
  // Expose slide navigation for automated testing/overflow detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__navigateToSlide = (index) => {
        if (index >= 0 && index < Slides.length) {
          setCurrentSlideIndex(index);
          return true;
        }
        return false;
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__navigateToSlide;
      }
    };
  }, []);

  // Sync browser fullscreen state with global store
  useEffect(() => {
    const handler = () => setFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [setFullScreen]);

  // Listen for window resize and reset canvas size and position
  useEffect(() => {
    const handleResize = () => {
      // Reset canvas size and position when body size changes
      if (stageRef.current) {
        stageRef.current.reset();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [showSlideGrid, setShowSlideGrid] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const stageRef = useRef<PPTPlatformStageRef>(null);

  const handleSnapshot = useCallback((slideId: string, dataUrl: string) => {
    setThumbnails((prev) => ({ ...prev, [slideId]: dataUrl }));
  }, []);

  // PDF export function
  const containerRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const [exportSlideIndex, setExportSlideIndex] = useState(0);
  // Get filename function, prioritize page title, fallback to timestamp
  const getFilename = () => {
    const title = document.title;
    if (title && title.trim()) {
      let cleanTitle = title.trim()
        // Remove only truly problematic characters for cross-platform compatibility
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Control characters
        .replace(/[<>:"/\\|?*]/g, '-') // Windows disallowed characters
        .replace(/[\r\n\t]/g, '-') // Line breaks, tabs  
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Merge multiple consecutive hyphens into one
        .replace(/^[-_.]+|[-_.]+$/g, ''); // Remove leading/trailing hyphens, dots, underscores
      
      // Check for Windows reserved names
      const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
      if (reservedNames.test(cleanTitle)) {
        cleanTitle = `file-${cleanTitle}`;
      }
      
      // Limit length (Windows filename limit is 255 chars, we use 100 conservatively)
      if (cleanTitle.length > 100) {
        cleanTitle = cleanTitle.substring(0, 100).replace(/[-_.]+$/, '');
      }
      
      // If cleaned title is empty, fallback to timestamp
      if (!cleanTitle) {
        return new Date().getTime().toString();
      }
      
      return cleanTitle;
    }
    return new Date().getTime().toString();
  };
  
  // image mode export
  const { exportToPDF: exportImageToPDF, isExporting: isImageExporting } = usePDFExport({
    filename: `presentation-${getFilename()}.pdf`,
    fullScreen: true,
    imageQuality: 1,
    onProgress: (current, total) => {
      setExportProgress({ current, total });
    },
  });

  const isExporting = isImageExporting;
  const exportToPDF = exportImageToPDF;

  const handleExportPDF = useCallback(async () => {
    if (Slides.length === 0) return;

    // start export, use hidden export container
    await exportToPDF(Slides, exportContainerRef, setExportSlideIndex);

    // reset progress
    setExportProgress(null);
  }, [exportToPDF]);

  // -------- Full screen portal --------
  // local components no longer listen to fullscreenchange; this logic has been migrated to FullScreenProvider.

  // PPT controls hook
  const { goPrev, goNext, canGoPrev, canGoNext } = usePPTControls({
    totalSlides: Slides.length,
    currentIndex: currentSlideIndex,
    onIndexChange: setCurrentSlideIndex,
    isFullScreen,
    onFullScreenChange: setFullScreen,
    showSlideGrid,
    onSlideGridChange: setShowSlideGrid,
  });

  console.log("Index");

  return (
    <SidebarProvider>
      {/* hidden pre-render of slides for thumbnails */}
      <SlideThumbnailPreloader slides={Slides} onSnapshot={handleSnapshot} existing={thumbnails} />
      {/* Hidden container for PDF export */}
      <div
        ref={exportContainerRef}
        className="fixed top-[-99999px] left-[-99999px] w-[1280px] h-[720px] pointer-events-none"
        style={{
          transform: "translateX(-99999px)",
          position: "absolute",
          visibility: "hidden",
          opacity: "0",
          zIndex: "-1",
        }}
      >
        <PPTContainer slides={Slides} externalCurrentSlideIndex={exportSlideIndex} onExternalSlideChange={setExportSlideIndex} className="w-full h-full" enableAnimations={false} />
      </div>

      <AppSidebar slides={Slides} currentIndex={currentSlideIndex} onSlideSelect={setCurrentSlideIndex} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">{t("common.presentation")}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <span className="text-sm font-medium">{Slides[currentSlideIndex].title}</span>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Full-screen button */}
            <Button variant="outline" size="sm" onClick={() => setFullScreen(true)} className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4" /> {t("common.fullscreen")}
            </Button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1  flex-col ">
          {/* Outline removed; now in sidebar */}

          {/* Main Stage */}
          <div className="p-4 flex-1">
            <PPTPlatformStage ref={stageRef}>
              <div ref={containerRef}>
                <PPTContainer
                  slides={Slides}
                  externalCurrentSlideIndex={currentSlideIndex}
                  onExternalSlideChange={setCurrentSlideIndex}
                  className="w-[1280px]"
                  onSnapshot={handleSnapshot}
                  onExportPDF={handleExportPDF}
                  isExporting={isExporting}
                  exportProgress={exportProgress}
                  enableAnimations={false}
                />
              </div>
            </PPTPlatformStage>
          </div>
          {/* Bottom bar */}
          <PPTBottomBar
            currentIndex={currentSlideIndex}
            totalSlides={Slides.length}
            onPrev={goPrev}
            onNext={goNext}
            onFullScreen={() => setFullScreen(true)}
            onExportPDF={handleExportPDF}
            isExporting={isExporting}
            exportProgress={exportProgress}
          />
        </div>

        <FullScreenPortal
          slides={Slides}
          currentSlideIndex={currentSlideIndex}
          onSlideIndexChange={setCurrentSlideIndex}
          onSnapshot={handleSnapshot}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
          exportProgress={exportProgress}
          goPrev={goPrev}
          goNext={goNext}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onOpenSlideGrid={() => setShowSlideGrid(true)}
          onExitFullScreen={() => setFullScreen(false)}
        />

        {/* Slide Grid Modal */}
        {showSlideGrid && (
          <SlideGrid slides={Slides} currentIndex={currentSlideIndex} onSlideSelect={setCurrentSlideIndex} onClose={() => setShowSlideGrid(false)} thumbnails={thumbnails} />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}