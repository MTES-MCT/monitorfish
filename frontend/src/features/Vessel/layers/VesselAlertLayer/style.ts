import { VESSEL_ALERT_STYLE } from '@features/Vessel/types/vessel'
import { Icon, Style } from 'ol/style'

const vesselAlertBigCircleStyle = new Style({
  image: new Icon({
    src: 'map-icons/Double-cercle-alertes.png'
  }),
  zIndex: VESSEL_ALERT_STYLE
})

export const getVesselAlertStyle = (resolution: number) => {
  const styles = [vesselAlertBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage()?.setScale(scale)

  return styles
}
