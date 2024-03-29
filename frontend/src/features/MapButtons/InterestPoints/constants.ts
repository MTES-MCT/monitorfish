import styled, { css } from 'styled-components'

import { InterestPointType } from '../../../domain/entities/interestPoints'
import ControlSVG from '../../icons/Label_controle.svg?react'
import GearSVG from '../../icons/Label_engin_de_peche.svg?react'
import VesselSVG from '../../icons/Label_segment_de_flotte.svg?react'
import OtherSVG from '../../icons/Point_interet_autre.svg?react'

import type { IconProps, Option } from '@mtes-mct/monitor-ui'
import type { FunctionComponent } from 'react'

const iconStyle = css`
  margin-left: 3px;
  margin-right: 7px;
  vertical-align: sub;
  width: 14px;
`

const Gear = styled(GearSVG)`
  ${iconStyle}
`

const Control = styled(ControlSVG)`
  ${iconStyle}
`

const Vessel = styled(VesselSVG)`
  ${iconStyle}
`

const Other = styled(OtherSVG)`
  ${iconStyle}
`

export type InterestPointOptionValueType = {
  Icon: FunctionComponent<IconProps>
  name: string
}
export const INTEREST_POINTS_OPTIONS: Array<Option<InterestPointOptionValueType>> = [
  {
    label: 'Moyen de contrôle',
    value: {
      Icon: Control,
      name: InterestPointType.CONTROL_ENTITY
    }
  },
  {
    label: 'Moyen de contrôle',
    value: {
      Icon: Vessel,
      name: InterestPointType.FISHING_VESSEL
    }
  },
  {
    label: 'Engin de pêche',
    value: {
      Icon: Gear,
      name: InterestPointType.FISHING_GEAR
    }
  },
  {
    label: 'Autre point',
    value: {
      Icon: Other,
      name: InterestPointType.OTHER
    }
  }
]
