import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const StageColumnHeader = ({ title, description, numberOfItems }) => {
  return <Wrapper style={wrapperStyle}>
    <Row
      data-cy={'side-window-beacon-statuses-header'}
      style={rowStyle}
    >
      <Title style={titleStyle}>
        {title}
      </Title>
      <NumberOfItems style={numberOfItemsStyle}>
        {numberOfItems}
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
  marginBottom: 3
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
  borderRadius: 10,
  width: 14,
  paddingLeft: 6,
  marginLeft: 'auto'
}

export default StageColumnHeader
