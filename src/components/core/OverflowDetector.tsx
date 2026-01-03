import React, { useEffect, useRef, useState } from 'react';

interface OverflowError {
  type: 'VERTICAL_OVERFLOW' | 'BOTTOM_MARGIN_VIOLATION' | 'BODY_OVERFLOW' | 'HORIZONTAL_OVERFLOW' | 'TOP_MARGIN_VIOLATION' | 'TEXT_TRUNCATION' | 'HEIGHT_ANALYSIS';
  message: string;
  element?: string;
  elementPath?: string; // CSS selector path for external tools
  actual: number;
  expected?: number;
  overflowAmount?: number; // Explicit overflow in pixels for calculation
  heightBreakdown?: ElementHeightInfo[]; // Detailed height analysis for HEIGHT_ANALYSIS type
}

interface ElementHeightInfo {
  element: string;
  elementPath: string;
  height: number;
  top: number;
  bottom: number;
  percentOfSlide: number; // Percentage of slide height
  isCard?: boolean; // Whether this element is a card/content block
}

interface CardBlockInfo {
  totalCards: number;
  cardElements: ElementHeightInfo[];
  averageCardHeight: number;
  totalCardsHeight: number;
}

interface OverflowDetectorProps {
  children: React.ReactNode;
  slideWidth?: number;
  slideHeight?: number;
  minBottomMargin?: number; // in pixels
  minTopMargin?: number;
  onOverflowDetected?: (errors: OverflowError[]) => void;
  enableConsoleWarnings?: boolean;
  /** Export errors as JSON for external tooling */
  onExportJSON?: (json: string) => void;
  /** CSS class to force ignore elements (e.g., 'od-ignore' for decorations) */
  ignoreClass?: string;
  /** CSS class to force check elements (e.g., 'od-block' for content) */
  forceCheckClass?: string;
  /** Use ResizeObserver for performance optimization */
  useResizeObserver?: boolean;
  /** Tolerance for overflow detection in pixels */
  overflowTolerance?: { 
    vertical?: number;      // default: 10
    horizontal?: number;    // default: 5
    margin?: number;        // default: 5
  };
  /** Debounce time for ResizeObserver in ms (default: 150) */
  debounceMs?: number;
  /** Container size mismatch tolerance in pixels (default: 10) */
  containerMismatchTolerance?: number;
  /** Enable detailed height analysis (prioritize vertical overflow detection) */
  enableHeightAnalysis?: boolean;
  /** 
   * Detection mode: 'simple' (only core checks) or 'full' (all checks)
   * 
   * Simple mode (default, recommended):
   *   - HEIGHT_ANALYSIS (height stats + card blocks)
   *   - BODY_OVERFLOW (overall overflow)
   *   - VERTICAL_OVERFLOW (element-level overflow)
   * 
   * Full mode:
   *   - All simple mode checks
   *   - HORIZONTAL_OVERFLOW
   *   - BOTTOM_MARGIN_VIOLATION
   *   - TOP_MARGIN_VIOLATION
   *   - TEXT_TRUNCATION
   */
  detectionMode?: 'simple' | 'full';
}

/**
 * OverflowDetector - Detects content overflow issues
 * 
 * This component measures rendered content and reports violations:
 * - Vertical overflow (content exceeds slide height)
 * - Bottom margin violations (elements too close to bottom edge)
 * - Body container overflow (scrollHeight > clientHeight)
 * - Horizontal overflow (content exceeds slide width)
 */
/**
 * Generate CSS selector path for an element
 */
const getElementPath = (element: Element): string => {
  const path: string[] = [];
  let current: Element | null = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break; // ID is unique, stop here
    }
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        selector += `.${classes.join('.')}`;
      }
    }
    
    // Add nth-child if needed for uniqueness
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children);
      const index = siblings.indexOf(current);
      if (siblings.filter(s => s.tagName === current.tagName).length > 1) {
        selector += `:nth-child(${index + 1})`;
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
};

