import { Dropdown, Icon } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { Item } from './Item'
import { getMissionActionFormInitialValues } from './utils'
import { missionActions } from '../../../../domain/actions'
import { Mission } from '../../../../domain/types/mission'
import { MissionAction } from '../../../../domain/types/missionAction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { MissionActionFormValues, MissionFormValues } from '../types'

export type ActionListProps = {
  initialValues: MissionFormValues
}
export function ActionList({ initialValues }: ActionListProps) {
  const dispatch = useMainAppDispatch()

  const currentMissionType = useMemo(() => initialValues.missionType, [initialValues.missionType])

  const add = useCallback(
    (type: MissionActionFormValues['actionType']) => {
      const newMissionActionFormValues = getMissionActionFormInitialValues(type)

      dispatch(missionActions.addDraftAction(newMissionActionFormValues))
    },
    [dispatch]
  )

  const duplicate = useCallback(
    (missionActionIndex: number) => {
      dispatch(missionActions.duplicateDraftActionAtIndex(missionActionIndex))
    },
    [dispatch]
  )

  const remove = useCallback(
    (missionActionIndex: number) => {
      dispatch(missionActions.removeDraftActionAtIndex(missionActionIndex))
    },
    [dispatch]
  )

  return (
    <Wrapper>
      <FormHead>
        <h2>Actions réalisées en mission</h2>

        <Dropdown Icon={Icon.Plus} title="Ajouter">
          {currentMissionType === Mission.MissionType.AIR && (
            <>
              <Dropdown.Item Icon={Icon.Plane} onClick={() => add(MissionAction.MissionActionType.AIR_CONTROL)}>
                Ajouter un contrôle aérien
              </Dropdown.Item>
              <Dropdown.Item
                Icon={Icon.Observation}
                onClick={() => add(MissionAction.MissionActionType.AIR_SURVEILLANCE)}
              >
                Ajouter une surveillance aérienne
              </Dropdown.Item>
            </>
          )}
          {currentMissionType === Mission.MissionType.LAND && (
            <Dropdown.Item Icon={Icon.Anchor} onClick={() => add(MissionAction.MissionActionType.LAND_CONTROL)}>
              Ajouter un contrôle à la débarque
            </Dropdown.Item>
          )}
          {currentMissionType === Mission.MissionType.SEA && (
            <Dropdown.Item Icon={Icon.FleetSegment} onClick={() => add(MissionAction.MissionActionType.SEA_CONTROL)}>
              Ajouter un contrôle en mer
            </Dropdown.Item>
          )}
          <Dropdown.Item Icon={Icon.Note} onClick={() => add(MissionAction.MissionActionType.OBSERVATION)}>
            Ajouter une note libre
          </Dropdown.Item>
        </Dropdown>
      </FormHead>

      <FormBody>
        {!initialValues.actions.length && <Placeholder>Aucune action n’est ajoutée pour le moment.</Placeholder>}
        {Boolean(initialValues.actions.length) &&
          initialValues.actions.map((actionInitialValues, index) => (
            <Item
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              initialValues={actionInitialValues}
              onDelete={() => remove(index)}
              onDuplicate={() => duplicate(index)}
            />
          ))}
      </FormBody>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.cultured};
  display: flex;
  flex-direction: column;
  width: 33.33%;
`

const Placeholder = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 13px;
  font-style: italic;
  justify-content: center;
`
