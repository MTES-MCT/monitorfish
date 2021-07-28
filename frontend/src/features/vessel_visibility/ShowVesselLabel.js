import React, { useEffect, useState } from 'react'
import { Checkbox } from 'rsuite'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const ShowVesselLabel = ({ vesselLabelsShowedOnMap, updateVesselLabelsShowedOnMap }) => {
  const [value, setValue] = useState(undefined)

  useEffect(() => {
    if (vesselLabelsShowedOnMap !== undefined && value === undefined) {
      setValue(vesselLabelsShowedOnMap)
    }
  }, [vesselLabelsShowedOnMap])

  return (
    <Wrapper>
      {value !== undefined
        ? <RadioWrapper>
          <Checkbox
            checked={value}
            onChange={(value, isChecked) => {
              updateVesselLabelsShowedOnMap(isChecked)
              setValue(isChecked)
            }}

          >{' '} <ShowLabelText>Afficher les étiquettes des navires</ShowLabelText></Checkbox>
        </RadioWrapper>
        : null
      }
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${COLORS.gainsboro};
  padding: 0 0 9px 7px;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  border-top: 1px solid ${COLORS.squareBorder};
`

const ShowLabelText = styled.span`
  margin-left: 0;
  color: ${COLORS.slateGray};
`

const RadioWrapper = styled.div`
  padding: 0;
  font-size: 13px;
  text-align: left;
`

export default ShowVesselLabel
