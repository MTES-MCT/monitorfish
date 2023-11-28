import styled from 'styled-components'

import { displayControlUnitResourcesFromControlUnit } from './utils'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { controlUnitDialogActions } from '../../../ControlUnit/components/ControlUnitDialog/slice'

import type { ControlUnit } from '@mtes-mct/monitor-ui'

type ItemProps = {
  controlUnit: ControlUnit.ControlUnit
  stationId: number
}
export function Item({ controlUnit, stationId }: ItemProps) {
  const dispatch = useMainAppDispatch()

  const edit = () => {
    dispatch(controlUnitDialogActions.setControlUnitId(controlUnit.id))
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isControlUnitDialogDisplayed: true,
        isControlUnitListDialogDisplayed: false
      })
    )
  }

  return (
    <Wrapper onClick={edit}>
      <NameText title={controlUnit.administration.name}>{controlUnit.name}</NameText>
      <AdministrationText title={controlUnit.administration.name}>{controlUnit.administration.name}</AdministrationText>
      <ResourcesBar>{displayControlUnitResourcesFromControlUnit(controlUnit, stationId)}</ResourcesBar>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  cursor: pointer;
  padding: 8px 4px 0 12px;

  &:hover {
    background-color: ${p => p.theme.color.lightGray};
  }
`

const NameText = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font-weight: bold;
  line-height: 18px;
  margin-right: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const AdministrationText = styled.div`
  color: ${p => p.theme.color.gunMetal};
  line-height: 18px;
  margin: 2px 4px 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ResourcesBar = styled.div`
  display: flex;
  flex-wrap: wrap;

  > .Element-Tag {
    margin: 0 8px 8px 0;
    white-space: nowrap;
  }
`
