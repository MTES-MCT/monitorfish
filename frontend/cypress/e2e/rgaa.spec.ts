context('Axe core RGAA check that ', () => {
  describe('Home page ', () => {
    it('should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.visit('/#@-824534.42,6082993.21,8.70')
      cy.wait(1000)

      cy.injectAxe()
      // @ts-ignore
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: false }
        },
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      })
    })
  })

  describe('Vessel groups ', () => {
    it('list should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.visit('/side_window')
      cy.wait(250)

      /**
       * Add filters
       */
      cy.getDataCy('side-window-menu-vessel-list').click()
      cy.injectAxe()
      // @ts-ignore
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: false }
        },
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      })
    })
  })
})
