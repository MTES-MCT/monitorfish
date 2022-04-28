import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const MapPropertyTrigger = ({ booleanProperty, updateBooleanProperty, text, Icon, inverse, disabled }) => {
  function update () {
    if (!disabled) {
      updateBooleanProperty(!booleanProperty)
    }
  }

  return (
    <Wrapper
      onClick={update}
      disabled={disabled}
    >
      <Icon
        style={{
          width: 36,
          height: 36,
          background: booleanProperty ? COLORS.shadowBlue : COLORS.charcoal,
          transition: 'all 0.2s',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      />
      <ShowLabelText
        data-cy={'map-property-trigger'}
      >
        {
          inverse
            ? booleanProperty ? 'Afficher' : 'Masquer'
            : booleanProperty ? 'Masquer' : 'Afficher'
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
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`

const ShowLabelText = styled.span`
  margin-left: 0;
  color: ${COLORS.slateGray};
  padding: 8.5px 10px;
  vertical-align: top;
  display: inline-block;
`

export default MapPropertyTrigger
