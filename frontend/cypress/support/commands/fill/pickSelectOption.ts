export function pickSelectOption(
  cypressSelectInputElement: Cypress.Chainable<JQuery<HTMLElement>>,
  value: string | undefined
) {
  cypressSelectInputElement
    .parent()
    .parent()
    .scrollIntoView()
    .then(([rsuiteSelectElement]) => {
      if (!rsuiteSelectElement) {
        throw new Error('This should never happen.')
      }

      const maybeClearButton = rsuiteSelectElement.querySelector('.rs-picker-toggle-clean')
      if (maybeClearButton) {
        cy.wrap(maybeClearButton).scrollIntoView().click({ force: true })
      }

      if (value) {
        cy.wrap(rsuiteSelectElement).scrollIntoView().click()

        cy.get('.rs-picker-select-menu').then(([rsuiteSelectMenu]) => {
          if (!rsuiteSelectMenu) {
            throw new Error('This should never happen.')
          }

          const maybeSearchInput = rsuiteSelectMenu.querySelector('.rs-picker-search-bar-input')
          if (maybeSearchInput) {
            cy.wrap(maybeSearchInput).scrollIntoView().type(value)
          }

          cy.get('.rs-picker-select-menu-item').contains(value).scrollIntoView().click({ force: true })
        })
      }
    })

  return cypressSelectInputElement
}
