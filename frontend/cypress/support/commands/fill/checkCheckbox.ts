export function checkCheckbox(checkboxInputElement: HTMLInputElement, value: boolean) {
  if (value) {
    cy.wrap(checkboxInputElement).scrollIntoView().check({ force: true })
  } else {
    cy.wrap(checkboxInputElement).scrollIntoView().uncheck({ force: true })
  }
}
