import { getLayerNameNormalized } from '../../../entities/layers'
import { Layer } from '../../../entities/layers/constants'
import { getVectorOLLayer } from './showRegulatoryZone'

export const getRegulatoryLayersToAdd = (olLayers, showedLayers) => (dispatch, getState) => {
  if (!showedLayers.length) {
    return []
  }

  const layersToInsert = showedLayers
    .filter(layer => layersNotInCurrentOLMap(olLayers, layer))
    .filter(layer => layersOfTypeRegulatoryLayer(layer))

  return layersToInsert
    .map(layerToInsert => {
      if (!layerToInsert) {
        return undefined
      }
      const getVectorLayerClosure = getVectorOLLayer(dispatch, getState)

      return getVectorLayerClosure(layerToInsert)
    })
    .filter(layer => layer)
}

function layersNotInCurrentOLMap(olLayers, layer) {
  return !olLayers.some(olLayer => olLayer.name === getLayerNameNormalized({ type: Layer.REGULATORY.code, ...layer }))
}

function layersOfTypeRegulatoryLayer(layer) {
  return layer.type === Layer.REGULATORY.code
}
