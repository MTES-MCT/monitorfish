export function checkMultiCheckboxOptions(fieldsetElement: HTMLElement, values: string[] | undefined) {
  cy.wrap(fieldsetElement).scrollIntoView().find('input[type="checkbox"]').uncheck({ force: true })

  if (values) {
    values.forEach(value => {
      cy.wrap(fieldsetElement).find('label').contains(value).find('input[type="checkbox"]').check({ force: true })
    })
  }

  return fieldsetElement
}
