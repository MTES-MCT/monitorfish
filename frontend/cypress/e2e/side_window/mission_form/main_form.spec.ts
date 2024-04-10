import { Mission } from '@features/Mission/mission.types'

import { openSideWindowNewMission } from './utils'
import { SeaFrontGroup } from '../../../../src/domain/entities/seaFront/constants'
import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'
import { FAKE_MISSION_WITH_EXTERNAL_ACTIONS, FAKE_MISSION_WITHOUT_EXTERNAL_ACTIONS } from '../../constants'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'
import { editSideWindowMissionListMissionWithId } from '../mission_list/utils'

context('Side Window > Mission Form > Main Form', () => {
  it('Should add and remove a control unit', () => {
    openSideWindowNewMission()

    cy.clickButton('Ajouter une autre unité')

    cy.get('label').contains('Administration 2').should('exist')

    cy.clickButton('Supprimer cette unité')

    cy.get('label').contains('Administration 2').should('not.exist')
  })

  it('Should send the expected data to the API when creating a new mission (required fields)', () => {
    openSideWindowNewMission()
    cy.get('div').contains('Mission non enregistrée.')

    cy.get('h1').should('contain.text', 'Nouvelle mission')
    cy.get('.Element-Tag').contains('Enregistrement auto. actif')

    const expectedStartDateTimeUtc = new RegExp(`${customDayjs().utc().format('YYYY-MM-DDTHH')}:\\d{2}:00\\.000Z`)
    cy.intercept('DELETE', '/bff/v1/mission_actions/1', {
      statusCode: 200
    })
    cy.intercept('POST', '/api/v1/missions', {
      body: {
        createdAtUtc: customDayjs().utc().format('YYYY-MM-DDTHH:mm:ss.000Z'),
        id: 1,
        updatedAtUtc: customDayjs().utc().format('YYYY-MM-DDTHH:mm:ss.000Z')
      },
      statusCode: 201
    }).as('createMission')
    cy.intercept('GET', '/bff/v1/missions/1', {
      body: {
        envActions: [],
        id: 1
      },
      statusCode: 201
    }).as('getCreatedMission')

    const endDate = customDayjs().utc().add(7, 'day')
    cy.fill('Fin de mission', getUtcDateInMultipleFormats(endDate.toISOString()).utcDateTupleWithTime)
    const expectedEndDateTimeUtc = new RegExp(`${endDate.format('YYYY-MM-DDTHH')}:\\d{2}:00\\.000Z`)

    cy.fill('Types de mission', ['Mer'])

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines 56')

    cy.wait('@createMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      // We need to accurately test this prop in one test, no need to repeat it for each case
      assert.match(interception.request.body.startDateTimeUtc, expectedStartDateTimeUtc)
      assert.match(interception.request.body.endDateTimeUtc, expectedEndDateTimeUtc)
      assert.deepInclude(interception.request.body, {
        controlUnits: [
          {
            administration: 'DDTM',
            contact: null,
            id: 10499,
            isArchived: false,
            name: 'Cultures marines 56',
            resources: []
          }
        ],
        isGeometryComputedFromControls: true,
        isUnderJdp: false,
        missionSource: 'MONITORFISH',
        missionTypes: ['SEA']
      })
    })

    cy.wait(500)
    cy.get('div').contains('Mission créée par le')
    cy.get('div').contains('Dernière modification enregistrée')
    cy.get('h1').should('contain.text', 'Mission Mer – Cultures marines 56')
  })

  it(
    'Should send the expected data to the API When auto save is not enabled',
    {
      env: {
        FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED: false
      }
    },
    () => {
      openSideWindowNewMission()
      cy.intercept('GET', '/bff/v1/missions/1', {
        body: {
          envActions: [],
          id: 1
        },
        statusCode: 201
      }).as('getCreatedMission')
      cy.intercept('DELETE', '/bff/v1/mission_actions/1', {
        statusCode: 200
      })

      const expectedStartDateTimeUtc = new RegExp(`${customDayjs().utc().format('YYYY-MM-DDTHH')}:\\d{2}:00\\.000Z`)

      cy.intercept('POST', '/api/v1/missions', {
        body: {
          id: 1
        },
        statusCode: 201
      }).as('createMission')

      const endDate = getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString())
      cy.fill('Fin de mission', endDate.utcDateTupleWithTime)

      cy.fill('Types de mission', ['Mer'])

      cy.fill('Administration 1', 'DDTM')
      cy.fill('Unité 1', 'Cultures marines 56')

      cy.wait(500)

      cy.clickButton(SideWindowMenuLabel.MISSION_LIST)

      cy.get('.Component-Dialog').should('be.visible')

      cy.contains('Voulez-vous enregistrer les modifications avant de quitter')

      cy.clickButton('Retourner à l’édition')

      cy.get('.Element-Tag').contains('Enregistrement auto. inactif')
      cy.clickButton('Enregistrer')

      cy.wait('@createMission').then(interception => {
        if (!interception.response) {
          assert.fail('`interception.response` is undefined.')
        }

        // We need to accurately test this prop in one test, no need to repeat it for each case
        assert.match(interception.request.body.startDateTimeUtc, expectedStartDateTimeUtc)
        assert.deepInclude(interception.request.body, {
          controlUnits: [
            {
              administration: 'DDTM',
              contact: null,
              id: 10499,
              isArchived: false,
              name: 'Cultures marines 56',
              resources: []
            }
          ],
          isGeometryComputedFromControls: true,
          isUnderJdp: false,
          missionSource: 'MONITORFISH',
          missionTypes: ['SEA']
        })
      })

      cy.get('h1').should('contain.text', 'Missions en MED')
    }
  )

  it('Should send the expected data to the API when creating a new mission', () => {
    openSideWindowNewMission()
    cy.intercept('GET', '/bff/v1/missions/1', {
      body: {
        envActions: [],
        id: 1
      },
      statusCode: 201
    }).as('getCreatedMission')

    cy.intercept('POST', '/api/v1/missions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMission')

    cy.intercept('POST', '/api/v1/missions/1', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission')
    cy.intercept('DELETE', '/bff/v1/mission_actions/1', {
      statusCode: 200
    })

    cy.fill('Début de mission', [2023, 2, 1, 12, 34])
    const endDate = getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString())
    cy.fill('Fin de mission', endDate.utcDateTupleWithTime)

    cy.fill('Types de mission', ['Air'])
    cy.fill('Mission sous JDP', true)

    cy.fill('Ordre de mission', 'Oui')

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines 56')
    cy.wait(500)
    cy.fill('Moyen 1', ['Brezel - FAH 7185'])
    cy.wait(250)
    cy.fill('Contact de l’unité 1', 'Bob')
    cy.fill('Contact de l’unité 1', 'Bob')

    cy.clickButton('Ajouter une autre unité')

    cy.fill('Administration 2', 'Office Français de la Biodiversité')
    cy.fill('Unité 2', 'OFB SD 56')
    cy.fill('Moyen 2', ['Jean Armel', 'Kereon II'])
    cy.fill('Contact de l’unité 2', 'Bob 2')
    cy.wait(500)

    cy.fill('CACEM : orientations, observations', 'Une note.')
    cy.fill('CNSP : orientations, observations', 'Une autre note.')
    cy.wait(250)
    cy.fill('Ouvert par', 'Nemo')
    cy.fill('Complété par', 'Doris')

    cy.wait(500)

    cy.waitForLastRequest(
      '@updateMission',
      {
        body: {
          closedBy: 'Doris',
          controlUnits: [
            {
              administration: 'DDTM',
              contact: 'Bob',
              id: 10499,
              isArchived: false,
              name: 'Cultures marines 56',
              resources: [
                {
                  id: 314,
                  name: 'Brezel - FAH 7185'
                }
              ]
            },
            {
              administration: 'Office Français de la Biodiversité',
              contact: 'Bob 2',
              id: 10338,
              isArchived: false,
              name: 'OFB SD 56',
              resources: [
                {
                  id: 388,
                  name: 'Jean Armel – AY 894009'
                },
                {
                  id: 580,
                  name: 'Kereon II – AY 933119 K'
                }
              ]
            }
          ],
          hasMissionOrder: true,
          isGeometryComputedFromControls: true,
          isUnderJdp: true,
          missionSource: 'MONITORFISH',
          missionTypes: ['AIR'],
          observationsCacem: 'Une note.',
          observationsCnsp: 'Une autre note.',
          openBy: 'Nemo',
          startDateTimeUtc: '2023-02-01T12:34:00.000Z'
        }
      },
      15
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should send the expected data to the API when editing an existing mission', () => {
    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)
    const endDate = customDayjs().utc().add(7, 'day')
    cy.fill('Fin de mission', getUtcDateInMultipleFormats(endDate.toISOString()).utcDateTupleWithTime)

    cy.intercept('POST', '/api/v1/missions/2', {
      body: {
        id: 2
      },
      statusCode: 201
    }).as('updateMission')

    cy.fill('Ouvert par', 'Nemo')

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
            id: 10484,
            isArchived: false,
            name: 'BGC Lorient - DF 36 Kan An Avel',
            resources: []
          }
        ],
        facade: 'MEMN',
        geom: null,
        id: 2,
        isGeometryComputedFromControls: false,
        missionSource: 'POSEIDON_CNSP',
        missionTypes: ['SEA'],
        observationsCacem:
          'Maybe own each college away likely major. Former space technology million cell. Outside body my drop require.',
        observationsCnsp: null,
        openBy: 'Nemo'
      })
    })

    cy.get('h1').should('contain.text', 'Mission Mer – BGC Lorient - DF 36 Kan An Avel')
  })

  it('Should show the cancellation confirmation dialog when switching to another menu while a draft is dirty', () => {
    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)

    cy.clickButton(SideWindowMenuLabel.MISSION_LIST)

    cy.get('h1').should('contain.text', 'Missions en MEMN')

    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)

    // We remove a required field
    cy.fill('Unité 1', '')

    cy.wait(500)

    cy.clickButton(SideWindowMenuLabel.MISSION_LIST)

    cy.get('.Component-Dialog').should('be.visible')

    cy.clickButton('Retourner à l’édition')

    cy.get('h1').should('contain.text', 'Mission Mer –')

    cy.clickButton(SideWindowMenuLabel.MISSION_LIST)
    cy.clickButton('Quitter sans enregistrer')

    cy.get('h1').should('contain.text', 'Missions en MEMN')
  })

  it('A mission should not be deleted if actions have been created in MonitorEnv', () => {
    const missionId = 4
    editSideWindowMissionListMissionWithId(missionId, SeaFrontGroup.MEMN)

    cy.intercept(
      { method: 'GET', url: `/api/v1/missions/${missionId}/can_delete?source=${Mission.MissionSource.MONITORFISH}` },
      FAKE_MISSION_WITH_EXTERNAL_ACTIONS
    ).as('canDeleteMission')

    cy.clickButton('Supprimer la mission')

    cy.wait('@canDeleteMission').then(({ response }) => {
      expect(response && response.statusCode).equal(200)
      expect(response && response.body.canDelete).equal(false)
      expect(response && response.body.sources[0]).equal('MONITORENV')
    })

    cy.getDataCy('external-actions-modal').should('be.visible')
    cy.clickButton('Fermer')
    cy.getDataCy('external-actions-modal').should('not.exist')
  })

  it('Should delete a mission if no action created in MonitorEnv', () => {
    // We shouldn't be able to delete a CACEM mission:
    editSideWindowMissionListMissionWithId(2, SeaFrontGroup.MEMN)
    cy.contains('Supprimer la mission').should('be.disabled')

    // But we should be able to delete a CNSP one:
    const missionId = 4
    editSideWindowMissionListMissionWithId(missionId, SeaFrontGroup.MEMN)

    cy.intercept(
      { method: 'GET', url: `/api/v1/missions/${missionId}/can_delete?source=${Mission.MissionSource.MONITORFISH}` },
      FAKE_MISSION_WITHOUT_EXTERNAL_ACTIONS
    ).as('canDeleteMission')

    cy.intercept('DELETE', `api/v2/missions/${missionId}?source=${Mission.MissionSource.MONITORFISH}`, {
      statusCode: 204
    }).as('deleteMission')

    cy.clickButton('Supprimer la mission')

    cy.wait('@canDeleteMission').then(({ response }) => {
      expect(response && response.statusCode).equal(200)
      expect(response && response.body.canDelete).equal(true)
    })

    cy.get('.Component-Dialog').should('be.visible')

    cy.clickButton('Retourner à l’édition')

    cy.get('.Component-Dialog').should('not.exist')

    cy.clickButton('Supprimer la mission')

    cy.get('.Component-Dialog').should('be.visible')

    cy.clickButton('Confirmer la suppression')

    cy.wait('@deleteMission')

    cy.get('h1').should('contain.text', 'Missions en MEMN')
  })

  it('Should display an error message When a mission could not be fetched', () => {
    cy.intercept(
      {
        method: 'GET',
        path: '/bff/v1/missions/6',
        times: 1
      },
      { statusCode: 400 }
    ).as('getMissionStubbed')
    cy.intercept(
      {
        method: 'GET',
        path: '/bff/v1/missions/6',
        times: 1
      },
      { statusCode: 400 }
    ).as('getMissionStubbed')
    cy.intercept(
      {
        method: 'GET',
        path: '/bff/v1/missions/6',
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

  it('A user can delete mission if control unit already engaged and be redirected to filtered mission list', () => {
    openSideWindowNewMission()

    cy.fill('Administration 1', 'Douane')
    cy.fill('Unité 1', 'BGC Lorient - DF 36 Kan An Avel')

    // Then
    cy.get('body').contains('Une autre mission, ouverte par le CNSP, est en cours avec cette unité.')
    cy.clickButton("Non, l'abandonner")

    cy.intercept('GET', '/bff/v1/missions*').as('getMissions')

    cy.get('.TableBody').should('have.length.to.be.greaterThan', 0)
  })

  it('A user can create mission even if control unit already engaged', () => {
    cy.intercept('POST', '/api/v1/missions').as('createMission')

    openSideWindowNewMission()

    const endDate = getUtcDateInMultipleFormats(customDayjs().utc().add(7, 'day').toISOString())
    cy.fill('Fin de mission', endDate.utcDateTupleWithTime)
    cy.fill('Administration 1', 'Douane')
    cy.fill('Unité 1', 'BGC Lorient - DF 36 Kan An Avel')

    cy.get('body').contains('Une autre mission, ouverte par le CNSP, est en cours avec cette unité.')
    cy.getDataCy('add-other-control-unit').should('be.disabled')
    cy.clickButton('Oui, la conserver')
    cy.getDataCy('add-other-control-unit').should('not.be.disabled')

    cy.waitForLastRequest('@createMission', {}, 5).its('response.statusCode').should('eq', 200)
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

    cy.window()
      .its('mockEventSources' as any)
      .then(mockEventSources => {
        // URL sur la CI : http://0.0.0.0:8081/api/v1/missions/sse'
        // URL en local : //localhost:8081/api/v1/missions/sse
        mockEventSources['http://0.0.0.0:8081/api/v1/missions/sse'].emitOpen()
        mockEventSources['http://0.0.0.0:8081/api/v1/missions/sse'].emit(
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
              endDateTimeUtc: '2070-02-13T09:49:40.350661Z',
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
    // We stub the response as the DELETE request was mocked
    cy.intercept('GET', '/bff/v1/mission_actions?missionId=43', {
      body: [],
      statusCode: 200
    })

    // We modify the comment
    cy.wait(250)
    cy.fill('CNSP : orientations, observations', '')
    cy.fill('CNSP : orientations, observations', 'Une autre note.')

    cy.waitForLastRequest(
      '@updateMission',
      {
        body: {
          endDateTimeUtc: '2070-02-13T09:49:40.350661Z',
          isUnderJdp: true,
          observationsCnsp: 'Une autre note.'
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)

    cy.fill('Contact de l’unité 1', 'Tel. 06 88 65 66 66')

    cy.waitForLastRequest(
      '@updateMission',
      {
        body: {
          controlUnits: [
            {
              contact: 'Tel. 06 88 65 66 66'
            }
          ],
          isUnderJdp: true,
          observationsCnsp: 'Une autre note.'
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })

  it('Should update the form When receiving a mission update and doing modification right after', () => {
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

    cy.window()
      .its('mockEventSources' as any)
      .then(mockEventSources => {
        // URL sur la CI : http://0.0.0.0:8081/api/v1/missions/sse'
        // URL en local :  //localhost:8081/api/v1/missions/sse
        mockEventSources['http://0.0.0.0:8081/api/v1/missions/sse'].emitOpen()
        mockEventSources['http://0.0.0.0:8081/api/v1/missions/sse'].emit(
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
              endDateTimeUtc: '2070-02-13T09:49:40.350661Z',
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
    // We stub the response as the DELETE request was mocked
    cy.intercept('GET', '/bff/v1/mission_actions?missionId=43', {
      body: [],
      statusCode: 200
    })

    // We modify the comment
    cy.wait(250)
    cy.fill('CNSP : orientations, observations', '')
    cy.fill('CNSP : orientations, observations', 'Une autre note.')

    cy.window()
      .its('mockEventSources' as any)
      .then(mockEventSources => {
        // URL sur la CI : http://0.0.0.0:8081/api/v1/missions/sse
        // URL en local : //localhost:8081/api/v1/missions/sse
        mockEventSources['http://0.0.0.0:8081/api/v1/missions/sse'].emitOpen()
        mockEventSources['http://0.0.0.0:8081/api/v1/missions/sse'].emit(
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
              endDateTimeUtc: '2070-02-13T09:49:40.350661Z',
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
              isUnderJdp: true,
              missionSource: 'MONITORENV',
              missionTypes: ['SEA'],
              observationsCacem: 'Anything box film quality. Lot series agent out rule end young pressure.',
              observationsCnsp: 'Une observation à la dernière minute.',
              // MODIFIED FIELD
              openBy: 'Darren Better Clark',
              // MODIFIED FIELD
              startDateTimeUtc: '2023-02-05T23:08:54.923703Z'
            })
          })
        )
      })
    cy.wait(250)

    cy.fill('CNSP : orientations, observations', 'Une autre note (dummy updtae to send a request).')

    cy.waitForLastRequest(
      '@updateMission',
      {
        body: {
          openBy: 'Darren Better Clark',
          startDateTimeUtc: '2023-02-05T23:08:54.923703Z'
        }
      },
      5
    )
      .its('response.statusCode')
      .should('eq', 201)
  })
})
