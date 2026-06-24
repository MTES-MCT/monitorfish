import { VESSEL_INFRACTION_SUSPICION_STYLE } from '@features/Vessel/types/vessel'
import { THEME } from '@mtes-mct/monitor-ui'
import { Style } from 'ol/style'
import Circle from 'ol/style/Circle'
import Stroke from 'ol/style/Stroke'

const vesselInfractionSuspicionCircleStyle = new Style({
  image: new Circle({
    fill: undefined,
    radius: 19,
    stroke: new Stroke({
      color: THEME.color.maximumRed,
      width: 2
    })
  }),
  zIndex: VESSEL_INFRACTION_SUSPICION_STYLE
})

export const getVesselInfractionSuspicionStyle = (resolution: number) => {
  const styles = [vesselInfractionSuspicionCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage()?.setScale(scale)

  return styles
}
