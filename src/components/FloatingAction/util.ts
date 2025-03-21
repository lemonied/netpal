export function positionFormat(x: number, y: number, dom?: HTMLElement | null) {
  if (dom) {
    const mergedX = Math.min(Math.max(x, 0), 100 - dom.clientWidth / document.documentElement.clientWidth * 100);
    const mergedY = Math.min(Math.max(y, 0), 100 - dom.clientHeight / document.documentElement.clientHeight * 100);
    return {
      x: mergedX,
      y: mergedY,
    };
  }
  return { x, y };
}
