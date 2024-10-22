export function cleanScreenshots(fromNumber: number) {
  cy.exec(`cd cypress/e2e/__image_snapshots__/ && find . | grep -P "[${fromNumber}-7]\\.png" | xargs -i rm {}\n`)
}
