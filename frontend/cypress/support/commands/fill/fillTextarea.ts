export function fillTextarea(textareaElement: HTMLTextAreaElement, value: string | undefined) {
  if (value) {
    cy.wrap(textareaElement).scrollIntoView().type(value)
  } else {
    cy.wrap(textareaElement).scrollIntoView().clear()
  }
}
