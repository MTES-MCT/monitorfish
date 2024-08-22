import { openSideWindowMissionList } from './utils'

context('Side Window > Mission List > Export Activity Reports', () => {
  beforeEach(() => {
    openSideWindowMissionList()
  })

  it('Should download an activity report', () => {
    cy.cleanDownloadedFiles()

    cy.clickButton('Exporter les ACT-REP')

    cy.fill('Début', [2020, 1, 17])
    cy.fill('Fin', [2021, 1, 12])
    // Hack to close the date picker popup
    cy.get('h4').contains('Exporter les ACT-REP').click().wait(250)
    cy.fill('JDP', 'JDP NS-01')

    cy.intercept(
      'GET',
      '/bff/v1/mission_actions/controls/activity_reports?beforeDateTime=2021-01-12T23:59:59.000Z&afterDateTime=2020-01-17T00:00:00.000Z&jdp=NORTH_SEA'
    ).as('getActivityReports')

    cy.clickButton('Exporter')
    cy.wait('@getActivityReports')

    // Then
    cy.getDownloadedFileContent(content => {
      content
        .should(
          'contains',
          'PATROL_CODE,PATROL_TYPE,MEAN_ID,JDP_CODE,EVENT_TYPE,EVENT_DATE,EVENT_TIME,EVENT_HOUR,LS,PS1,PS2,PS3,NATIONAL_REFERENCE,OBJECT_TYPE,OBJECT_STATE,OBJECT_NATIONAL_ID'
        )
        .should(
          'contains',
          '"LCross Etel","L","Cross Etel","","INSPECTION","20200118","07:19","07:19","FRA","FRA","","","","Vessel","FRA","AYFAK000999999"'
        )
        .should(
          'contains',
          'RC,CFR,NA,ACTIVITY_CODE,GEAR_CODE,MESH_SIZE,FAO_AREA_CODE,FLEET_SEGMENT,LA,LO,PORT_CODE,COUNTRY_CODE,PORT_NAME,LOCATION,SPECIES1,WEIGHT1,NB_IND1,SPECIES2,WEIGHT2'
        )
        .should(
          'contains',
          '"CALLME","FAK000999999","PHENOMENE","LAN","OTB",58.9,"27.4.a","","","","AEFAT","FRA","Fateh Terminal","","JAX",450,"","OTH",40'
        )
    })
  })
})
