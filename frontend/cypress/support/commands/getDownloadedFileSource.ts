const RETRY_COUNT = 5

export function getRetryableDownloadedFileContent(
  callback: (content: Cypress.Chainable<any>) => void,
  leftRetryCount: number
) {
  cy.wait(500)

  cy.exec('cd cypress/downloads && ls').then(result => {
    const downloadedFilename = result.stdout
    cy.log(`Files: ${result.stdout}`)

    if (!downloadedFilename || downloadedFilename === '') {
      if (leftRetryCount <= 0) {
        throw new Error(`No file found after ${RETRY_COUNT} retries.`)
      }

      cy.log(`No file found. Retrying (${RETRY_COUNT - leftRetryCount} / ${RETRY_COUNT})...`)

      return getRetryableDownloadedFileContent(callback, leftRetryCount - 1)
    }

    // eslint-disable-next-line cypress/no-assigning-return-values
    const content = cy.readFile(`cypress/downloads/${downloadedFilename}`)

    return callback(content)
  })
}

export function getDownloadedFileContent(callback: (content: Cypress.Chainable<any>) => void) {
  return getRetryableDownloadedFileContent(callback, RETRY_COUNT)
}
