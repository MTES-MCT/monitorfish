export const WSG84_PROJECTION = 'EPSG:4326'
export const OPENLAYERS_PROJECTION = 'EPSG:3857'

export const getRiskFactorColor = riskFactor => {
  if (riskFactor >= 1 && riskFactor < 1.75) {
    return '#8E9A9F'
  } else if (riskFactor >= 1.75 && riskFactor < 2.5) {
    return '#B89B8C'
  } else if (riskFactor >= 2.5 && riskFactor < 3.25) {
    return '#CF6A4E'
  } else if (riskFactor >= 3.25 && riskFactor <= 4) {
    return '#A13112'
  }
}
