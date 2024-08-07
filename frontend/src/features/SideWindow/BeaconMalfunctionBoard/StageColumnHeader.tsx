import styled from 'styled-components'

import { STAGE_RECORD } from '../../../domain/entities/beaconMalfunction/constants'

const MAX_ARCHIVED_ITEMS = 60

type StageColumnHeaderProps = {
  description?: string | undefined
  numberOfItems: number
  stage: string
}
export function StageColumnHeader({ description, numberOfItems, stage }: StageColumnHeaderProps) {
  return (
    <Wrapper>
      <Row data-cy="side-window-beacon-malfunctions-header">
        <Title>{stage}</Title>
        <NumberOfItems>
          {stage === STAGE_RECORD.ARCHIVED.title && numberOfItems === MAX_ARCHIVED_ITEMS
            ? `${MAX_ARCHIVED_ITEMS}+`
            : numberOfItems}
        </NumberOfItems>
      </Row>
      <Description>{description || ''}</Description>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${p => p.theme.color.gainsboro};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.slateGray};
  height: 95px;
  margin-bottom: 3px;
  padding: 15px;
  white-space: pre-line;
`

const Row = styled.div`
  display: flex;
`

const Title = styled.div`
  font-weight: 700;
  text-transform: uppercase;
`

const Description = styled.div`
  margin-top: 15px;
`

const NumberOfItems = styled.div`
  background: ${p => p.theme.color.lightGray};
  border-radius: 2;
  direction: rtl;
  font-weight: 700;
  margin-left: auto;
  padding: 0px 5px;
`