export const OverflowDetector: React.FC<OverflowDetectorProps> = ({
  children,
  slideWidth = 1280,
  slideHeight = 720,
  minBottomMargin = 36, // 0.5 inches at 96 DPI (0.5 * 72pt = 36px at 96dpi)
  minTopMargin = 36,
  onOverflowDetected,
  enableConsoleWarnings = true,
  onExportJSON,
  ignoreClass = 'od-ignore',
  forceCheckClass = 'od-block',
  useResizeObserver = false,
  overflowTolerance = { vertical: 10, horizontal: 5, margin: 5 },
  debounceMs = 150,
  containerMismatchTolerance = 10,
  enableHeightAnalysis = true,
  detectionMode = 'simple', // Default to simple mode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<OverflowError[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Extract tolerance values with defaults
  const verticalTolerance = overflowTolerance.vertical ?? 10;
  const horizontalTolerance = overflowTolerance.horizontal ?? 5;
  const marginTolerance = overflowTolerance.margin ?? 5;

  useEffect(() => {
    const detectOverflow = () => {
      if (!containerRef.current) return;

      const detectedErrors: OverflowError[] = [];
      const container = containerRef.current;

      // Verify container size matches expected slide dimensions
      const containerBounds = container.getBoundingClientRect();
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;
      
      // Log container info for debugging
      if (enableConsoleWarnings) {
        console.log(`[OverflowDetector] Container size: ${containerWidth}x${containerHeight}px (expected: ${slideWidth}x${slideHeight}px)`);
      }
      
      // If container size doesn't match slide dimensions, skip detection
      // This prevents false positives from nested containers
      // Using stricter tolerance (default: 10px) for more accurate detection
      if (Math.abs(containerHeight - slideHeight) > containerMismatchTolerance || 
          Math.abs(containerWidth - slideWidth) > containerMismatchTolerance) {
        if (enableConsoleWarnings) {
          console.warn(`[OverflowDetector] Container size mismatch - skipping detection`);
        }
        return;
      }

      // 1. Calculate actual content height (not scrollHeight, which fails with overflow-hidden)
      // Strategy: Find the maximum bottom position of all child elements
      // Also consider margins and transforms for accurate measurement
      const allElements = Array.from(container.querySelectorAll('*'));
      let maxBottom = 0;
      let minTop = Infinity;
      
      // 📊 NEW: Collect height information for all content elements
      const heightInfoList: ElementHeightInfo[] = [];
      
      allElements.forEach((el: Element) => {
        const rect = el.getBoundingClientRect();
        const elementContainerRect = container.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        
        // Consider margins for more accurate bounds
        const marginBottom = parseFloat(computed.marginBottom) || 0;
        const marginTop = parseFloat(computed.marginTop) || 0;
        
        let relativeBottom = rect.bottom - elementContainerRect.top + marginBottom;
        let relativeTop = rect.top - elementContainerRect.top - marginTop;
        
        // Handle transforms (if element is rotated/scaled, use transform origin)
        const transform = computed.transform;
        if (transform && transform !== 'none') {
          // For transformed elements, we rely on getBoundingClientRect which already accounts for transforms
          // But we add a small buffer for potential edge cases
          relativeBottom += 2;
          relativeTop -= 2;
        }
        
        if (rect.width > 0 && rect.height > 0) {
          maxBottom = Math.max(maxBottom, relativeBottom);
          minTop = Math.min(minTop, relativeTop);
          
          // 📊 NEW: Collect height info for analysis (only for visible elements)
          if (enableHeightAnalysis && 
              computed.visibility !== 'hidden' && 
              computed.display !== 'none' && 
              computed.opacity !== '0') {
            const elementHeight = rect.height + marginTop + marginBottom;
            const elementId = 
              el.id || 
              (el.className && typeof el.className === 'string' ? el.className.split(' ').slice(0, 2).join(' ') : '') ||
              el.tagName.toLowerCase();
            const elementText = el.textContent?.substring(0, 30) || '';
            
            // 🎯 Detect if element is a card/content block
            const className = (el.className || '').toString().toLowerCase();
            const isCard = 
              className.includes('card') ||
              className.includes('box') ||
              className.includes('panel') ||
              className.includes('container') ||
              // Check for visual styling (border, background, shadow, padding)
              (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
               ((computed.borderWidth && parseFloat(computed.borderWidth) > 0) ||
                (computed.boxShadow && computed.boxShadow !== 'none') ||
                (computed.padding && parseFloat(computed.padding) > 12)));
            
            heightInfoList.push({
              element: `${elementId}${elementText ? ` ("${elementText}...")` : ''}`,
              elementPath: getElementPath(el),
              height: elementHeight,
              top: relativeTop,
              bottom: relativeBottom,
              percentOfSlide: (elementHeight / slideHeight) * 100,
              isCard: isCard,
            });
          }
        }
      });
      
      const actualContentHeight = maxBottom - Math.max(0, minTop);
      const clientHeight = container.clientHeight;
      
      // Check if actual content exceeds container (works even with overflow-hidden)
      if (actualContentHeight > clientHeight + verticalTolerance) {
        const overflowAmount = actualContentHeight - clientHeight;
        detectedErrors.push({
          type: 'BODY_OVERFLOW',
          message: `Content extends beyond container by ${overflowAmount.toFixed(0)}px (actualHeight: ${actualContentHeight.toFixed(0)}px > containerHeight: ${clientHeight}px)`,
          actual: actualContentHeight,
          expected: clientHeight,
          overflowAmount: overflowAmount, // Explicit overflow in pixels
        });
      }
      
      // 🔍 NEW: Check for compressed content (scrollHeight > clientHeight)
      // This detects when flex layout compresses content that would otherwise overflow
      const section = container.querySelector('section');
      if (section) {
        const sectionScrollHeight = section.scrollHeight;
        const sectionClientHeight = section.clientHeight;
        
        if (sectionScrollHeight > sectionClientHeight + verticalTolerance) {
          const compressionAmount = sectionScrollHeight - sectionClientHeight;
          detectedErrors.push({
            type: 'BODY_OVERFLOW',
            message: `Content is compressed by flex layout: ${compressionAmount.toFixed(0)}px hidden (scrollHeight: ${sectionScrollHeight}px > clientHeight: ${sectionClientHeight}px). Content needs ${sectionScrollHeight}px but only ${sectionClientHeight}px available.`,
            actual: sectionScrollHeight,
            expected: sectionClientHeight,
            overflowAmount: compressionAmount,
          });
          
          if (enableConsoleWarnings) {
            console.warn(`⚠️ [OverflowDetector] Content compression detected! Section scrollHeight (${sectionScrollHeight}px) > clientHeight (${sectionClientHeight}px)`);
            console.warn(`   This usually means flex layout is compressing content. Consider reducing content or adjusting layout.`);
          }
        }
      }
      
      // 📊 NEW: Add height analysis summary
      if (enableHeightAnalysis && heightInfoList.length > 0) {
        // Sort by height (descending) to identify the biggest elements
        const sortedByHeight = [...heightInfoList].sort((a, b) => b.height - a.height);
        const top10Largest = sortedByHeight.slice(0, 10);
        
        // Calculate total occupied height (sum of all elements, may have overlap)
        const totalHeight = heightInfoList.reduce((sum, info) => sum + info.height, 0);
        
        // Find elements that extend beyond slide boundaries
        const elementsExceedingHeight = heightInfoList.filter(info => info.bottom > slideHeight);
        
        // 🎯 NEW: Analyze card blocks
        const cardBlocks = heightInfoList.filter(info => info.isCard);
        const cardBlockInfo: CardBlockInfo = {
          totalCards: cardBlocks.length,
          cardElements: cardBlocks.sort((a, b) => b.height - a.height),
          averageCardHeight: cardBlocks.length > 0 
            ? cardBlocks.reduce((sum, card) => sum + card.height, 0) / cardBlocks.length 
            : 0,
          totalCardsHeight: cardBlocks.reduce((sum, card) => sum + card.height, 0),
        };
        
        detectedErrors.push({
          type: 'HEIGHT_ANALYSIS',
          message: `Height Analysis: ${heightInfoList.length} elements analyzed, total height: ${totalHeight.toFixed(0)}px (${(totalHeight/slideHeight*100).toFixed(1)}% of slide), actual content height: ${actualContentHeight.toFixed(0)}px (${(actualContentHeight/slideHeight*100).toFixed(1)}% of slide)`,
          actual: actualContentHeight,
          expected: slideHeight,
          overflowAmount: Math.max(0, actualContentHeight - slideHeight),
          heightBreakdown: top10Largest,
        });
        
        // Log detailed height analysis to console
        if (enableConsoleWarnings) {
          console.group(`📊 Height Analysis (${heightInfoList.length} elements)`);
          console.log(`Slide height: ${slideHeight}px`);
          console.log(`Actual content height: ${actualContentHeight.toFixed(0)}px (${(actualContentHeight/slideHeight*100).toFixed(1)}% of slide)`);
          console.log(`Total elements height (may overlap): ${totalHeight.toFixed(0)}px`);
          console.log(`Elements exceeding slide height: ${elementsExceedingHeight.length}`);
          
          // 🎯 NEW: Display card block analysis
          if (cardBlockInfo.totalCards > 0) {
            console.log('\n🎴 Card/Block Analysis:');
            console.log(`Total card blocks found: ${cardBlockInfo.totalCards}`);
            console.log(`Total cards height: ${cardBlockInfo.totalCardsHeight.toFixed(0)}px (${(cardBlockInfo.totalCardsHeight/slideHeight*100).toFixed(1)}% of slide)`);
            console.log(`Average card height: ${cardBlockInfo.averageCardHeight.toFixed(0)}px`);
            
            if (actualContentHeight > slideHeight) {
              const overflowPx = actualContentHeight - slideHeight;
              const cardsToRemove = Math.ceil(overflowPx / cardBlockInfo.averageCardHeight);
              console.log(`\n💡 Recommendation: Content overflows by ${overflowPx.toFixed(0)}px`);
              console.log(`   → Consider removing ${cardsToRemove} card block(s) to fix overflow`);
              console.log(`   → Current: ${cardBlockInfo.totalCards} cards, suggest: ${Math.max(1, cardBlockInfo.totalCards - cardsToRemove)} cards`);
            }
            
            console.log('\nCard blocks (sorted by height):');
            cardBlockInfo.cardElements.slice(0, 5).forEach((card, index) => {
              console.log(`${index + 1}. ${card.element}`);
              console.log(`   Height: ${card.height.toFixed(0)}px (${card.percentOfSlide.toFixed(1)}% of slide)`);
              console.log(`   Selector: ${card.elementPath}`);
            });
          }
          
          console.log('\nTop 10 Largest Elements:');
          top10Largest.forEach((info, index) => {
            const cardLabel = info.isCard ? ' [CARD]' : '';
            console.log(`${index + 1}. ${info.element}${cardLabel}`);
            console.log(`   Height: ${info.height.toFixed(0)}px (${info.percentOfSlide.toFixed(1)}% of slide)`);
            console.log(`   Position: top=${info.top.toFixed(0)}px, bottom=${info.bottom.toFixed(0)}px`);
            console.log(`   Selector: ${info.elementPath}`);
          });
          console.groupEnd();
        }
      }

      // 2. Measure content elements only (following html2pptx strategy)
      // Strategy: Only check "leaf" content elements, not layout containers
      const elements = Array.from(container.querySelectorAll('*')).filter((el: Element) => {
        const tag = el.tagName.toLowerCase();
        const className = (el.className || '').toString().toLowerCase();
        
        // 🎯 Priority 1: Check whitelist/blacklist classes first
        if (ignoreClass && el.classList.contains(ignoreClass)) {
          return false; // Explicitly ignored (decorations, backgrounds, particles)
        }
        
        if (forceCheckClass && el.classList.contains(forceCheckClass)) {
          return true; // Explicitly required (content blocks, cards, charts)
        }
        
        // Exclude the outermost section container
        if (tag === 'section' && el.parentElement === container) {
          return false;
        }
        
        // Exclude the overflow warning overlay
        const text = el.textContent || '';
        if (text.includes('Overflow Issues') || text.includes('⚠️')) {
          return false;
        }
        
        // 1. Always check text elements (primary content)
        const isTextElement = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag);
        if (isTextElement) {
          return true;
        }
        
        // 2. Check images, but exclude background images
        if (tag === 'img' || tag === 'svg') {
          const computed = window.getComputedStyle(el);
          const className = (el.className || '').toString().toLowerCase();
          
          // Exclude background images
          const isBackgroundByClass = className.includes('bg-') || 
                                      className.includes('background') || 
                                      className.includes('hero-bg') ||
                                      className.includes('cover-bg');
          const isPositionedBackground = computed.position === 'absolute' || 
                                         computed.position === 'fixed';
          const zIndex = parseInt(computed.zIndex);
          const isBackgroundLayer = !isNaN(zIndex) && zIndex < 0;
          
          if (isBackgroundByClass || isPositionedBackground || isBackgroundLayer) {
            return false;
          }
          return true;
        }
        
        // 3. For DIVs: only check "content cards" (visible boxes with styling)
        if (tag === 'div') {
          const computed = window.getComputedStyle(el);
          const className = (el.className || '').toString().toLowerCase();
          
          // Must have a class (not just layout divs)
          if (!el.className || typeof el.className !== 'string' || el.className.length === 0) {
            return false;
          }
          
          // Check if it's a "content card" by looking for visual styling
          const hasBg = computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)';
          const hasBorder = computed.borderWidth && parseFloat(computed.borderWidth) > 0;
          const hasShadow = computed.boxShadow && computed.boxShadow !== 'none';
          const hasPadding = computed.padding && parseFloat(computed.padding) > 8;
          const hasRoundedCorners = computed.borderRadius && parseFloat(computed.borderRadius) > 0;
          
          // It's a content card if it has 2+ visual features
          const visualFeatures = [hasBg, hasBorder, hasShadow, hasPadding, hasRoundedCorners].filter(Boolean).length;
          
          // Also check by common class patterns
          const isCardByClass = className.includes('card') || 
                               className.includes('box') ||
                               className.includes('panel') ||
                               className.includes('container');
          
          return visualFeatures >= 2 || isCardByClass;
        }
        
        return false;
      });

      const containerRect = container.getBoundingClientRect();
      const violationMap = new Map<string, OverflowError>(); // De-duplicate by elementPath

      elements.forEach((element: Element) => {
        const rect = element.getBoundingClientRect();
        const computed = window.getComputedStyle(element);
        
        // Skip elements with no size
        if (rect.width === 0 || rect.height === 0) return;
        
        // Skip invisible elements (visibility check)
        if (computed.visibility === 'hidden' || computed.display === 'none' || computed.opacity === '0') {
          return;
        }

        const relativeBottom = rect.bottom - containerRect.top;
        const relativeTop = rect.top - containerRect.top;
        const relativeRight = rect.right - containerRect.left;

        // Get element identifier
        const elementId = 
          element.id || 
          (element.className && typeof element.className === 'string' ? element.className.split(' ').slice(0, 3).join(' ') : '') ||
          element.tagName.toLowerCase();
        const elementText = element.textContent?.substring(0, 40) || '';
        const elementInfo = `${elementId} ("${elementText}${elementText.length >= 40 ? '...' : ''}")`;
        const elementPath = getElementPath(element);

        // 3. Check vertical overflow (with configurable tolerance)
        if (relativeBottom > slideHeight + verticalTolerance) {
          const overflowPx = relativeBottom - slideHeight;
          const overflowPt = (overflowPx * 72) / 96;
          const key = `VERTICAL_OVERFLOW-${elementPath}`;
          if (!violationMap.has(key)) {
            violationMap.set(key, {
              type: 'VERTICAL_OVERFLOW',
              message: `Element overflows slide by ${overflowPt.toFixed(1)}pt (${overflowPx.toFixed(0)}px) vertically`,
              element: elementInfo,
              elementPath,
              actual: relativeBottom,
              expected: slideHeight,
              overflowAmount: overflowPx, // Add explicit overflow in pixels for easy calculation
            });
          }
        }

        // 4. Check bottom margin violation (FULL MODE ONLY)
        const tag = element.tagName.toLowerCase();
        const isTextElement = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag);
        
        if (detectionMode === 'full' && isTextElement) {
          const fontSize = parseFloat(computed.fontSize) * 0.75; // Convert px to pt
          
          // Only check text with fontSize > 12pt (like html2pptx)
          if (fontSize > 12) {
            const distanceFromBottom = slideHeight - relativeBottom;
            // Allow configurable tolerance
            if (distanceFromBottom >= -marginTolerance && distanceFromBottom < minBottomMargin) {
              const shortfallPx = minBottomMargin - distanceFromBottom;
              const distanceInches = (distanceFromBottom / 96);
              const minInches = (minBottomMargin / 96);
              const key = `BOTTOM_MARGIN_VIOLATION-${elementPath}`;
              if (!violationMap.has(key)) {
                violationMap.set(key, {
                  type: 'BOTTOM_MARGIN_VIOLATION',
                  message: `Text ends too close to bottom (${distanceInches.toFixed(2)}" from bottom, need ${minInches.toFixed(2)}")`,
                  element: elementInfo,
                  elementPath,
                  actual: distanceFromBottom,
                  expected: minBottomMargin,
                  overflowAmount: shortfallPx, // How many pixels short of minimum margin
                });
              }
            }
          }
        }

        // 5. Check top margin violation (FULL MODE ONLY)
        if (detectionMode === 'full' && isTextElement) {
          // Allow configurable tolerance
          if (relativeTop >= -marginTolerance && relativeTop < minTopMargin) {
            const shortfallPx = minTopMargin - relativeTop;
            const distanceInches = (relativeTop / 96);
            const minInches = (minTopMargin / 96);
            const key = `TOP_MARGIN_VIOLATION-${elementPath}`;
            if (!violationMap.has(key)) {
              violationMap.set(key, {
                type: 'TOP_MARGIN_VIOLATION',
                message: `Text starts too close to top (${distanceInches.toFixed(2)}" from top, need ${minInches.toFixed(2)}")`,
                element: elementInfo,
                elementPath,
                actual: relativeTop,
                expected: minTopMargin,
                overflowAmount: shortfallPx, // How many pixels short of minimum margin
              });
            }
          }
        }

        // 6. Check horizontal overflow (FULL MODE ONLY)
        if (detectionMode === 'full' && relativeRight > slideWidth + horizontalTolerance) {
          const overflowPx = relativeRight - slideWidth;
          const overflowPt = (overflowPx * 72) / 96;
          const key = `HORIZONTAL_OVERFLOW-${elementPath}`;
          if (!violationMap.has(key)) {
            violationMap.set(key, {
              type: 'HORIZONTAL_OVERFLOW',
              message: `Element overflows slide by ${overflowPt.toFixed(1)}pt (${overflowPx.toFixed(0)}px) horizontally`,
              element: elementInfo,
              elementPath,
              actual: relativeRight,
              expected: slideWidth,
              overflowAmount: overflowPx, // Explicit overflow in pixels
            });
          }
        }

        // 7. Check text truncation (FULL MODE ONLY)
        if (detectionMode === 'full' && (isTextElement || element.tagName.toLowerCase() === 'span')) {
          const el = element as HTMLElement;
          // Check if text is being truncated with ellipsis
          if (el.scrollWidth > el.clientWidth + 2) { // 2px tolerance
            const overflowWidth = el.scrollWidth - el.clientWidth;
            const key = `TEXT_TRUNCATION-${elementPath}`;
            if (!violationMap.has(key)) {
              violationMap.set(key, {
                type: 'TEXT_TRUNCATION',
                message: `Text is truncated (scrollWidth: ${el.scrollWidth}px > clientWidth: ${el.clientWidth}px, overflow: ${overflowWidth}px)`,
                element: elementInfo,
                elementPath,
                actual: el.scrollWidth,
                expected: el.clientWidth,
                overflowAmount: overflowWidth, // How many pixels of text are hidden
              });
            }
          }
        }
      });

      // Convert map to array
      detectedErrors.push(...Array.from(violationMap.values()));

      // 8. Check for parent container overflow (columns/grids with hidden overflow)
      const potentialParents = Array.from(container.querySelectorAll('.flex.flex-col, .grid, [class*="grid-cols"]')).filter((parent: Element) => {
        const computed = window.getComputedStyle(parent);
        return computed.visibility !== 'hidden' && computed.display !== 'none';
      });
      
      potentialParents.forEach((parent: Element) => {
        const parentElement = parent as HTMLElement;
        const parentScrollHeight = parentElement.scrollHeight;
        const parentClientHeight = parentElement.clientHeight;
        const parentComputed = window.getComputedStyle(parentElement);
        const parentOverflow = parentComputed.overflow;
        const parentOverflowY = parentComputed.overflowY;
        
        // Check if parent has content overflow with hidden/clip overflow
        if (parentScrollHeight > parentClientHeight + 10 && 
            (parentOverflow === 'hidden' || parentOverflowY === 'hidden' || 
             parentOverflow === 'clip' || parentOverflowY === 'clip')) {
          const hiddenContent = parentScrollHeight - parentClientHeight;
          const parentPath = getElementPath(parent);
          const parentClasses = parentElement.className.substring(0, 60);
          const key = `PARENT_CONTAINER_OVERFLOW-${parentPath}`;
          
          if (!violationMap.has(key)) {
            detectedErrors.push({
              type: 'CONTAINER_OVERFLOW',
              message: `Container has hidden overflow: ${hiddenContent.toFixed(0)}px of content clipped by parent (scrollHeight: ${parentScrollHeight}px > clientHeight: ${parentClientHeight}px, overflow: ${parentOverflowY || parentOverflow})`,
              element: `Container: "${parentClasses}..."`,
              elementPath: parentPath,
              actual: parentScrollHeight,
              expected: parentClientHeight,
              overflowAmount: hiddenContent,
            });
            
            if (enableConsoleWarnings) {
              console.warn(`⚠️ [OverflowDetector] Parent container clipping content by ${hiddenContent.toFixed(0)}px`);
              console.warn(`   Container: ${parentClasses}`);
              console.warn(`   Overflow style: ${parentOverflowY || parentOverflow}`);
            }
          }
        }
      });

      // 9. Check for card content clipping (NEW)
      const cards = Array.from(container.querySelectorAll('.bg-white.p-6, .bg-white.p-8, [class*="card"]')).filter((card: Element) => {
        const computed = window.getComputedStyle(card);
        return computed.visibility !== 'hidden' && computed.display !== 'none';
      });
      
      cards.forEach((card: Element, cardIdx: number) => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const cardScrollHeight = cardElement.scrollHeight;
        const cardClientHeight = cardElement.clientHeight;
        const actualRenderHeight = cardRect.height;
        
        const cardText = card.textContent?.substring(0, 50).replace(/\s+/g, ' ') || '';
        const cardPath = getElementPath(card);
        
        // Check 1: DISABLED - This check causes false positives with flex-1 layouts
        // When using flex-1, cards intentionally share available space equally
        // This is normal responsive design, not a bug
        // Only Check 2 (scrollHeight > clientHeight) indicates real content clipping
        /*
        if (actualRenderHeight < cardClientHeight - 10) {
          const compressionAmount = cardClientHeight - actualRenderHeight;
          const key = `CARD_COMPRESSED-${cardPath}`;
          
          if (!violationMap.has(key)) {
            detectedErrors.push({
              type: 'VERTICAL_OVERFLOW',
              message: `Card is compressed by flex layout: ${compressionAmount.toFixed(0)}px squeezed (needs ${cardClientHeight.toFixed(0)}px but only ${actualRenderHeight.toFixed(0)}px available)`,
              element: `Card ${cardIdx + 1}: "${cardText}..."`,
              elementPath: cardPath,
              actual: cardClientHeight,
              expected: actualRenderHeight,
              overflowAmount: compressionAmount,
            });
            
            if (enableConsoleWarnings) {
              console.warn(`⚠️ [OverflowDetector] Card ${cardIdx + 1} compressed by ${compressionAmount.toFixed(0)}px`);
              console.warn(`   Needs: ${cardClientHeight}px, Has: ${actualRenderHeight}px`);
              console.warn(`   Card text: "${cardText}..."`);
            }
          }
        }
        */
        
        // Check 2: Card content is clipped (scrollHeight > clientHeight)
        if (cardScrollHeight > cardClientHeight + 5) {
          const hiddenContent = cardScrollHeight - cardClientHeight;
          const key = `CARD_CONTENT_CLIPPED-${cardPath}`;
          
          if (!violationMap.has(key)) {
            detectedErrors.push({
              type: 'VERTICAL_OVERFLOW',
              message: `Card content is clipped: ${hiddenContent.toFixed(0)}px of content hidden inside card (scrollHeight: ${cardScrollHeight}px > clientHeight: ${cardClientHeight}px)`,
              element: `Card ${cardIdx + 1}: "${cardText}..."`,
              elementPath: cardPath,
              actual: cardScrollHeight,
              expected: cardClientHeight,
              overflowAmount: hiddenContent,
            });
            
            if (enableConsoleWarnings) {
              console.warn(`⚠️ [OverflowDetector] Card ${cardIdx + 1} content clipped by ${hiddenContent.toFixed(0)}px`);
              console.warn(`   Card text: "${cardText}..."`);
            }
          }
        }
      });

      // Update state and trigger callback
      setErrors(detectedErrors);
      
      if (detectedErrors.length > 0) {
        if (enableConsoleWarnings) {
          console.group(`🚨 Overflow Detection: ${detectedErrors.length} issue(s) found`);
          console.warn(`Slide dimensions: ${slideWidth}×${slideHeight}px`);
          console.warn(`Content dimensions: ${actualContentHeight}×${container.scrollWidth}px (actualHeight×scrollWidth)`);
          console.warn(`Min margins: top=${minTopMargin}px, bottom=${minBottomMargin}px`);
          detectedErrors.forEach((error, index) => {
            console.warn(`${index + 1}. [${error.type}] ${error.message}`);
            if (error.element) {
              console.warn(`   Element: ${error.element}`);
            }
            if (error.elementPath) {
              console.warn(`   Selector: ${error.elementPath}`);
            }
          });
          console.groupEnd();
        }
        
        onOverflowDetected?.(detectedErrors);
        
        // 📤 Export JSON if callback provided
        if (onExportJSON) {
          const exportData = {
            timestamp: new Date().toISOString(),
            slideConfig: {
              width: slideWidth,
              height: slideHeight,
              minTopMargin,
              minBottomMargin,
            },
            violations: detectedErrors.map((error) => ({
              type: error.type,
              elementPath: error.elementPath,
              elementInfo: error.element,
              actual: error.actual,
              expected: error.expected,
              overflowAmount: error.overflowAmount,
              message: error.message,
              heightBreakdown: error.heightBreakdown, // Include height analysis data
            })),
          };
          onExportJSON(JSON.stringify(exportData, null, 2));
        }
      } else if (enableConsoleWarnings) {
        console.log(`✅ Overflow Detection: No issues found (${slideWidth}×${slideHeight}px)`);
      }
    };

    // Helper function to check if all images are loaded
    const checkImagesLoaded = (): boolean => {
      if (!containerRef.current) return true;
      const images = containerRef.current.querySelectorAll('img');
      return Array.from(images).every((img) => {
        const imgElement = img as HTMLImageElement;
        return imgElement.complete && imgElement.naturalHeight !== 0;
      });
    };

    // Wait for images to load before detecting
    const detectWithImageCheck = () => {
      if (!checkImagesLoaded()) {
        if (enableConsoleWarnings) {
          console.log('[OverflowDetector] Waiting for images to load...');
        }
        // Wait a bit and try again
        setTimeout(detectWithImageCheck, 100);
        return;
      }
      detectOverflow();
    };

    // 🚀 Performance optimization: Use ResizeObserver + requestAnimationFrame
    if (useResizeObserver && containerRef.current) {
      // Cleanup previous observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      
      resizeObserverRef.current = new ResizeObserver(() => {
        // Cancel previous pending frame
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        
        // Debounce rapid resize events (configurable)
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
          // Schedule detection in next frame with image check
          rafIdRef.current = requestAnimationFrame(() => {
            detectWithImageCheck();
            rafIdRef.current = null;
          });
        }, debounceMs);
      });
      
      resizeObserverRef.current.observe(containerRef.current);
      
      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
      };
    } else {
      // Fallback: Run detection after render with image check
      const timer = setTimeout(detectWithImageCheck, 100);
      return () => clearTimeout(timer);
    }
  }, [children, slideWidth, slideHeight, minBottomMargin, minTopMargin, onOverflowDetected, enableConsoleWarnings, onExportJSON, ignoreClass, forceCheckClass, useResizeObserver, verticalTolerance, horizontalTolerance, marginTolerance, debounceMs, containerMismatchTolerance, enableHeightAnalysis, detectionMode]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
      }}
    >
      {children}
      
      {/* Visual overlay for development - DISABLED (use console warnings and JSON export instead)
      
      To enable visual overlay in development, uncomment this block:
      
      {import.meta.env.DEV && errors.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'rgba(220, 38, 38, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderBottomLeftRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          ⚠️ {errors.length} Overflow Issue{errors.length !== 1 ? 's' : ''}
        </div>
      )}
      */}
    </div>
  );
};

