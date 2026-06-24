import { VESSEL_SELECTOR_STYLE } from '@features/Vessel/types/vessel'
import { THEME } from '@mtes-mct/monitor-ui'
import { type FeatureLike } from 'ol/Feature'
import { Icon, Style } from 'ol/style'

import { degreesToRadian } from '../VesselsLayer/style'

export const getSelectedVesselStyle = (isLight: boolean) => (feature: FeatureLike) => {
  const course = feature.get('course')

  const vesselStyle = new Style({
    image: new Icon({
      color: isLight ? THEME.color.lightGray : THEME.color.charcoal,
      offset: [0, 50],
      opacity: 1,
      rotation: degreesToRadian(course),
      scale: 0.8,
      size: [50, 50],
      src: 'map-icons/boat_icons.png'
    }),
    zIndex: VESSEL_SELECTOR_STYLE
  })

  return [vesselStyle]
}
