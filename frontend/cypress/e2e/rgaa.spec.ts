import { SeafrontGroup } from '@constants/seafront'

import { openSideWindowAlertList } from './side_window/alert_list/utils'
import { openSideWindowBeaconMalfunctionBoard } from './side_window/beacon_malfunction/utils'
import { addManualSideWindowPriorNotification } from './side_window/manual_prior_notification_form/utils'
import { openSideWindowNewMission } from './side_window/mission_form/utils'
import { openSideWindowMissionList } from './side_window/mission_list/utils'
import { openSideWindowPriorNotificationListAsSuperUser } from './side_window/prior_notification_list/utils'

context('Axe core RGAA check that ', () => {
  describe('Home page ', () => {
    it('should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.wait(500)
      cy.visit('/#@-824534.42,6082993.21,8.70')
      cy.wait(500)

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
    it('control unit panel should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.wait(500)
      cy.visit('/#@-824534.42,6082993.21,8.70')
      cy.wait(500)
      cy.clickButton('Liste des unités de contrôle')

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
    it('last position panel should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.wait(500)
      cy.visit('/#@-824534.42,6082993.21,8.70')
      cy.wait(500)
      cy.clickButton('Affichage des dernières positions')

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

    it('interest point panel should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.wait(500)
      cy.visit('/#@-824534.42,6082993.21,8.70')
      cy.wait(500)
      cy.clickButton("Créer un point d'intérêt")

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
    it('my account panel should respect RGAA criteria', () => {
      cy.wait(500)
      cy.visit('/#@-824534.42,6082993.21,8.70')
      cy.wait(500)
      cy.clickButton('Mon compte')

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
    it('new features panel should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.wait(500)
      cy.visit('/#@-824534.42,6082993.21,8.70')
      cy.wait(500)
      cy.clickButton('Nouveautés MonitorFish')

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

  describe('Vessel list ', () => {
    it('should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.visit('/side_window')
      cy.wait(250)
      cy.getDataCy('side-window-menu-vessel-list').click()
      cy.fill('En mer', false)
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

  describe('Vessel Group ', () => {
    it('list should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.visit('/side_window')
      cy.wait(250)
      cy.getDataCy('side-window-menu-vessel-list').click()
      cy.get('[title="Groupes de navires"]').click()
      cy.get('[title="Mission Thémis – chaluts de fonds"]').click()
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

    it('form should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.visit('/side_window')
      cy.wait(250)
      cy.getDataCy('side-window-menu-vessel-list').click()
      cy.clickButton('Créer un groupe de navires')
      cy.clickButton('Créer un groupe dynamique')
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
  describe('Missions ', () => {
    it('list should respect RGAA criteria', () => {
      openSideWindowMissionList()
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

    it('form should respect RGAA criteria', () => {
      openSideWindowNewMission()
      cy.clickButton('Ajouter')
      cy.clickButton('Ajouter un contrôle en mer')
      cy.get('*[data-cy="action-list-item"]').contains('Contrôle en mer')
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

  describe('Alert ', () => {
    it('list should respect RGAA criteria', () => {
      openSideWindowAlertList()
      cy.getDataCy(`side-window-sub-menu-${SeafrontGroup.NAMO}`).click()
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

  describe('Reportings ', () => {
    it('list should respect RGAA criteria', () => {
      cy.login('superuser')
      cy.visit('/side_window')
      cy.wait(500)
      cy.getDataCy('side-window-reporting-tab').click()
      cy.getDataCy('side-window-sub-menu-NAMO').click()
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

  describe('Prior notification ', () => {
    it('list should respect RGAA criteria', () => {
      openSideWindowPriorNotificationListAsSuperUser()
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
    it('form should respect RGAA criteria', () => {
      addManualSideWindowPriorNotification()

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

  describe('Beacon malfunction ', () => {
    it('board should respect RGAA criteria', () => {
      openSideWindowBeaconMalfunctionBoard()

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
