import { formatPhoneNumber } from '@features/ControlUnit/components/ControlUnitDialog/ControlUnitContactList/utils'
import { Accent, ControlUnit, Icon, IconButton, Link } from '@mtes-mct/monitor-ui'
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

  const hasLongName =
    (ControlUnit.ControlUnitContactPredefinedName[controlUnitContact.name]?.length ||
      controlUnitContact.name?.length) >= 33

  return (
    <Wrapper data-cy="ControlUnitDialog-control-unit-contact" data-id={controlUnitContact.id}>
      <Left $hasLongName={hasLongName}>
        <NameAndContactContainer $hasLongName={hasLongName}>
          <Name
            title={ControlUnit.ControlUnitContactPredefinedName[controlUnitContact.name] || controlUnitContact.name}
          >
            {ControlUnit.ControlUnitContactPredefinedName[controlUnitContact.name] || controlUnitContact.name}
          </Name>
          {controlUnitContact.phone && <span>{formatPhoneNumber(controlUnitContact.phone)}</span>}
          {controlUnitContact.isSmsSubscriptionContact && (
            <Icon.Subscription size={14} title="Numéro de diffusion pour les préavis et les rapports de contrôle" />
          )}
        </NameAndContactContainer>
        <MailContainer>
          <Link href={`mailto:${controlUnitContact.email}`} rel="noreferrer" target="_blank">
            {controlUnitContact.email}
          </Link>
          {controlUnitContact.isEmailSubscriptionContact && (
            <Icon.Subscription size={14} title="Adresse de diffusion pour les préavis et les rapports de contrôle" />
          )}
        </MailContainer>
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
  gap: 16px;
  padding: 8px 8px 12px 12px;

  > p:not(:first-child) {
    margin: 8px 0 0;
  }
`

const NameAndContactContainer = styled.p<{ $hasLongName: boolean }>`
  align-items: end;
  column-gap: 8px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 16px;
  > span {
    line-height: initial;
  }
`

const MailContainer = styled.p`
  align-items: end;
  display: flex;
  gap: 8px;
`

const Left = styled.div<{ $hasLongName: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-wrap: wrap;
`

const Right = styled.div``

const Name = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: bold;
  overflow-wrap: anywhere;
  max-width: 450px;
`
