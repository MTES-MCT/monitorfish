import { Accent, ControlUnit, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

export type ItemProps = {
  controlUnitContact: ControlUnit.ControlUnitContactData
  onEdit: (controlUnitContactId: number) => Promisable<void>
}
export function Item({ controlUnitContact, onEdit }: ItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(controlUnitContact.id)
  }, [controlUnitContact.id, onEdit])

  return (
    <Wrapper data-cy="ControlUnitDialog-control-unit-contact" data-id={controlUnitContact.id}>
      <Left>
        <p>
          <Name>
            {ControlUnit.ControlUnitContactPredefinedName[controlUnitContact.name] || controlUnitContact.name}
          </Name>
          <Phone>{controlUnitContact.phone}</Phone>
        </p>
        <p>
          <a href={`mailto:${controlUnitContact.email}`} rel="noreferrer" target="_blank">
            {controlUnitContact.email}
          </a>
        </p>
      </Left>
      <Right>
        <IconButton accent={Accent.TERTIARY} Icon={Icon.Edit} onClick={handleEdit} title="Éditer ce contact" />
      </Right>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.cultured};
  color: ${p => p.theme.color.slateGray};
  display: flex;
  margin-top: 8px;
  padding: 8px 16px;

  > p:not(:first-child) {
    margin: 8px 0 0;
  }
`

const Left = styled.div`
  flex-grow: 1;
`

const Right = styled.div``

const Name = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: bold;
`

const Phone = styled.span`
  margin-left: 16px;
`
