export function pickMultiSelectOptions(
  cypressMultiSelectInputElement: Cypress.Chainable<JQuery<HTMLElement>>,
  values: string[] | undefined
) {
  cypressMultiSelectInputElement
    .parent()
    .parent()
    .parent()
    .parent()
    .then(([rsuiteMultiSelectElement]) => {
      if (!rsuiteMultiSelectElement) {
        throw new Error('This should never happen.')
      }

      const maybeClearButton = rsuiteMultiSelectElement.querySelector('.rs-picker-toggle-clean')
      if (maybeClearButton) {
        cy.wrap(maybeClearButton).scrollIntoView().click({ force: true })
      }

      if (values) {
        cy.wrap(rsuiteMultiSelectElement).scrollIntoView().click()

        cy.get('.rs-picker-picker-check-menu').then(([rsuiteMultiSelectMenu]) => {
          if (!rsuiteMultiSelectMenu) {
            throw new Error('This should never happen.')
          }

          const maybeSearchInput = rsuiteMultiSelectMenu.querySelector('.rs-picker-search-bar-input')
          values.forEach(value => {
            if (maybeSearchInput) {
              cy.wrap(maybeSearchInput).scrollIntoView().type(value)
            }

            cy.get('.rs-checkbox-checker').contains(value).scrollIntoView().click({ force: true })
          })

          const offsetLeft = rsuiteMultiSelectElement.offsetLeft
            ? rsuiteMultiSelectElement.offsetLeft
            : (() => {
                if (!rsuiteMultiSelectElement.offsetParent) {
                  throw new Error('`rsuiteMultiSelectElement.offsetParent` is undefined.')
                }

                return (rsuiteMultiSelectElement.offsetParent as HTMLBodyElement).offsetLeft
              })()
          const offsetTop =
            rsuiteMultiSelectElement.offsetTop !== 0
              ? rsuiteMultiSelectElement.offsetTop
              : (() => {
                  if (!rsuiteMultiSelectElement.offsetParent) {
                    throw new Error('`rsuiteMultiSelectElement.offsetParent` is undefined.')
                  }

                  return (rsuiteMultiSelectElement.offsetParent as HTMLBodyElement).offsetTop
                })()

          // TODO Investigate that (this should be -1).
          cy.clickOutside(offsetLeft, offsetTop - 16)
        })
      }
    })
}
