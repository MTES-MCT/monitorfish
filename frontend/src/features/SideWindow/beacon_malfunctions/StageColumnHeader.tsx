import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { STAGE_RECORD } from '../../../domain/entities/beaconMalfunction/constants'
import { archiveBeaconMalfunctions } from '../../../domain/use_cases/beaconMalfunction/archiveBeaconMalfunctions'
import { useAppDispatch } from '../../../hooks/useAppDispatch'

import type { CSSProperties } from 'react'

const MAX_ARCHIVED_ITEMS = 60

type StageColumnHeaderType = {
  description?: string
  ids: number[]
  numberOfItems: number
  stage: string
}
export function StageColumnHeader({ description, ids, numberOfItems, stage }: StageColumnHeaderType) {
  const dispatch = useAppDispatch()
  const showArchiveAll = useMemo(() => stage === STAGE_RECORD.END_OF_MALFUNCTION.title && ids.length > 0, [stage, ids])

  const archiveAll = useCallback(() => {
    // @ts-ignore
    dispatch(archiveBeaconMalfunctions(ids))
  }, [dispatch, ids])

  return (
    <Wrapper style={wrapperStyle}>
      <Row data-cy="side-window-beacon-malfunctions-header" style={rowStyle}>
        <Title style={titleStyle}>{stage}</Title>
        {showArchiveAll && (
          <ArchiveAll data-cy="side-window-beacon-malfunctions-archive-all" onClick={archiveAll}>
            Tout archiver
          </ArchiveAll>
        )}
        <NumberOfItems style={numberOfItemsStyle(showArchiveAll)}>
          {stage === STAGE_RECORD.ARCHIVED.title && numberOfItems === MAX_ARCHIVED_ITEMS
            ? `${MAX_ARCHIVED_ITEMS}+`
            : numberOfItems}
        </NumberOfItems>
      </Row>
      <Description style={descriptionStyle}>{description || ''}</Description>
    </Wrapper>
  )
}

const ArchiveAll = styled.a`
  margin-left: auto;
  margin-right: 6px;
  color: ${p => p.theme.color.slateGray};
  cursor: pointer;
  text-decoration: underline;
`

const Wrapper = styled.div``
const wrapperStyle: CSSProperties = {
  background: THEME.color.gainsboro,
  borderBottom: `1px solid ${THEME.color.lightGray}`,
  color: THEME.color.slateGray,
  height: 95,
  marginBottom: 3,
  padding: 15,
  whiteSpace: 'pre-line'
}

const Row = styled.div``
const rowStyle = {
  display: 'flex'
}

const Title = styled.div``
const titleStyle: CSSProperties = {
  fontWeight: 700,
  textTransform: 'uppercase'
}

const Description = styled.div``
const descriptionStyle = {
  marginTop: 15
}

const NumberOfItems = styled.div``
const numberOfItemsStyle: (isEndOfMalfunctionStage: boolean) => CSSProperties = (isEndOfMalfunctionStage: boolean) => ({
  background: THEME.color.lightGray,
  borderRadius: 2,
  direction: 'rtl',
  fontWeight: 700,
  marginLeft: isEndOfMalfunctionStage ? 'unset' : 'auto',
  padding: '0px 5px'
})
