"use client";

import { useEffect, useRef, useState } from 'react';

interface InteractiveSVGProps {
  svgData: string;
}

export default function InteractiveSVG({ svgData }: InteractiveSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Function to handle generic element interactions
  const handleElementClick = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementType = element.tagName.toLowerCase();

    // Apply different animations based on element type
    switch (elementType) {
      case 'circle':
        animateCircle(element);
        break;
      case 'rect':
        animateRect(element);
        break;
      case 'path':
        animatePath(element);
        break;
      case 'text':
        animateText(element);
        break;
      default:
        // Generic animation for other elements
        pulseElement(element);
    }
  };

  // Animation functions for different element types
  const animateCircle = (element: HTMLElement) => {
    const originalR = element.getAttribute('r') || '50';
    const originalFill = element.getAttribute('fill') || '#3498db';

    // Pulse animation
    const startTime = Date.now();
    const duration = 500; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Pulse size
      const scale = 1 + 0.2 * Math.sin(progress * Math.PI);
      element.setAttribute('r', (parseFloat(originalR) * scale).toString());

      // Pulse opacity
      element.setAttribute('fill-opacity', (0.7 + 0.3 * Math.sin(progress * Math.PI)).toString());

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset to original values
        element.setAttribute('r', originalR);
        element.setAttribute('fill-opacity', '1');
      }
    };

    requestAnimationFrame(animate);
  };

  const animateRect = (element: HTMLElement) => {
    const originalX = element.getAttribute('x') || '0';
    const originalY = element.getAttribute('y') || '0';

    // Slight movement animation
    const startTime = Date.now();
    const duration = 300; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Move slightly and return
      const offset = 5 * Math.sin(progress * Math.PI);
      element.setAttribute('x', (parseFloat(originalX) + offset).toString());

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset to original position
        element.setAttribute('x', originalX);
      }
    };

    requestAnimationFrame(animate);
  };

  const animatePath = (element: HTMLElement) => {
    const originalStrokeWidth = element.getAttribute('stroke-width') || '2';

    // Pulse stroke width
    const startTime = Date.now();
    const duration = 400; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Pulse stroke width
      const scale = 1 + Math.sin(progress * Math.PI);
      element.setAttribute('stroke-width', (parseFloat(originalStrokeWidth) * scale).toString());

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset to original stroke width
        element.setAttribute('stroke-width', originalStrokeWidth);
      }
    };

    requestAnimationFrame(animate);
  };

  const animateText = (element: HTMLElement) => {
    const originalFontSize = element.getAttribute('font-size') || '16';

    // Pulse font size
    const startTime = Date.now();
    const duration = 300; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Pulse font size
      const scale = 1 + 0.2 * Math.sin(progress * Math.PI);
      element.setAttribute('font-size', (parseFloat(originalFontSize) * scale).toString());

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset to original font size
        element.setAttribute('font-size', originalFontSize);
      }
    };

    requestAnimationFrame(animate);
  };

  const pulseElement = (element: HTMLElement) => {
    // Generic pulse animation for any element
    const originalOpacity = element.getAttribute('opacity') || '1';

    // Pulse opacity
    const startTime = Date.now();
    const duration = 400; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Pulse opacity
      element.setAttribute('opacity', (0.5 + 0.5 * Math.sin(progress * Math.PI)).toString());

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset to original opacity
        element.setAttribute('opacity', originalOpacity);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!containerRef.current) {
      console.error("Container ref is not available");
      return;
    }

    if (!svgData) {
      console.error("No SVG data provided");
      containerRef.current.innerHTML = `<div class="p-4 text-red-500">Error: No SVG data provided</div>`;
      return;
    }

    console.log("Rendering SVG data:", svgData.substring(0, 100) + "...");

    try {
      // Check if the SVG data is valid
      if (!svgData.includes('<svg')) {
        console.error("Invalid SVG data received");
        containerRef.current.innerHTML = `<div class="p-4 text-red-500">Error: Invalid SVG data received</div>`;
        return;
      }

      // Insert SVG into the container
      containerRef.current.innerHTML = svgData;

      // Make sure the SVG is responsive and fully visible
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        // Get the original dimensions from the SVG
        let width = svgElement.getAttribute('width');
        let height = svgElement.getAttribute('height');

        // Ensure viewBox is set for proper scaling
        let viewBox = svgElement.getAttribute('viewBox');
        if (!viewBox) {
          // If no viewBox, create one from width and height
          const viewBoxWidth = width || '600';
          const viewBoxHeight = height || '400';
          viewBox = `0 0 ${viewBoxWidth} ${viewBoxHeight}`;
          svgElement.setAttribute('viewBox', viewBox);
        } else {
          // If viewBox exists but no width/height, extract from viewBox
          if (!width || !height) {
            const viewBoxParts = viewBox.split(' ');
            if (viewBoxParts.length === 4) {
              width = width || viewBoxParts[2];
              height = height || viewBoxParts[3];
            }
          }
        }

        // Calculate aspect ratio
        const numericWidth = parseFloat(width || '600');
        const numericHeight = parseFloat(height || '400');
        const aspectRatio = numericHeight / numericWidth;

        // Log dimensions for debugging
        console.log("SVG dimensions:", {
          width: numericWidth,
          height: numericHeight,
          aspectRatio,
          viewBox
        });

        // Set SVG to be fully responsive
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', 'auto');
        svgElement.style.display = 'block';

        // Apply aspect ratio to container if needed
        if (containerRef.current) {
          // Set a reasonable max-width to prevent SVGs from becoming too large
          containerRef.current.style.maxWidth = '100%';

          // Create a wrapper with proper aspect ratio if needed
          if (aspectRatio > 0 && aspectRatio < 3) { // Limit to reasonable aspect ratios
            // Add padding-bottom technique for maintaining aspect ratio
            containerRef.current.style.position = 'relative';
            containerRef.current.style.width = '100%';
            containerRef.current.style.paddingBottom = `${aspectRatio * 100}%`;

            // Position SVG absolutely within the container
            svgElement.style.position = 'absolute';
            svgElement.style.top = '0';
            svgElement.style.left = '0';
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
          } else {
            // Fallback for SVGs with unusual aspect ratios or when calculation fails
            containerRef.current.style.minHeight = '200px';
            containerRef.current.style.maxHeight = '600px';

            // For very wide SVGs, set a max height
            if (aspectRatio < 0.5 && aspectRatio > 0) {
              containerRef.current.style.maxHeight = '300px';
            }

            // For very tall SVGs, set a reasonable height
            if (aspectRatio > 2) {
              containerRef.current.style.height = '500px';
              svgElement.style.height = '100%';
            }
          }
        }
      }
    } catch (error) {
      console.error("Error rendering SVG:", error);
      if (containerRef.current) {
        // Check if error is an instance of Error before accessing message
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        containerRef.current.innerHTML = `<div class="p-4 text-red-500">Error rendering SVG: ${errorMessage}</div>`;
      }
      return;
    }

    // Add click handlers to all interactive elements
    const addInteractivity = () => {
      // First, try to get elements with data-label attributes (these should be interactive)
      const labeledElements = document.querySelectorAll('.interactive-svg-container svg *[data-label]');

      // Then, get all SVG elements with IDs
      const idElements = document.querySelectorAll('.interactive-svg-container svg *[id]');

      // Combine both sets of elements (using a Set to avoid duplicates)
      const svgElements = new Set([...labeledElements, ...idElements]);

      svgElements.forEach(element => {
        // Generate a temporary ID if the element doesn't have one
        if (!element.id && element instanceof Element) {
          element.id = `interactive-element-${Math.random().toString(36).substring(2, 11)}`;
        }

        // Skip background and title elements
        if (element.id.includes('background') || element.id.includes('title')) return;

        // Add pointer cursor
        (element as HTMLElement).style.cursor = 'pointer';

        // Add click event listener
        element.addEventListener('click', (e) => {
          e.stopPropagation();

          // Handle element-specific animations
          handleElementClick(element.id);

          // For backward compatibility with physics SVG
          if (element.id === 'box') {
            const forceArrow = document.getElementById('force-arrow');
            const accelerationArrow = document.getElementById('acceleration-arrow');
            if (forceArrow && accelerationArrow) {
              animatePath(forceArrow as HTMLElement);
              animatePath(accelerationArrow as HTMLElement);
            }
          } else if (element.id === 'heavy-box') {
            const heavyForceArrow = document.getElementById('heavy-force-arrow');
            const heavyAccelerationArrow = document.getElementById('heavy-acceleration-arrow');
            if (heavyForceArrow && heavyAccelerationArrow) {
              animatePath(heavyForceArrow as HTMLElement);
              animatePath(heavyAccelerationArrow as HTMLElement);
            }
          }

          // Show tooltip if data-label exists
          const label = element.getAttribute('data-label');
          if (label) {
            const rect = (element as Element).getBoundingClientRect();
            const containerRect = containerRef.current!.getBoundingClientRect();
            const svgRect = containerRef.current!.querySelector('svg')!.getBoundingClientRect();

            // Calculate position relative to the SVG and container
            setTooltipText(label);
            setTooltipPosition({
              x: rect.left - containerRect.left + rect.width / 2,
              y: rect.top - containerRect.top - 10
            });

            // Ensure tooltip is visible within the container
            if (containerRef.current!.style.position === 'relative') {
              // For aspect ratio preserved SVGs, adjust tooltip position
              const svg = containerRef.current!.querySelector('svg');
              if (svg) {
                const svgScale = svgRect.width / parseFloat(svg.getAttribute('viewBox')?.split(' ')[2] || '600');
                setTooltipPosition({
                  x: (rect.left - svgRect.left + rect.width / 2),
                  y: (rect.top - svgRect.top - 10)
                });
              }
            }

            // Auto-hide tooltip after 3 seconds
            setTimeout(() => setTooltipText(null), 3000);
          }
        });
      });
    };

    // Add interactivity after a short delay to ensure SVG is fully loaded
    setTimeout(addInteractivity, 100);

    // Cleanup function
    return () => {
      // Clean up both ID elements and data-label elements
      const idElements = document.querySelectorAll('.interactive-svg-container svg *[id]');
      const labeledElements = document.querySelectorAll('.interactive-svg-container svg *[data-label]');

      // Combine both sets
      const allElements = new Set([...idElements, ...labeledElements]);

      allElements.forEach(element => {
        if (element instanceof Element) {
          element.removeEventListener('click', () => {});
        }
      });
    };
  }, [svgData]);

  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-gray-600 relative">

      <div
        ref={containerRef}
        className="w-full max-w-full interactive-svg-container flex items-center justify-center"
      />

      {/* Tooltip */}
      {tooltipText && (
        <div
          className="absolute bg-black/80 text-white p-2 rounded-md z-10 max-w-[250px] text-sm"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltipText}
        </div>
      )}

      <div className="bg-gray-800/70 text-xs text-gray-400 p-1.5 text-center">
        Tap elements to explore
      </div>
    </div>
  );
}
