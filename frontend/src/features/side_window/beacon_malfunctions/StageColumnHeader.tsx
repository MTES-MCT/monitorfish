import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionsStageColumnRecord } from '../../../domain/entities/beaconMalfunction/constants'
import { archiveBeaconMalfunctions } from '../../../domain/use_cases/beaconMalfunction/archiveBeaconMalfunctions'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { theme } from '../../../ui/theme'

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
  const showArchiveAll = useMemo(
    () => stage === beaconMalfunctionsStageColumnRecord.END_OF_MALFUNCTION.title && ids.length > 0,
    [stage, ids]
  )

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
          {stage === beaconMalfunctionsStageColumnRecord.ARCHIVED.title && numberOfItems === MAX_ARCHIVED_ITEMS
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
  color: ${theme.color.slateGray};
  cursor: pointer;
  text-decoration: underline;
`

const Wrapper = styled.div``
const wrapperStyle: CSSProperties = {
  background: COLORS.gainsboro,
  borderBottom: `1px solid ${COLORS.lightGray}`,
  color: COLORS.slateGray,
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
  background: COLORS.lightGray,
  borderRadius: 2,
  direction: 'rtl',
  fontWeight: 700,
  marginLeft: isEndOfMalfunctionStage ? 'unset' : 'auto',
  padding: '0px 5px'
})
