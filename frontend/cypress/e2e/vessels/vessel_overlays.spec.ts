context('Vessels Overlays', () => {
  it('Last position card with vessel groups Should be seen on the map on pointer move', () => {
    cy.login('superuser')
    cy.visit('/#@-840507.18,6232030.47,8.70')
    cy.wait(5000)

    // When we move the pointer cursor (from one point to another to emit an event)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 460, clientY: 480, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 501, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 502, clientY: 425, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 500, clientY: 430, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 503, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 500, clientY: 430, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 501, clientY: 435, force: true, pointerId: 1 })

    // Then
    cy.wait(50)
    cy.get('*[data-cy^="vessel-card-name"]').contains('SOCRATE')
    cy.get('*[data-cy^="vessel-card-groups"]').contains('2 autres groupes non affichés sur la carte')

    /**
     * Display the vessel group
     */
    cy.clickButton('Groupes de navires')
    cy.get('[title=\'Afficher le groupe "Mission Thémis – chaluts de fonds"\']').click()
    cy.wait(250)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 460, clientY: 480, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 501, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 502, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 500, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 503, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 500, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 501, clientY: 435, force: true, pointerId: 1 })

    // Then
    cy.wait(50)
    cy.get('*[data-cy^="vessel-card-name"]').contains('SOCRATE')
    cy.get('*[data-cy^="vessel-card-groups"]').contains('Mission Thémis – chaluts de fonds')
    cy.get('*[data-cy^="vessel-card-groups"]').contains('1 autre groupe non affiché sur la carte')

    // Hide vessel groups from map
    cy.clickButton('Cacher les groupes')
    cy.wait(250)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 460, clientY: 480, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 501, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 502, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 500, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 503, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 500, clientY: 435, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 501, clientY: 435, force: true, pointerId: 1 })

    // Then
    cy.wait(50)
    cy.get('*[data-cy^="vessel-card-name"]').contains('SOCRATE')
    cy.get('*[data-cy^="vessel-card-groups"]').should('not.exist')
  })

  it('Last position card Should contain Alert and Beacon malfunction', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(5000)

    /**
     * Alert
     */
    // When we move the pointer cursor (from one point to another to emit an event)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 460, clientY: 480, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 904, clientY: 255, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 905, clientY: 257, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 910, clientY: 250, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 905, clientY: 257, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 904, clientY: 255, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 904, clientY: 255, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 905, clientY: 257, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 910, clientY: 250, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 905, clientY: 257, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 904, clientY: 255, force: true, pointerId: 1 })

    // Then
    cy.wait(50)
    cy.get('*[data-cy^="vessel-card-name"]').contains('EN RÉPÉTER PÈRE')
    cy.get('*[data-cy^="vessel-card-segments"]').contains('SWW01')
    cy.get('*[data-cy^="vessel-card-latitude"]').contains('48° 26′ 17″ N')
    cy.get('*[data-cy^="vessel-card-longitude"]').contains('006° 30′ 22″ W')
    cy.get('*[data-cy^="vessel-card-alert"]').contains('3 milles - Chaluts')

    /**
     * Beacon malfunction
     */
    cy.get('*[data-cy^="vessel-search-input"]').type('EH VOLER MADAME')
    cy.get('*[data-cy^="vessel-search-item"]').eq(0).click()
    cy.wait(2000)

    // When we move the pointer cursor (from one point to another to emit an event)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 460, clientY: 530, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 452, clientY: 511, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 453, clientY: 510, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 454, clientY: 509, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 453, clientY: 510, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 452, clientY: 511, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 451, clientY: 512, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 453, clientY: 511, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 454, clientY: 510, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 452, clientY: 509, force: true, pointerId: 1 })

    // Then
    cy.wait(50)
    cy.get('*[data-cy^="vessel-card-segments"]').contains('NWW01')
    cy.get('*[data-cy^="vessel-card-name"]').contains('EH VOLER MADAME')
    cy.get('*[data-cy^="vessel-card-beacon-malfunction"]').contains('NON-ÉMISSION VMS')
  })

  it('Position card Should be seen on the map on vessel track pointer move', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(5000)

    // When we click on the vessel
    cy.wait(200)
    cy.get('.VESSELS_POINTS').click(460, 480, { force: true, timeout: 10000 })

    // When we move the pointer cursor to a track point (from one point to another to emit an event)
    // We do not need to subtract 50 to Y because we use clientY property, which set the coordinates from the whole window
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 910, clientY: 300, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 426, clientY: 573, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 426, clientY: 574, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 426, clientY: 573, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 426, clientY: 570, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 426, clientY: 575, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 426, clientY: 573, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 426, clientY: 573, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 426, clientY: 572, force: true, pointerId: 1 })

    cy.wait(50)
    cy.get('*[data-cy^="vessel-track-card-latitude"]').contains('47° 38′ 24″ N')
    cy.get('*[data-cy^="vessel-track-card-longitude"]').contains('008° 07′ 01″ W')
    cy.get('*[data-cy^="vessel-track-card-course"]').contains('17°')
    cy.get('*[data-cy^="vessel-track-card-speed"]').contains('8.6')
  })
})
