export function fillTextarea(textareaElement: HTMLTextAreaElement, value: string | undefined) {
  if (value) {
    cy.wrap(textareaElement).scrollIntoView().type(value, { delay: 1, force: true })
  } else {
    cy.wrap(textareaElement).scrollIntoView().clear()
  }
}
