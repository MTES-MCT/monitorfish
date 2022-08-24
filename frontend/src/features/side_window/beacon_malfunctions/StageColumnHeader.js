import React from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionsStages } from '../../../domain/entities/beaconMalfunction'

const MAX_ARCHIVED_ITEMS = 30

function StageColumnHeader({ description, numberOfItems, stage }) {
  return (
    <Wrapper style={wrapperStyle}>
      <Row data-cy="side-window-beacon-malfunctions-header" style={rowStyle}>
        <Title style={titleStyle}>{stage}</Title>
        <NumberOfItems style={numberOfItemsStyle}>
          {stage === beaconMalfunctionsStages.ARCHIVED.code && numberOfItems === MAX_ARCHIVED_ITEMS
            ? `${MAX_ARCHIVED_ITEMS}+`
            : numberOfItems}
        </NumberOfItems>
      </Row>
      <Description style={descriptionStyle}>{description}</Description>
    </Wrapper>
  )
}

const Wrapper = styled.div``
const wrapperStyle = {
  background: COLORS.gainsboro,
  borderBottom: `1px solid ${COLORS.lightGray}`,
  color: COLORS.slateGray,
  height: 95,
  marginBottom: 3,
  padding: 15,
  whiteSpace: 'pre-line',
}

const Row = styled.div``
const rowStyle = {
  display: 'flex',
}

const Title = styled.div``
const titleStyle = {
  fontWeight: 700,
  textTransform: 'uppercase',
}

const Description = styled.div``
const descriptionStyle = {
  marginTop: 15,
}

const NumberOfItems = styled.div``
const numberOfItemsStyle = {
  background: COLORS.lightGray,
  borderRadius: 2,
  direction: 'rtl',
  fontWeight: 700,
  marginLeft: 'auto',
  padding: '0px 5px',
}

export default StageColumnHeader
