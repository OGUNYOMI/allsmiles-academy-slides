export interface SnapdomResult {
  /** Return DOM capture as HTMLImageElement in PNG format */
  toPng: () => Promise<HTMLImageElement>;
  // Additional output methods can be typed later if needed
}
