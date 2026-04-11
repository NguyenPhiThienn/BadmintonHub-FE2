import { useRef, useEffect } from 'react';

export const useDragScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Don't start dragging if clicking on buttons, inputs, or other interactive elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        return;
      }

      // Only enable drag if there's content to scroll
      if (element.scrollWidth <= element.clientWidth) {
        return;
      }

      isDragging.current = true;
      startX.current = e.pageX - element.offsetLeft;
      scrollLeft.current = element.scrollLeft;
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      updateCursor();
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      updateCursor();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX.current) * 1.5; // Scroll speed multiplier
      element.scrollLeft = scrollLeft.current - walk;
    };

    const updateCursor = () => {
      if (element.scrollWidth > element.clientWidth) {
        element.style.cursor = 'grab';
      } else {
        element.style.cursor = 'default';
      }
      element.style.userSelect = 'auto';
    };

    // Set initial cursor and overflow
    element.style.overflowX = 'auto';
    updateCursor();

    // Update cursor when content changes
    const resizeObserver = new ResizeObserver(() => {
      updateCursor();
    });
    resizeObserver.observe(element);

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mousemove', handleMouseMove);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
    };
  }, []);

  return ref;
};






