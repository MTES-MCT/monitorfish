export function injectAxe() {
  cy.readFile('node_modules/axe-core/axe.js').then(source =>
    cy.window({ log: false }).then(window => {
      window.eval(source)
    })
  )
}
