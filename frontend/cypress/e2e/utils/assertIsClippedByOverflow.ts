const CLIPPING_OVERFLOW_VALUES = new Set(['auto', 'clip', 'hidden', 'scroll'])

/**
 * Assert that an element is entirely outside its nearest overflow-clipping ancestor (e.g. scrolled out of a list
 * or positioned outside the map).
 *
 * Cypress 16 visibility (`checkVisibility()`) ignores overflow clipping, so `should('not.be.visible')` no longer passes
 * for such an element.
 */
export function assertIsClippedByOverflow($element: JQuery<HTMLElement>) {
  const element = $element[0]!
  const clippingAncestor = $element
    .parents()
    .toArray()
    .find(ancestor => {
      const style = element.ownerDocument.defaultView!.getComputedStyle(ancestor)

      return CLIPPING_OVERFLOW_VALUES.has(style.overflowX) || CLIPPING_OVERFLOW_VALUES.has(style.overflowY)
    })
  expect(clippingAncestor, 'overflow-clipping ancestor').to.not.equal(undefined)

  const elementRect = element.getBoundingClientRect()
  const ancestorRect = clippingAncestor!.getBoundingClientRect()
  const isOutside =
    elementRect.bottom <= ancestorRect.top ||
    elementRect.top >= ancestorRect.bottom ||
    elementRect.right <= ancestorRect.left ||
    elementRect.left >= ancestorRect.right

  expect(isOutside, 'element is clipped by its overflow ancestor').to.equal(true)
}
