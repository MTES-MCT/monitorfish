import { editSideWindowPriorNotification } from './utils'

context('Side Window > Logbook Prior Notification Form > Sent Message List', () => {
  it('Should display the expected list of subscribers and sent messages history', () => {
    editSideWindowPriorNotification(`CALAMARO`, 'FAKE_OPERATION_108')

    cy.intercept('GET', `/bff/v1/prior_notifications/FAKE_OPERATION_108/sent_messages`).as(
      'getPriorNotificationSentMessages'
    )

    cy.clickButton('Voir les détails de la diffusion du préavis')

    cy.wait('@getPriorNotificationSentMessages')

    cy.get('address').eq(0).contains('Unité 3 (Gendarmerie)')
    cy.get('address').eq(0).contains('pgmarc720.lorient@gendarmerie.defense.gouv.fr')
    cy.get('address').eq(0).contains('+33123456789')

    cy.get('address').eq(1).contains('Unité 4 (Gendarmerie)')
    cy.get('address').eq(1).contains('ggmaratlan@gendarmerie.defense.gouv.fr')
    cy.get('address').eq(1).contains('+33987654321')

    cy.get('address').eq(2).contains('Unité 5 (DDTM 40)')
    cy.get('address').eq(2).contains('unite5@ddtm-40.gouv.fr')
    cy.get('address').eq(2).contains('+33000000000')

    cy.getDataCy('SentMessageList-historyItem')
      .eq(0)
      .contains(
        'Échec de la diffusion pour tous les contacts: pgmarc720.lorient@gendarmerie.defense.gouv.fr, +33987654321, +33123456789, ggmaratlan@gendarmerie.defense.gouv.fr.'
      )

    cy.getDataCy('SentMessageList-historyItem')
      .eq(1)
      .contains(
        'Échec de la diffusion pour le(s) contact(s): +33000000000, +33987654321, unite5@ddtm-40.gouv.fr, pgmarc720.lorient@gendarmerie.defense.gouv.fr.'
      )

    cy.getDataCy('SentMessageList-historyItem').eq(2).contains('Préavis diffusé avec succès à tous les contacts.')
  })
})
