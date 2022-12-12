export function findElementBytext(
  selector: string,
  text: string,
  {
    index = 0,
    inElement
  }: Partial<{
    inElement: HTMLElement
    index: number
  }> = {}
) {
  if (inElement) {
    return (
      Cypress.$(inElement)
        .find(selector)
        // eslint-disable-next-line func-names
        .filter(function () {
          return Cypress.$(this).text() === text
        })[index]
    )
  }

  // eslint-disable-next-line func-names
  return Cypress.$(selector).filter(function () {
    return Cypress.$(this).text() === text
  })[index]
}
