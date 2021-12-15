import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const StageColumnHeader = ({ title, description, numberOfItems }) => {
  return <Wrapper>
    <Row>
      <Title>
        {title}
      </Title>
      <NumberOfItems>
        {numberOfItems}
      </NumberOfItems>
    </Row>
    <Description>
      {description}
    </Description>
  </Wrapper>
}

const Wrapper = styled.div`
  color: ${COLORS.slateGray};
  padding: 15px;
  height: 95px;
  border-bottom: 1px solid ${COLORS.lightGray};
  margin-bottom: 3px;
`

const Row = styled.div`
  display: flex;
`

const Title = styled.div`
  font-weight: 700;
`

const Description = styled.div`
  margin-top: 15px;
`

const NumberOfItems = styled.div`
  font-weight: 700;
  background: ${COLORS.lightGray};
  border-radius: 10px;
  width: 14px;
  padding-left: 6px;
  margin-left: auto;
`

export default StageColumnHeader
