import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { beaconStatusesStages } from './beaconStatuses'

const MAX_END_OF_FOLLOW_UP_ITEMS = 30

const StageColumnHeader = ({ stage, description, numberOfItems }) => {
  return <Wrapper style={wrapperStyle}>
    <Row
      data-cy={'side-window-beacon-statuses-header'}
      style={rowStyle}
    >
      <Title style={titleStyle}>
        {stage}
      </Title>
      <NumberOfItems style={numberOfItemsStyle}>
        {
          stage === beaconStatusesStages.END_OF_FOLLOW_UP.code && numberOfItems === MAX_END_OF_FOLLOW_UP_ITEMS
            ? `${MAX_END_OF_FOLLOW_UP_ITEMS}+`
            : numberOfItems
        }
      </NumberOfItems>
    </Row>
    <Description style={descriptionStyle}>
      {description}
    </Description>
  </Wrapper>
}

const Wrapper = styled.div``
const wrapperStyle = {
  color: COLORS.slateGray,
  padding: 15,
  height: 95,
  borderBottom: `1px solid ${COLORS.lightGray}`,
  marginBottom: 3,
  background: COLORS.gainsboro
}

const Row = styled.div``
const rowStyle = {
  display: 'flex'
}

const Title = styled.div``
const titleStyle = {
  fontWeight: 700,
  textTransform: 'uppercase'
}

const Description = styled.div``
const descriptionStyle = {
  marginTop: 15
}

const NumberOfItems = styled.div``
const numberOfItemsStyle = {
  fontWeight: 700,
  background: COLORS.lightGray,
  borderRadius: 2,
  padding: '0px 5px',
  direction: 'rtl',
  marginLeft: 'auto'
}

export default StageColumnHeader
