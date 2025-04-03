import { VESSEL_ALERT_AND_BEACON_MALFUNCTION } from '@features/Vessel/types/vessel'
import { Icon, Style } from 'ol/style'

const vesselAlertAndBeaconMalfunctionBigCircleStyle = new Style({
  image: new Icon({
    src: 'map-icons/Triple-cercle_alerte_et_avarie.png'
  }),
  zIndex: VESSEL_ALERT_AND_BEACON_MALFUNCTION
})

export const getVesselAlertAndBeaconMalfunctionStyle = (resolution: number) => {
  const styles = [vesselAlertAndBeaconMalfunctionBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage()?.setScale(scale)

  return styles
}
