import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const MapPropertyTrigger = ({ booleanProperty, updateBooleanProperty, text, Icon, inverse }) => {
  const [value, setValue] = useState(undefined)

  useEffect(() => {
    if (booleanProperty !== undefined && value === undefined) {
      setValue(booleanProperty)
    }
  }, [booleanProperty])

  function update () {
    updateBooleanProperty(!value)
    setValue(!value)
  }

  return (
    <Wrapper>
      <Icon
        style={{
          width: 36,
          height: 36,
          background: value ? COLORS.shadowBlue : COLORS.charcoal,
          transition: 'all 0.2s',
          cursor: 'pointer'
        }}
        isSelected={value}
        onClick={update}
      />
      <ShowLabelText
        data-cy={'map-property-trigger'}
        onClick={update}
      >
        {
          inverse
            ? value ? 'Afficher' : 'Masquer'
            : value ? 'Masquer' : 'Afficher'
        }
        {''} {text}
      </ShowLabelText>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${COLORS.gainsboro};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  border-top: 1px solid ${COLORS.lightGray};
  text-align: left;
  height: 36px;
`

const ShowLabelText = styled.span`
  margin-left: 0;
  color: ${COLORS.slateGray};
  padding: 8.5px 10px;
  vertical-align: top;
  display: inline-block;
  cursor: pointer;
`

export default MapPropertyTrigger
