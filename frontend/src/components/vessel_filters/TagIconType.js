import React from 'react'
import styled from 'styled-components'
import { ReactComponent as FilterZoneSVG } from '../icons/Label_zone.svg'
import { ReactComponent as FilterGearSVG } from '../icons/Label_engin_de_peche.svg'
import { ReactComponent as FilterFleetSegmentSVG } from '../icons/Label_segment_de_flotte.svg'
import { ReactComponent as FilterSpeciesSVG } from '../icons/Label_poisson.svg'
import { ReactComponent as FilterDistrictSVG } from '../icons/Label_quartier.svg'
import { ReactComponent as FilterLengthSVG } from '../icons/Label_taille_navire.svg'

const Zone = styled(FilterZoneSVG)`
  height: 13px;
  margin-right: 2px;
  margin-left: -4px;
  width: 22px;
  margin-top: 4px;
`

const Gear = styled(FilterGearSVG)`
  height: 13px;
  margin-right: 2px;
  margin-left: -4px;
  width: 22px;
  margin-top: 4px;
`

const Species = styled(FilterSpeciesSVG)`
  height: 10px;
  margin-right: 2px;
  margin-left: -2px;
  width: 22px;
  margin-top: 6px;
`

const FleetSegment = styled(FilterFleetSegmentSVG)`
  height: 13px;
  margin-right: 2px;
  margin-left: -4px;
  width: 22px;
  margin-top: 4px;
`

const District = styled(FilterDistrictSVG)`
  height: 13px;
  margin-right: 2px;
  margin-left: -4px;
  width: 22px;
  margin-top: 4px;
`

const Length = styled(FilterLengthSVG)`
  height: 10px;
  margin-right: 2px;
  margin-left: -3px;
  width: 22px;
  margin-top: 4px;
`

export const IconTypes = {
  FLEET_SEGMENT: <FleetSegment />,
  ZONE: <Zone />,
  GEAR: <Gear />,
  SPECIES: <Species />,
  LENGTH: <Length />,
  DISTRICTS: <District />
}
