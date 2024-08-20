export function cleanDownloadedFiles() {
  cy.exec('rm -rf cypress/downloads/*', {
    failOnNonZeroExit: false
  })
}
