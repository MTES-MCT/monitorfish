import React from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

function MapPropertyTrigger({ booleanProperty, disabled, Icon, inverse, text, updateBooleanProperty }) {
  function update() {
    if (!disabled) {
      updateBooleanProperty(!booleanProperty)
    }
  }

  return (
    <Wrapper disabled={disabled} onClick={update}>
      <Icon
        style={{
          background: booleanProperty ? COLORS.shadowBlue : COLORS.charcoal,
          cursor: disabled ? 'not-allowed' : 'pointer',
          height: 36,
          transition: 'all 0.2s',
          width: 36,
        }}
      />
      <ShowLabelText data-cy="map-property-trigger">
        {inverse ? (booleanProperty ? 'Afficher' : 'Masquer') : booleanProperty ? 'Masquer' : 'Afficher'}
        {text}
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
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`

const ShowLabelText = styled.span`
  margin-left: 0;
  color: ${COLORS.slateGray};
  padding: 8.5px 10px;
  vertical-align: top;
  display: inline-block;
`

export default MapPropertyTrigger
