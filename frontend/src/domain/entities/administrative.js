import { getLayerNameNormalized } from './layers'

export function layersNotInCurrentOLMap (olLayers, layer) {
  return !olLayers.getArray().some(layer_ => layer_.name === getLayerNameNormalized(layer))
}

export function layerOfTypeAdministrativeLayer (administrativeLayers, layer) {
  return administrativeLayers
    .some(administrativeLayer => layer.type?.includes(administrativeLayer.code))
}

export function layerOfTypeAdministrativeLayerInCurrentMap (administrativeLayers, olLayer) {
  return administrativeLayers
    .some(administrativeLayer => olLayer.name?.includes(administrativeLayer.code))
}

export function layersNotInShowedLayers (_showedLayers, olLayer) {
  return !_showedLayers.some(layer_ => getLayerNameNormalized(layer_) === olLayer.name)
}
