"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockConsole = mockConsole;
var globals_1 = require("@jest/globals");
function mockConsole() {
    var originalConsole = {};
    var methods = ['error', 'group', 'info', 'log', 'warning'];
    (0, globals_1.beforeAll)(function () {
        methods.forEach(function (method) {
            originalConsole[method] = console[method];
            console[method] = globals_1.jest.fn();
        });
    });
    (0, globals_1.afterAll)(function () {
        methods.forEach(function (method) {
            console[method] = originalConsole[method];
        });
    });
}
