export function checkMultiRadioOption(fieldsetElement: HTMLElement, value: string) {
  cy.wrap(fieldsetElement)
    .find('label')
    .contains(value)
    .find('input[type="radio"]')
    .scrollIntoView()
    .check({ force: true })

  return fieldsetElement
}
