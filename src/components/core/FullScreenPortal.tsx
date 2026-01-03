/** Start: This code should always be kept as is */
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Grid3X3, Download, Loader2, X } from "lucide-react";

import { PPTSlide } from "@/types/ppt";
import { PPTContainer } from "./PPTContainer";
import { ControlBar } from "./ControlBar";
import { useAppStore } from "@/store/useAppStore";

interface FullScreenPortalProps {
  slides: PPTSlide[];
  currentSlideIndex: number;
  onSlideIndexChange: (index: number) => void;
  onSnapshot: (slideId: string, dataUrl: string) => void;
  onExportPDF: () => void;
  isExporting: boolean;
  exportProgress: { current: number; total: number } | null;
  goPrev: () => void;
  goNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  onOpenSlideGrid: () => void;
  onExitFullScreen: () => void;
}

/**
 * Renders the full-screen presentation view inside a React portal when
 * `useAppStore().isFullScreen` is true.
 */
export const FullScreenPortal: React.FC<FullScreenPortalProps> = ({
  slides,
  currentSlideIndex,
  onSlideIndexChange,
  onSnapshot,
  onExportPDF,
  isExporting,
  exportProgress,
  goPrev,
  goNext,
  canGoPrev,
  canGoNext,
  onOpenSlideGrid,
  onExitFullScreen,
}) => {
  const { t } = useTranslation();
  const isFullScreen = useAppStore((s) => s.isFullScreen);

  if (!isFullScreen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="w-full h-full bg-black flex items-center justify-center">
        <PPTContainer
          slides={slides}
          externalCurrentSlideIndex={currentSlideIndex}
          onExternalSlideChange={onSlideIndexChange}
          onSnapshot={onSnapshot}
          onExportPDF={onExportPDF}
          isExporting={isExporting}
          exportProgress={exportProgress}
          enableAnimations
        />
      </div>

      {/* Operation bar */}
      <ControlBar
        position="bottom-left"
        theme="light"
        items={[
          {
            icon: <ChevronLeft className="w-4 h-4" />,
            onClick: goPrev,
            disabled: !canGoPrev,
            title: t("navigation.previousSlide"),
          },
          {
            icon: <ChevronRight className="w-4 h-4" />,
            onClick: goNext,
            disabled: !canGoNext,
            title: t("navigation.nextSlide"),
          },
          {
            icon: <Grid3X3 className="w-4 h-4" />,
            onClick: onOpenSlideGrid,
            title: t("navigation.slideGrid"),
          },
          {
            icon: isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />,
            onClick: onExportPDF,
            disabled: isExporting,
            title: isExporting
              ? exportProgress
                ? t("pdf.exportProgress", { current: exportProgress.current, total: exportProgress.total })
                : t("pdf.exporting")
              : t("pdf.export"),
          },
          {
            icon: <X className="w-4 h-4" />,
            onClick: onExitFullScreen,
            title: t("navigation.exitFullscreen"),
          },
        ]}
      >
        <span className="mx-2 select-none text-sm">
          {currentSlideIndex + 1} / {slides.length}
        </span>
      </ControlBar>
    </div>,
    document.body
  );
};
/* End: This code should always be kept as is */
