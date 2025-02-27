context('Main Window > New features', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
    cy.login('superuser')
    cy.visit(`/`, {
      onBeforeLoad(window) {
        if (!window.crypto) {
          cy.stub(window, 'crypto').value({})
        }

        Object.defineProperty(window.crypto, 'subtle', {
          value: { digest: () => {} },
          configurable: true,
        });

        // Dummy hash function instead of sha256
        cy.stub(window.crypto.subtle, 'digest').callsFake(async (_, data) => {
          // Simple hash: XOR all bytes and repeat to 32-byte buffer
          const input = new Uint8Array(data);
          let hashValue = 0;

          for (let byte of input) {
            hashValue = (hashValue ^ byte) & 0xff; // XOR reduction
          }

          // Create a 32-byte fake hash with repeated XOR result
          return new Uint8Array(32).fill(hashValue).buffer;
        });
      }
    })
    cy.wait(5000)
  })

  it('Should display all new features and decrement the badge number when checked', () => {
    cy.get('[title="Nouveautés MonitorFish"]').parent().contains(3)

    cy.clickButton('Nouveautés MonitorFish', { withoutScroll: true })

    cy.getDataCy('map-new-features-box').should('be.visible')
    cy.getDataCy('map-new-features-box').contains('Lorem ipsum dolor sit amet')
    cy.getDataCy('Lorem ipsum dolor sit amet').find('span').eq(0).should('have.css', 'background-color', 'rgb(86, 151, 210)')

    // When
    cy.getDataCy('Lorem ipsum dolor sit amet').click()

    // Then
    cy.get('[title="Nouveautés MonitorFish"]').parent().contains(2)
    cy.getDataCy('Lorem ipsum dolor sit amet').contains('Nouveauté')
    cy.getDataCy('Lorem ipsum dolor sit amet').contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
      'Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.')
    cy.getDataCy('Lorem ipsum dolor sit amet').find('span').eq(0).should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')

    cy.getDataCy('map-new-features-box').contains('Consectetur adipiscing elit')
    cy.getDataCy('map-new-features-box').contains('Incididunt ut labore et dolore')
  })

})
