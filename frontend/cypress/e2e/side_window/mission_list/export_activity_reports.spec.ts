import { openSideWindowMissionList } from './utils'
import dayjs from "dayjs";

context('Side Window > Mission List > Export Activity Reports', () => {
  beforeEach(() => {
    openSideWindowMissionList()
  })

  it('Should download an activity report', () => {
    cy.cleanDownloadedFiles()

    cy.clickButton('Exporter les ACT-REP')

    const controlDateTime = dayjs().subtract(4, 'year').subtract(1, 'week')
    console.log(controlDateTime)
    let startYear = controlDateTime.subtract(1, 'day').year();
    let startMonth = controlDateTime.subtract(1, 'day').month() + 1;
    let startDay = controlDateTime.subtract(1, 'day').date();
    cy.fill('Début', [
      startYear,
      startMonth,
      startDay
    ])
    let endYear = controlDateTime.add(1, 'day').year();
    let endMonth = controlDateTime.add(1, 'day').month() + 1;
    let endDay = controlDateTime.add(1, 'day').date();
    cy.fill('Fin', [
      endYear,
      endMonth,
      endDay
    ])
    // Hack to close the date picker popupœ
    cy.get('h4').contains('Exporter les ACT-REP').click().wait(250)
    cy.fill('JDP', 'JDP NS-01')

    console.log(`/bff/v1/mission_actions/controls/activity_reports?beforeDateTime=${endYear}-${endMonth}-${endDay}T23:59:59.000Z&afterDateTime=${startYear}-${startMonth}-${startDay}T00:00:00.000Z&jdp=NORTH_SEA`)
    cy.intercept(
      'GET',
      `/bff/v1/mission_actions/controls/activity_reports?beforeDateTime=${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}T23:59:59.000Z&afterDateTime=${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}T00:00:00.000Z&jdp=NORTH_SEA`
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
          '"LCross Etel","L","Cross Etel","","INSPECTION",'
        ).should(
        'contains',
        '"FRA","FRA","","","","Vessel","FRA","DONTSINK"'
        ).should(
          'contains',
          'RC,CFR,NA,ACTIVITY_CODE,GEAR_CODE,MESH_SIZE,FAO_AREA_CODE,FLEET_SEGMENT,LA,LO,PORT_CODE,COUNTRY_CODE,PORT_NAME,LOCATION,SPECIES1,WEIGHT1,NB_IND1,SPECIES2,WEIGHT2'
        )
        .should(
          'contains',
          '"CALLME","FAK000999999","PHENOMENE","LAN","OTB",58.9,"27.4.a","NS13","","","AEFAT","FRA","Fateh Terminal","","JAX",450,"","OTH",40'
        )
    })
  })
})
