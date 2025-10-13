"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var seafront_1 = require("@constants/seafront");
var utils_1 = require("./side_window/alert_list/utils");
var utils_2 = require("./side_window/beacon_malfunction/utils");
var utils_3 = require("./side_window/manual_prior_notification_form/utils");
var utils_4 = require("./side_window/mission_form/utils");
var utils_5 = require("./side_window/mission_list/utils");
var utils_6 = require("./side_window/prior_notification_list/utils");
context('Axe core RGAA check that ', function () {
    describe('Home page ', function () {
        beforeEach(function () {
            cy.login('superuser');
            cy.wait(500);
            cy.visit('/#@-824534.42,6082993.21,8.70');
            cy.wait(3000);
        });
        it('should respect RGAA criteria', function () {
            injectAndRunRGAACheck();
        });
        it('control unit panel should respect RGAA criteria', function () {
            cy.clickButton('Liste des unités de contrôle');
            injectAndRunRGAACheck();
        });
        it('last position panel should respect RGAA criteria', function () {
            cy.clickButton('Affichage des dernières positions');
            injectAndRunRGAACheck();
        });
        it('interest point panel should respect RGAA criteria', function () {
            cy.clickButton("Créer un point d'intérêt");
            injectAndRunRGAACheck();
        });
        it('my account panel should respect RGAA criteria', function () {
            cy.clickButton('Mon compte');
            injectAndRunRGAACheck();
        });
        it('new features panel should respect RGAA criteria', function () {
            cy.clickButton('Nouveautés MonitorFish');
            injectAndRunRGAACheck();
        });
    });
    describe('Vessel list ', function () {
        it('should respect RGAA criteria', function () {
            cy.login('superuser');
            cy.visit('/side_window');
            cy.wait(250);
            cy.getDataCy('side-window-menu-vessel-list').click();
            cy.fill('En mer', false);
            injectAndRunRGAACheck();
        });
    });
    describe('Vessel Group ', function () {
        beforeEach(function () {
            cy.login('superuser');
            cy.visit('/side_window');
            cy.wait(250);
            cy.getDataCy('side-window-menu-vessel-list').click();
        });
        it('list should respect RGAA criteria', function () {
            cy.get('[title="Groupes de navires"]').click();
            cy.get('[title="Mission Thémis – chaluts de fonds"]').click();
            injectAndRunRGAACheck();
        });
        it('form should respect RGAA criteria', function () {
            cy.clickButton('Créer un groupe de navires');
            cy.clickButton('Créer un groupe dynamique');
            injectAndRunRGAACheck();
        });
    });
    describe('Missions ', function () {
        it('list should respect RGAA criteria', function () {
            (0, utils_5.openSideWindowMissionList)();
            injectAndRunRGAACheck();
        });
        it('form should respect RGAA criteria', function () {
            (0, utils_4.openSideWindowNewMission)();
            cy.clickButton('Ajouter');
            cy.clickButton('Ajouter un contrôle en mer');
            cy.get('*[data-cy="action-list-item"]').contains('Contrôle en mer');
            injectAndRunRGAACheck();
        });
    });
    describe('Alert ', function () {
        it('list should respect RGAA criteria', function () {
            (0, utils_1.openSideWindowAlertList)();
            cy.getDataCy("side-window-sub-menu-".concat(seafront_1.SeafrontGroup.NAMO)).click();
            injectAndRunRGAACheck();
        });
    });
    describe('Reportings ', function () {
        it('list should respect RGAA criteria', function () {
            cy.login('superuser');
            cy.visit('/side_window');
            cy.wait(500);
            cy.getDataCy('side-window-reporting-tab').click();
            cy.getDataCy('side-window-sub-menu-NAMO').click();
            injectAndRunRGAACheck();
        });
    });
    describe('Prior notification ', function () {
        it('list should respect RGAA criteria', function () {
            (0, utils_6.openSideWindowPriorNotificationListAsSuperUser)();
            injectAndRunRGAACheck();
        });
        it('form should respect RGAA criteria', function () {
            (0, utils_3.addManualSideWindowPriorNotification)();
            injectAndRunRGAACheck(true);
        });
    });
    describe('Beacon malfunction ', function () {
        it('board should respect RGAA criteria', function () {
            (0, utils_2.openSideWindowBeaconMalfunctionBoard)();
            injectAndRunRGAACheck();
        });
    });
});
var injectAndRunRGAACheck = function (disableLabelRule) {
    if (disableLabelRule === void 0) { disableLabelRule = false; }
    cy.injectAxe();
    // @ts-ignore
    cy.checkA11y(null, {
        rules: __assign({ 'color-contrast': { enabled: false } }, (disableLabelRule && { 'label': { enabled: false } })),
        runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa']
        }
    });
};
