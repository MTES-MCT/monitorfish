import { VESSEL_BEACON_MALFUNCTION_STYLE } from '@features/Vessel/types/vessel'
import { Icon, Style } from 'ol/style'

const vesselBeaconMalfunctionBigCircleStyle = new Style({
  image: new Icon({
    src: 'map-icons/Double-cercle_avaries.png'
  }),
  zIndex: VESSEL_BEACON_MALFUNCTION_STYLE
})

export const getVesselBeaconMalfunctionStyle = (resolution: number) => {
  const styles = [vesselBeaconMalfunctionBigCircleStyle]

  const scale = Math.min(1, 0.3 + Math.sqrt(200 / resolution))
  styles[0]?.getImage()?.setScale(scale)

  return styles
}
