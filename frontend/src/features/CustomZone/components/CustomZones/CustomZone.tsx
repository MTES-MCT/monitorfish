import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { theme } from '../../../../ui/theme'
import { CloseIcon } from '../../../commonStyles/icons/CloseIcon.style'
import { HideIcon } from '../../../commonStyles/icons/HideIcon.style'
import { ShowIcon } from '../../../commonStyles/icons/ShowIcon.style'

type CustomZoneType = {
  isShown: boolean
  name: string
  onRemove: (uuid: string) => void
  onToggleShowZone: (uuid: string) => void
  uuid: string
}
export function CustomZone({ isShown, name, onRemove, onToggleShowZone, uuid }: CustomZoneType) {
  return (
    <Wrapper data-cy="custom-zone-show-toggle" onClick={() => onToggleShowZone(uuid)}>
      <ZoneName title={name}>{name}</ZoneName>
      <Icons>
        <ShowOrHideIcon>{isShown ? <ShowIcon /> : <HideIcon />}</ShowOrHideIcon>
        <CloseIcon
          data-cy="regulatory-layers-my-zones-zone-delete"
          onClick={() => {
            onRemove(uuid)
          }}
          title="Supprimer la zone de ma sélection"
        />
      </Icons>
    </Wrapper>
  )
}

const Icons = styled.span`
  float: right;
  display: flex;
  justify-content: flex-end;
  flex: 1;
  margin-right: 6px;
`

const ShowOrHideIcon = styled.div`
  float: right;
`

const ZoneName = styled.span`
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-top: 5px;
  max-width: 250px;
`

const Wrapper = styled.li`
  line-height: 18px;
  text-align: left;
  list-style-type: none;
  cursor: pointer;
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${COLORS.lightGray};
  padding: 4px 0 4px 20px;
  display: block;
  user-select: none;
  font-weight: 500;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;

  :hover {
    background: ${theme.color.blueGray['25']};
  }
`
