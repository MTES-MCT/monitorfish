export function forceClick([subject]: Cypress.Chainable<Cypress.JQueryWithSelector>[]): Cypress.Chainable<
  JQuery<HTMLElement>
> {
  if (!subject) {
    throw new Error(`Could not find subject.`)
  }

  return subject.click({ force: true })
}
