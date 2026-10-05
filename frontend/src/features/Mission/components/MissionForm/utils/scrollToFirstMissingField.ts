const ROW_DATA_CY_BY_COLLECTION: Record<string, string> = {
  discardedSpecies: 'discarded-species-row',
  speciesOnboard: 'species-onboard-row'
}

const SCROLL_TOP_MARGIN = 24
const HIGHLIGHT_DURATION_MS = 1500
const HIGHLIGHT_ATTRIBUTE = 'data-missing-field-highlighted'

const highlightTimeouts = new WeakMap<Element, ReturnType<typeof setTimeout>>()

export function findMissingFieldElement(root: ParentNode, path: string): Element | null {
  const fieldElement = root.querySelector(`[name="${path}"]`)
  if (fieldElement) {
    return fieldElement
  }

  const [, collection, index] = /^(\w+)(?:\[(\d+)\])?/.exec(path) ?? []
  if (!collection) {
    return null
  }

  const rowDataCy = ROW_DATA_CY_BY_COLLECTION[collection]
  const rowElement = rowDataCy ? root.querySelector(`[data-cy="${rowDataCy}-${index}"]`) : null
  if (rowElement) {
    return rowElement
  }

  return root.querySelector(`[data-missing-field-anchor~="${collection}"]`)
}

function isDisplayedBefore(element: Element, otherElement: Element): boolean {
  return Boolean(element.compareDocumentPosition(otherElement) & Node.DOCUMENT_POSITION_FOLLOWING)
}

function compareDisplayOrder(element: Element | null, otherElement: Element | null): number {
  if (element === otherElement) {
    return 0
  }
  if (!element) {
    return 1
  }
  if (!otherElement) {
    return -1
  }

  return isDisplayedBefore(element, otherElement) ? -1 : 1
}

export function sortPathsByDisplayOrder(root: ParentNode, paths: string[]): string[] {
  return paths
    .map(path => ({ element: findMissingFieldElement(root, path), path }))
    .sort((a, b) => compareDisplayOrder(a.element, b.element))
    .map(({ path }) => path)
}

export function findFirstMissingFieldElement(root: ParentNode, paths: string[]): Element | undefined {
  const [firstPath] = sortPathsByDisplayOrder(root, paths)

  return (firstPath !== undefined ? findMissingFieldElement(root, firstPath) : null) ?? undefined
}

function highlightField(element: Element): void {
  const fieldElement = element.closest('[class*="Field-"]') ?? element

  clearTimeout(highlightTimeouts.get(fieldElement))
  fieldElement.setAttribute(HIGHLIGHT_ATTRIBUTE, '')
  highlightTimeouts.set(
    fieldElement,
    setTimeout(() => {
      fieldElement.removeAttribute(HIGHLIGHT_ATTRIBUTE)
      highlightTimeouts.delete(fieldElement)
    }, HIGHLIGHT_DURATION_MS)
  )
}

export function scrollToFirstMissingField(elementInActionForm: Element, paths: string[]): void {
  const scrollContainer = elementInActionForm.closest('[data-action-form-scroll-container]')
  const firstMissingFieldElement = scrollContainer ? findFirstMissingFieldElement(scrollContainer, paths) : undefined
  if (!scrollContainer || !firstMissingFieldElement) {
    return
  }

  const containerRect = scrollContainer.getBoundingClientRect()
  const elementRect = firstMissingFieldElement.getBoundingClientRect()
  const elementTopInContainer = scrollContainer.scrollTop + elementRect.top - containerRect.top

  scrollContainer.scrollTo({
    behavior: 'smooth',
    top: elementTopInContainer - SCROLL_TOP_MARGIN
  })
  highlightField(firstMissingFieldElement)
}
