import React, { useEffect, useState } from 'react'
import { Checkbox } from 'rsuite'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const HideNonFilteredVessels = ({ nonFilteredVesselsAreHidden, setNonFilteredVesselsAreHidden }) => {
  const [value, setValue] = useState(undefined)

  useEffect(() => {
    if (nonFilteredVesselsAreHidden !== undefined && value === undefined) {
      setValue(nonFilteredVesselsAreHidden)
    }
  }, [nonFilteredVesselsAreHidden])

  return (
    <Wrapper>
      {value !== undefined
        ? <RadioWrapper>
          <Checkbox
            checked={value}
            onChange={(value, isChecked) => {
              setNonFilteredVesselsAreHidden(isChecked)
              setValue(isChecked)
            }}

          >{' '} <ShowLabelText data-cy={'vessel-filters-hide-other-vessels'}>Masquer les autres navires</ShowLabelText></Checkbox>
        </RadioWrapper>
        : null
      }
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${COLORS.gainsboro};
  padding: 0 0 9px 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
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

export default HideNonFilteredVessels
