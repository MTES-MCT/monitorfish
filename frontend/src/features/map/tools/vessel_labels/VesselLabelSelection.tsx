import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { VesselLabel } from '../../../../domain/entities/vessel/label/types'

export function VesselLabelSelection({ isAdmin, updateVesselLabel, vesselLabel }) {
  return (
    <>
      {vesselLabel && (
        <RadioWrapper>
          <RadioGroup name="vesselLabelRadio" onChange={updateVesselLabel} value={vesselLabel}>
            <Radio value={VesselLabel.VESSEL_NATIONALITY}>Nationalité (nom)</Radio>
            <Radio value={VesselLabel.VESSEL_NAME}>Nom du navire</Radio>
            <Radio value={VesselLabel.VESSEL_INTERNAL_REFERENCE_NUMBER}>CFR</Radio>
            {isAdmin && <Radio value={VesselLabel.VESSEL_FLEET_SEGMENT}>Segment de flotte</Radio>}
          </RadioGroup>
        </RadioWrapper>
      )}
    </>
  )
}

const RadioWrapper = styled.div`
  padding: 0 0 20px 10px;
  font-size: 13px;
  text-align: left;
`
