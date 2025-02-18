import { Accent, ControlUnit, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { truncate } from 'lodash-es'
import { useCallback } from 'react'
import styled from 'styled-components'

import { Placeholder } from './Placeholder'

import type { Promisable } from 'type-fest'

export type ItemProps = {
  controlUnitResource: ControlUnit.ControlUnitResource
  onEdit: (controlUnitResourceId: number) => Promisable<void>
}
export function Item({ controlUnitResource, onEdit }: ItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(controlUnitResource.id)
  }, [controlUnitResource.id, onEdit])

  return (
    <Wrapper data-cy="ControlUnitDialog-control-unit-resource" data-id={controlUnitResource.id}>
      <Placeholder type={controlUnitResource.type} />
      <InfoBox>
        <InfoBoxHeader>
          <div>
            <Name>
              {ControlUnit.ControlUnitResourceTypeLabel[controlUnitResource.type]} – {controlUnitResource.name}
            </Name>
            <p>{controlUnitResource.station.name}</p>
          </div>
          <div>
            <StyledIconButton accent={Accent.TERTIARY} Icon={Icon.Edit} onClick={handleEdit} title="Éditer ce moyen" />
          </div>
        </InfoBoxHeader>
        {/* 120 chars ~= 3 lines */}
        {controlUnitResource.note && <p>{truncate(controlUnitResource.note, { length: 120 })}</p>}
      </InfoBox>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.cultured};
  display: flex;
`

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 8px 3px 8px 16px;
`

const InfoBoxHeader = styled.div`
  display: flex;
  margin-bottom: 8px;
  color: ${p => p.theme.color.gunMetal};

  > div:first-child {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
`

const Name = styled.p`
  font-weight: bold;
`

const StyledIconButton = styled(IconButton)`
  margin-top: -5px;
`
