import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'
import { label } from '../../../../domain/entities/vessel/label/types'

const VesselLabelSelection = ({ vesselLabel, updateVesselLabel, isAdmin }) => {
  return (
    <>
      {vesselLabel
        ? <RadioWrapper>
          <RadioGroup
            name="vesselLabelRadio"
            value={vesselLabel}
            onChange={updateVesselLabel}
          >
            <Radio value={label.VESSEL_NATIONALITY}>Nationalité (nom)</Radio>
            <Radio value={label.VESSEL_NAME}>Nom du navire</Radio>
            <Radio value={label.VESSEL_INTERNAL_REFERENCE_NUMBER}>CFR</Radio>
            {
              isAdmin
                ? <Radio value={label.VESSEL_FLEET_SEGMENT}>Segment de flotte</Radio>
                : null
            }
          </RadioGroup>
        </RadioWrapper>
        : null
      }
    </>
  )
}

const RadioWrapper = styled.div`
  padding: 0 0 20px 10px;
  font-size: 13px;
  text-align: left;
`

export default VesselLabelSelection
