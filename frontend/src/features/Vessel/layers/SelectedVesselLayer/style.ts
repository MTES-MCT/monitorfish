import { degreesToRadian } from '@features/Vessel/layers/style'
import { VESSEL_SELECTOR_STYLE } from '@features/Vessel/types/vessel'
import { type FeatureLike } from 'ol/Feature'
import { Icon, Style } from 'ol/style'

import { theme } from '../../../../ui/theme'

export const getSelectedVesselStyle = (isLight: boolean) => (feature: FeatureLike) => {
  const course = feature.get('course')

  const vesselStyle = new Style({
    image: new Icon({
      color: isLight ? theme.color.lightGray : theme.color.charcoal,
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
