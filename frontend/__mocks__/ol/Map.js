class MockedMap {}
MockedMap.prototype.getCoordinateFromPixel = jest.fn()
MockedMap.prototype.getPixelFromCoordinate = jest.fn()

module.exports = MockedMap
module.exports.default = MockedMap
