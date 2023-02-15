import { platformModifierKeyOnly } from 'ol/events/condition'

import { MonitorFishMap } from './MonitorFishMap'
import { HIT_PIXEL_TO_TOLERANCE } from '../../constants/constants'

import type Feature from 'ol/Feature'
import type { Promisable } from 'type-fest'

type MapClickEvent = {
  ctrlKeyPressed: boolean
  feature: Feature | undefined
}
export function onMapClick(callback: (event: MapClickEvent) => Promisable<void>) {
  MonitorFishMap.on('click', event => {
    const feature = MonitorFishMap.forEachFeatureAtPixel(event.pixel, _feature => _feature, {
      hitTolerance: HIT_PIXEL_TO_TOLERANCE
    }) as Feature
    const isCtrl = platformModifierKeyOnly(event)

    callback({ ctrlKeyPressed: isCtrl, feature })
  })
}
