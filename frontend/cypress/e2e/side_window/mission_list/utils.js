"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSideWindowMissionListMissionWithId = exports.openSideWindowMissionList = void 0;
var constants_1 = require("@features/SideWindow/constants");
var eventsourcemock_1 = require("eventsourcemock");
var openSideWindowMissionList = function () {
    cy.viewport(1920, 1080);
    cy.login('superuser');
    cy.visit('/side_window', {
        onBeforeLoad: function (window) {
            Object.defineProperty(window, 'EventSource', { value: eventsourcemock_1.default });
            Object.defineProperty(window, 'mockEventSources', { value: eventsourcemock_1.sources });
        }
    });
    cy.wait(500);
    if (document.querySelector('[data-cy="first-loader"]')) {
        cy.getDataCy('first-loader').should('not.be.visible');
    }
    cy.clickButton(constants_1.SideWindowMenuLabel.MISSION_LIST);
    if (document.querySelector('[data-cy="first-loader"]')) {
        cy.getDataCy('first-loader').should('not.be.visible');
    }
    cy.wait(500);
};
exports.openSideWindowMissionList = openSideWindowMissionList;
var editSideWindowMissionListMissionWithId = function (missionId, seafrontGroup) {
    (0, exports.openSideWindowMissionList)();
    if (seafrontGroup) {
        cy.getDataCy("side-window-sub-menu-".concat(seafrontGroup)).click();
    }
    cy.get('.Table').find(".TableBodyRow[data-id=\"".concat(missionId, "\"]")).clickButton('Éditer la mission');
    if (document.querySelector('[data-cy="first-loader"]')) {
        cy.getDataCy('first-loader').should('not.be.visible');
    }
    cy.wait(500);
};
exports.editSideWindowMissionListMissionWithId = editSideWindowMissionListMissionWithId;
