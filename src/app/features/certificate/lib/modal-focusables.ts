/** Focusable elements inside a dialog panel (for Tab trap). */
export function collectFocusableElements(root: HTMLElement): HTMLElement[] {
  const sel =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(sel)).filter((el) => {
    if (el.tabIndex < 0) {
      return false;
    }
    if (el.hasAttribute('disabled')) {
      return false;
    }
    return el.getClientRects().length > 0;
  });
}
