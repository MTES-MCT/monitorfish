const ROW_DATA_CY_BY_COLLECTION: Record<string, string> = {
  discardedSpecies: 'discarded-species-row',
  speciesOnboard: 'species-onboard-row'
}

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

export function findFirstMissingFieldElement(root: ParentNode, paths: string[]): Element | undefined {
  return paths
    .map(path => findMissingFieldElement(root, path))
    .filter((element): element is Element => element !== null)
    .reduce<Element | undefined>(
      (first, element) => (first && isDisplayedBefore(first, element) ? first : element),
      undefined
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
    top: elementTopInContainer - (containerRect.height - elementRect.height) / 2
  })
}
