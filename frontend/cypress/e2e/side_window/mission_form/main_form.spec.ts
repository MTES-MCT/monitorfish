import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'
import { SeaFrontGroup } from '../../../../src/domain/entities/seaFront/constants'
import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'
import { customDayjs } from '../../utils/customDayjs'
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

    const getSaveButton = () => cy.get('button').contains('Enregistrer et quitter').parent()
    const expectedStartDateTimeUtc = new RegExp(`${customDayjs().utc().format('YYYY-MM-DDTHH')}:\\d{2}:00\\.000Z`)

    cy.intercept('POST', '/api/v1/missions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMission')

    getSaveButton().should('be.disabled')

    cy.fill('Types de mission', ['Mer'])

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')

    cy.wait(500)

    getSaveButton().should('be.enabled')

    cy.clickButton('Enregistrer et quitter')

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
        isGeometryComputedFromControls: false,
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

    cy.fill('Début de mission', [2023, 2, 1, 12, 34])
    cy.fill('Fin de mission', [2023, 2, 1, 13, 45])

    cy.fill('Types de mission', ['Air'])
    cy.fill('Mission sous JDP', true)

    cy.fill('Ordre de mission', 'Oui')

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')
    cy.fill('Moyen 1', ['Semi-rigide 1'])
    cy.fill('Contact de l’unité 1', 'Bob')
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

    cy.clickButton('Enregistrer et quitter')

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
        endDateTimeUtc: '2023-02-01T13:45:00.000Z',
        hasMissionOrder: true,
        isClosed: false,
        isGeometryComputedFromControls: false,
        isUnderJdp: true,
        missionSource: 'MONITORFISH',
        missionTypes: ['AIR'],
        observationsCacem: 'Une note.',
        observationsCnsp: 'Une autre note.',
        openBy: 'Nemo',
        startDateTimeUtc: '2023-02-01T12:34:00.000Z'
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

    cy.clickButton('Enregistrer et quitter')

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
        isGeometryComputedFromControls: false,
        missionSource: 'POSEIDON_CNSP',
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
        closedBy: 'XYZ',
        controlQualityComments: 'Ciblage CNSP non respecté',
        controlUnits: [],
        emitsAis: 'NOT_APPLICABLE',
        emitsVms: 'YES',
        externalReferenceNumber: null,
        facade: 'NAMO',
        feedbackSheetRequired: true,
        flagState: 'GB',
        flightGoals: [],
        gearInfractions: [
          { comments: 'Maille trop petite', infractionType: 'WITH_RECORD', natinf: 23581 },
          { comments: 'Engin non conforme', infractionType: 'PENDING', natinf: 27724 }
        ],
        gearOnboard: [
          {
            comments: null,
            controlledMesh: null,
            declaredMesh: 60,
            gearCode: 'OTB',
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: false,
            hasUncontrolledMesh: true
          },
          {
            comments: null,
            controlledMesh: 52.8,
            declaredMesh: 60,
            gearCode: 'OTM',
            gearName: 'Chaluts pélagiques à panneaux',
            gearWasControlled: true,
            hasUncontrolledMesh: false
          }
        ],
        hasSomeGearsSeized: false,
        hasSomeSpeciesSeized: true,
        id: 2,
        internalReferenceNumber: 'FAK000999999',
        ircs: null,
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
        segments: [
          { segment: 'SWW04', segmentName: 'Midwater trawls' },
          { segment: 'PEL03', segmentName: 'Polyvalent - Bottom trawl' }
        ],
        seizureAndDiversion: true,
        seizureAndDiversionComments: 'Saisie de la pêche',
        separateStowageOfPreservedSpecies: 'YES',
        speciesInfractions: [{ comments: 'Sous taille de 8cm', infractionType: 'WITHOUT_RECORD', natinf: 28346 }],
        speciesObservations: "Saisie de l'ensemble des captures à bord",
        speciesOnboard: [
          { controlledWeight: 450, declaredWeight: 302.5, nbFish: null, speciesCode: 'MNZ', underSized: true },
          { controlledWeight: 40, declaredWeight: 40, nbFish: null, speciesCode: 'CRF', underSized: false }
        ],
        speciesSizeControlled: true,
        speciesWeightControlled: true,
        unitWithoutOmegaGauge: false,
        userTrigram: 'DEF',
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

        isClosed: true,
        isGeometryComputedFromControls: false
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

    // Main Form
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

    cy.wait(1000)

    cy.clickButton('Ré-ouvrir la mission')

    cy.wait(1000)
    cy.fill('Contact de l’unité 1', 'Bob')

    cy.clickButton('Enregistrer et quitter')

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
            contact: 'Bob',
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
        isGeometryComputedFromControls: false,
        missionSource: 'POSEIDON_CNSP',
        missionTypes: ['AIR'],
        observationsCacem: 'Toward agency blue now hand. Meet answer someone stand.',
        observationsCnsp: null,
        openBy: 'Kevin Torres'
      })
    })
  })

  it('Should delete a mission', () => {
    // We shouldn't be able to delete a CACEM mission:

    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)

    cy.contains('Supprimer la mission').should('be.disabled')

    // But we should be able to delete a CNSP one:

    editSideWindowMissionListMissionWithId(4, SeaFrontGroup.MEMN)

    cy.intercept('DELETE', '/api/v1/missions/4', {
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

  it('Should display an error message When a mission could not be fetched', () => {
    cy.intercept(
      {
        method: 'GET',
        path: '/api/v1/missions/6',
        times: 1
      },
      { statusCode: 400 }
    ).as('getMissionStubbed')
    cy.intercept(
      {
        method: 'GET',
        path: '/api/v1/missions/6',
        times: 1
      },
      { statusCode: 400 }
    ).as('getMissionStubbed')
    cy.intercept(
      {
        method: 'GET',
        path: '/api/v1/missions/6',
        times: 1
      },
      { statusCode: 400 }
    ).as('getMissionStubbed')
    editSideWindowMissionListMissionWithId(6, SeaFrontGroup.MED)
    cy.wait(200)
    cy.get('@getMissionStubbed.all').should('have.length', 3)
    cy.get('*[data-cy="mission-form-error"]').contains("Nous n'avons pas pu récupérer la mission")
  })

  it('Should not show a warning indicating that a control unit is already engaged in a mission When editing', () => {
    editSideWindowMissionListMissionWithId(43, SeaFrontGroup.MED)

    cy.get('body').should(
      'not.contain',
      'Cette unité est actuellement sélectionnée dans une autre mission en cours ouverte par le CNSP.'
    )

    editSideWindowMissionListMissionWithId(4, SeaFrontGroup.MEMN)

    cy.get('body').should(
      'not.contain',
      'Cette unité est actuellement sélectionnée dans une autre mission en cours ouverte par le CNSP.'
    )
  })

  it('Should show a warning indicating that a control unit is already engaged in a mission', () => {
    openSideWindowNewMission()

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'DML 2A')

    cy.get('body').should(
      'contain',
      'Cette unité est actuellement sélectionnée dans une autre mission en cours ouverte par le CNSP.'
    )
  })

  it('Should update the form When receiving a mission update', () => {
    editSideWindowMissionListMissionWithId(43, SeaFrontGroup.MED)
    cy.wait(200)
    cy.intercept('POST', '/api/v1/missions/43', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission')
    cy.intercept('DELETE', '/bff/v1/mission_actions/8', {
      body: {
        id: 8
      },
      statusCode: 200
    }).as('updateMissionAction')

    cy.window().then(win => {
      // @ts-ignore
      cy.log(win.mockEventSources)
      // @ts-ignore
      cy.log(Object.keys(win.mockEventSources))
    })
    cy.window()
      .its('mockEventSources' as any)
      .then(mockEventSources => {
        cy.log(mockEventSources.toString())
        mockEventSources['http://0.0.0.0:8081/api/v1/missions/43/sse'].emitOpen()
        mockEventSources['http://0.0.0.0:8081/api/v1/missions/43/sse'].emit(
          'MISSION_UPDATE',
          new MessageEvent('MISSION_UPDATE', {
            data: JSON.stringify({
              closedBy: 'Heidi Silva',
              controlUnits: [
                {
                  administration: 'DREAL',
                  contact: '06 68 70 34 37 (Commandant Regino)',
                  id: 10019,
                  isArchived: false,
                  name: 'DREAL Pays-de-La-Loire',
                  resources: []
                }
              ],
              // MODIFIED FIELD
              endDateTimeUtc: '2024-02-13T09:49:40.350661Z',
              envActions: [],
              facade: 'MED',
              geom: {
                coordinates: [
                  [
                    [
                      [-4.14598393, 49.02650252],
                      [-3.85722498, 48.52088004],
                      [-3.54255983, 48.92233858],
                      [-3.86251979, 49.15131242],
                      [-4.09368042, 49.18079556],
                      [-4.14598393, 49.02650252]
                    ]
                  ]
                ],
                type: 'MultiPolygon'
              },
              id: 43,
              isClosed: false,
              isGeometryComputedFromControls: false,
              // MODIFIED FIELD
              isUnderJdp: true,
              missionSource: 'MONITORENV',
              missionTypes: ['SEA'],
              observationsCacem: 'Anything box film quality. Lot series agent out rule end young pressure.',
              // MODIFIED FIELD
              observationsCnsp: 'Une observation à la dernière minute.',
              openBy: 'Darren Clark',
              startDateTimeUtc: '2023-03-05T23:08:54.923703Z'
            })
          })
        )
      })
    cy.wait(500)

    cy.clickButton('Supprimer l’action')
    cy.clickButton('Enregistrer et quitter')

    cy.wait('@updateMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.isTrue(interception.request.body.isUnderJdp)
      assert.equal(interception.request.body.endDateTimeUtc, '2024-02-13T09:49:40.350661Z')
      assert.equal(interception.request.body.observationsCnsp, 'Une observation à la dernière minute.')
    })
  })
})
