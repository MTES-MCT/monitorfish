import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { SeaFrontGroup } from '../../../../src/constants'
import { Mission } from '../../../../src/domain/entities/mission/types'
import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'
import { getUtcizedDayjs } from '../../utils/getUtcizedDayjs'
import { editSideWindowMissionListMissionWithId } from '../mission_list/utils'

context('Side Window > Mission Form > Main Form', () => {
  it('Should add and remove a control unit', () => {
    openSideWindowNewMission()

    cy.clickButton('Ajouter une autre unité')

    cy.get('label').contains('Administration 2').should('exist')

    cy.clickButton('Supprimer cette unité')

    cy.get('label').contains('Administration 2').should('not.exist')
  })

  it('Should send the expected data to the API when creating a new mission (required fields only)', () => {
    openSideWindowNewMission()

    const getSaveButton = () => cy.get('button').contains('Enregistrer').parent()
    const getSaveAndCloseButton = () => cy.get('button').contains('Enregistrer').parent()
    const expectedStartDateTimeUtc = new RegExp(`${getUtcizedDayjs().utc().format('YYYY-MM-DDTHH')}:\\d{2}:00\\.000Z`)

    cy.intercept('POST', '/api/v1/missions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMission')

    getSaveButton().should('be.disabled')
    getSaveAndCloseButton().should('be.disabled')

    cy.fill('Types de mission', ['Mer'])

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')

    cy.wait(500)

    getSaveButton().should('be.enabled')
    getSaveAndCloseButton().should('be.enabled')

    cy.clickButton('Enregistrer')

    cy.wait('@createMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isUndefined(interception.request.body.endDateTimeUtc)
      // We only need to accurately test this prop in one test, no need to repeat it for each case
      assert.match(interception.request.body.startDateTimeUtc, expectedStartDateTimeUtc)
      assert.deepInclude(interception.request.body, {
        controlUnits: [
          {
            administration: 'DDTM',
            contact: null,
            id: 10001,
            isArchived: false,
            name: 'Cultures marines – DDTM 40',
            resources: []
          }
        ],
        isClosed: false,
        isUnderJdp: false,
        missionSource: 'MONITORFISH',
        missionTypes: ['SEA']
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should send the expected data to the API when creating a new mission', () => {
    openSideWindowNewMission()

    cy.intercept('POST', '/api/v1/missions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMission')

    cy.fill('Début de mission', [2023, 2, 1, 12, 31])
    cy.fill('Fin de mission', [2023, 2, 1, 12, 31])

    cy.fill('Types de mission', ['Air'])
    cy.fill('Mission sous JDP', true)

    cy.fill('Ordre de mission', 'Oui')

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')
    cy.fill('Moyen 1', ['Semi-rigide 1'])
    cy.fill('Contact de l’unité 1', 'Bob')

    cy.clickButton('Ajouter une autre unité')

    cy.fill('Administration 2', 'DREAL')
    cy.fill('Unité 2', 'DREAL Pays-de-La-Loire')
    cy.fill('Moyen 2', ['ALTAIR', 'ARIOLA'])
    cy.fill('Contact de l’unité 2', 'Bob 2')

    cy.fill('CACEM : orientations, observations', 'Une note.')
    cy.fill('CNSP : orientations, observations', 'Une autre note.')
    cy.fill('Ouvert par', 'Nemo')
    cy.fill('Clôturé par', 'Doris')

    cy.wait(500)

    cy.clickButton('Enregistrer')

    cy.wait('@createMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        closedBy: 'Doris',
        controlUnits: [
          {
            administration: 'DDTM',
            contact: 'Bob',
            id: 10001,
            isArchived: false,
            name: 'Cultures marines – DDTM 40',
            resources: [
              {
                id: 1,
                name: 'Semi-rigide 1'
              }
            ]
          },
          {
            administration: 'DREAL',
            contact: 'Bob 2',
            id: 10019,
            isArchived: false,
            name: 'DREAL Pays-de-La-Loire',
            resources: [
              {
                id: 10,
                name: 'ALTAIR'
              },
              {
                id: 12,
                name: 'ARIOLA'
              }
            ]
          }
        ],
        endDateTimeUtc: '2023-02-01T12:31:00.000Z',
        hasMissionOrder: true,
        isClosed: false,
        isUnderJdp: true,
        missionSource: 'MONITORFISH',
        missionTypes: ['AIR'],
        observationsCacem: 'Une note.',
        observationsCnsp: 'Une autre note.',
        openBy: 'Nemo',
        startDateTimeUtc: '2023-02-01T12:31:00.000Z'
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should send the expected data to the API when editing an existing mission', () => {
    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)

    cy.intercept('POST', '/api/v1/missions/2', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission')
    cy.intercept('PUT', '/bff/v1/mission_actions/2').as('updateMissionAction2')

    cy.clickButton('Enregistrer')

    cy.wait('@updateMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isString(interception.request.body.endDateTimeUtc)
      assert.isString(interception.request.body.startDateTimeUtc)
      assert.deepInclude(interception.request.body, {
        closedBy: 'Samantha Jones',
        controlUnits: [
          {
            administration: 'Douane',
            contact: null,
            id: 10015,
            isArchived: false,
            name: 'BGC Bastia',
            resources: []
          }
        ],
        facade: 'MEMN',
        geom: null,
        id: 2,
        isClosed: false,
        missionSource: 'MONITORFISH',
        missionTypes: ['SEA'],
        observationsCacem:
          'Maybe own each college away likely major. Former space technology million cell. Outside body my drop require.',
        observationsCnsp: null,
        openBy: 'Brittany Graham'
      })
    })

    cy.wait('@updateMissionAction2').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isString(interception.request.body.actionDatetimeUtc)
      assert.deepInclude(interception.request.body, {
        actionType: 'SEA_CONTROL',
        controlQualityComments: 'Ciblage CNSP non respecté',
        controlUnits: [],
        diversion: null,
        emitsAis: 'NOT_APPLICABLE',
        emitsVms: 'YES',
        externalReferenceNumber: null,
        facade: 'Manche ouest - Atlantique',
        feedbackSheetRequired: true,
        flagState: 'GB',
        flightGoals: [],
        gearInfractions: [
          { comments: 'Maille trop petite', gearSeized: null, infractionType: 'WITH_RECORD', natinf: 23581 },
          { comments: 'Engin non conforme', gearSeized: null, infractionType: 'PENDING', natinf: 27724 }
        ],
        gearOnboard: [
          {
            comments: null,
            controlledMesh: null,
            declaredMesh: 60,
            gearCode: 'OTB',
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: false
          },
          {
            comments: null,
            controlledMesh: 52.8,
            declaredMesh: 60,
            gearCode: 'OTM',
            gearName: 'Chaluts pélagiques à panneaux',
            gearWasControlled: true
          }
        ],
        id: 2,
        internalReferenceNumber: 'FAK000999999',
        ircs: null,
        isFromPoseidon: null,
        latitude: 47.44,
        licencesAndLogbookObservations: "C'est pas très très bien réglo toute cette poissecalle non déclarée",
        licencesMatchActivity: 'NO',
        logbookInfractions: [
          {
            comments: 'Poids à bord MNZ supérieur de 50% au poids déclaré',
            infractionType: 'WITH_RECORD',
            natinf: 27689
          }
        ],
        logbookMatchesActivity: 'NO',
        longitude: -0.52,
        missionId: 2,
        numberOfVesselsFlownOver: null,
        otherComments: 'Commentaires post contrôle',
        otherInfractions: [
          {
            comments: 'Chalutage répété dans les 3 milles sur Piste VMS - confirmé de visu',
            infractionType: 'WITH_RECORD',
            natinf: 23588
          },
          { comments: "Absence d'équipement AIS à bord", infractionType: 'PENDING', natinf: 23584 }
        ],
        portLocode: null,
        portName: null,
        segments: [
          { segment: 'SWW04', segmentName: 'Midwater trawls' },
          { segment: 'PEL03', segmentName: 'Polyvalent - Bottom trawl' }
        ],
        seizureAndDiversion: true,
        seizureAndDiversionComments: 'Saisie de la pêche',
        separateStowageOfPreservedSpecies: 'YES',
        speciesInfractions: [
          { comments: 'Sous taille de 8cm', infractionType: 'WITHOUT_RECORD', natinf: 28346, speciesSeized: true }
        ],
        speciesObservations: "Saisie de l'ensemble des captures à bord",
        speciesOnboard: [
          { controlledWeight: 450, declaredWeight: 302.5, nbFish: null, speciesCode: 'MNZ', underSized: true },
          { controlledWeight: 40, declaredWeight: 40, nbFish: null, speciesCode: 'CRF', underSized: false }
        ],
        speciesSizeControlled: true,
        speciesWeightControlled: true,
        unitWithoutOmegaGauge: false,
        userTrigram: null,
        vesselId: 1,
        vesselName: 'PHENOMENE',
        vesselTargeted: 'NO'
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should close a new mission', () => {
    openSideWindowNewMission()
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.fill('Clôturé par', 'Doris')

    cy.wait(500)

    cy.clickButton('Enregistrer et clôturer')

    cy.wait('@createMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        // We check this prop to be sure all the data is there (this is the last field to be filled)
        closedBy: 'Doris',
        isClosed: true
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should close an existing mission', () => {
    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)

    cy.intercept('POST', '/api/v1/missions/2', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission')

    cy.fill('Clôturé par', 'Doris')

    cy.wait(500)

    cy.clickButton('Enregistrer et clôturer')

    cy.wait('@updateMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        // We check this prop to be sure all the data is there (this is the last field to be filled)
        closedBy: 'Doris',
        id: 2,
        isClosed: true
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should show the cancellation confirmation dialog when switching to another menu while a draft is dirty', () => {
    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)

    cy.clickButton(SideWindowMenuLabel.MISSION_LIST)

    cy.get('h1').should('contain.text', 'Missions et contrôles')

    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)

    cy.fill('Clôturé par', 'Nemo')

    cy.wait(500)

    cy.clickButton(SideWindowMenuLabel.MISSION_LIST)

    cy.get('.Component-Dialog').should('be.visible')

    cy.clickButton('Retourner à l’édition')

    cy.get('h1').should('contain.text', 'Mission Mer – BGC Bastia')

    cy.clickButton(SideWindowMenuLabel.MISSION_LIST)
    cy.clickButton('Quitter sans enregistrer')

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should reopen a closed mission', () => {
    editSideWindowMissionListMissionWithId(6, SeaFrontGroup.MED)

    cy.intercept('POST', '/api/v1/missions/6', {
      body: {
        id: 1
      },
      statusCode: 204
    }).as('updateMission')

    cy.contains('Veuillez rouvrir la mission avant d’en modifier les informations.').should('be.visible')

    cy.wait(1000)

    cy.clickButton('Ré-ouvrir la mission')

    cy.wait(1000)

    cy.contains('Veuillez rouvrir la mission avant d’en modifier les informations.').should('not.exist')

    cy.clickButton('Enregistrer')

    cy.wait('@updateMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isString(interception.request.body.endDateTimeUtc)
      assert.isString(interception.request.body.startDateTimeUtc)
      assert.deepInclude(interception.request.body, {
        closedBy: 'Cynthia Phillips',
        controlUnits: [
          {
            administration: 'DDTM',
            contact: null,
            id: 10003,
            isArchived: false,
            name: 'DML 2A (historique)',
            resources: [{ id: 3, name: 'Semi-rigide 1' }]
          }
        ],
        envActions: [],
        facade: 'MED',
        geom: null,
        id: 6,
        isClosed: false,
        missionSource: 'MONITORFISH',
        missionTypes: ['AIR'],
        observationsCacem: 'Toward agency blue now hand. Meet answer someone stand.',
        observationsCnsp: null,
        openBy: 'Kevin Torres'
      })
    })
  })

  it('Should delete a mission', () => {
    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)

    cy.intercept('DELETE', '/api/v1/missions/2', {
      statusCode: 204
    }).as('deleteMission')

    cy.clickButton('Supprimer la mission')

    cy.get('.Component-Dialog').should('be.visible')

    cy.clickButton('Retourner à l’édition')

    cy.get('.Component-Dialog').should('not.exist')

    cy.clickButton('Supprimer la mission')

    cy.get('.Component-Dialog').should('be.visible')

    cy.clickButton('Confirmer la suppression')

    cy.wait('@deleteMission')

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })
})
