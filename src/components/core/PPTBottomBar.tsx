/** Start: This code should always be kept as is */
import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Maximize2, Download, Loader2 } from "lucide-react";
import { ControlBar } from "./ControlBar";
import { UsePDFExportOptions } from "@/types/ppt";

interface PPTBottomBarProps {
  currentIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onFullScreen: () => void;
  onExportPDF?: () => void;
  isExporting?: boolean;
  exportProgress?: { current: number; total: number } | null;

  className?: string;
}

/**
 * Sticky bottom bar showing slide navigation & full-screen control.
 * All items right aligned.
 */
export const PPTBottomBar: React.FC<PPTBottomBarProps> = ({
  currentIndex,
  totalSlides,
  onPrev,
  onNext,
  onFullScreen,
  onExportPDF,
  isExporting,
  exportProgress,

  className,
}) => {
  const { t } = useTranslation();
  const items = [
    {
      icon: <ChevronLeft className="w-4 h-4" />,
      onClick: onPrev,
      disabled: currentIndex === 0,
      title: t("navigation.previousSlide"),
    },
    {
      icon: <ChevronRight className="w-4 h-4" />,
      onClick: onNext,
      disabled: currentIndex === totalSlides - 1,
      title: t("navigation.nextSlide"),
    },
    {
      icon: <Maximize2 className="w-4 h-4" />,
      onClick: onFullScreen,
      title: t("navigation.fullScreen"),
    },
    // PDF export button
    ...(onExportPDF
      ? [
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
        ]
      : []),
  ];

  return (
    <ControlBar items={items} position="bottom" theme="clear" className={className}>
      {/* Page indicator */}
      <span className="text-sm text-gray-600 mr-2 select-none">
        {currentIndex + 1} / {totalSlides}
      </span>
    </ControlBar>
  );
};
/* End: This code should always be kept as is */
