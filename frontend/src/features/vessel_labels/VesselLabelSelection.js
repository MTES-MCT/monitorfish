import React from 'react'
import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'
import { vesselLabel } from '../../domain/entities/vesselLabelLine'

const VesselLabelSelection = props => {
  return props.vesselLabel
    ? (<RadioWrapper>
      <RadioGroup
        name="vesselLabelRadio"
        value={props.vesselLabel}
        onChange={value => {
          props.updateVesselLabel(value)
        }}
      >
        <Radio value={vesselLabel.VESSEL_NATIONALITY}>Nationalité (nom)</Radio>
        <Radio value={vesselLabel.VESSEL_NAME}>Nom du navire</Radio>
        <Radio value={vesselLabel.VESSEL_FLEET_SEGMENT}>Segment de flotte</Radio>
      </RadioGroup>
    </RadioWrapper>
      )
    : null
}

const RadioWrapper = styled.div`
  padding: 0 0 20px 10px;
  font-size: 13px;
  text-align: left;
`

export default VesselLabelSelection
