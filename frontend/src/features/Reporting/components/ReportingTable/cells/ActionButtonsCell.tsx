import { reportingActions } from '@features/Reporting/slice'
import { ReportingType } from '@features/Reporting/types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { type CSSProperties, useCallback } from 'react'
import styled from 'styled-components'

import { showVessel } from '../../../../../domain/use_cases/vessel/showVessel'

import type { InfractionSuspicionReporting, ObservationReporting, Reporting } from '@features/Reporting/types'

type ActionButtonsCellProps = Readonly<{
  reporting: Reporting.Reporting
}>
export function ActionButtonsCell({ reporting }: ActionButtonsCellProps) {
  const dispatch = useMainAppDispatch()
  const editingIsDisabled = reporting.type === ReportingType.ALERT

  // TODO Rather use a reporting id here than passing a copy of the whole Reporting object.
  const edit = useCallback(
    (isDisabled: boolean, editedReporting: Reporting.EditableReporting) => {
      if (isDisabled) {
        return
      }

      dispatch(reportingActions.setEditedReporting(editedReporting))
    },
    [dispatch]
  )

  const focusOnMap = useCallback(
    (focusedReporting: Reporting.Reporting) => {
      dispatch(showVessel(focusedReporting, false, true))
    },
    [dispatch]
  )

  return (
    <Wrapper>
      <IconButton
        accent={Accent.TERTIARY}
        data-cy="side-window-silenced-alerts-show-vessel"
        Icon={Icon.ViewOnMap}
        onClick={() => focusOnMap(reporting)}
        style={showIconStyle}
        title="Voir sur la carte"
      />
      <IconButton
        accent={Accent.TERTIARY}
        data-cy="side-window-edit-reporting"
        disabled={editingIsDisabled}
        Icon={Icon.Edit}
        onClick={() => edit(editingIsDisabled, reporting as InfractionSuspicionReporting | ObservationReporting)}
        title="Editer le signalement"
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  height: 20px;
  margin-bottom: 1px;

  > button {
    padding: 0;
  }
`

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const showIconStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 16,
  marginLeft: 'auto',
  paddingRight: 7,
  width: 20
}
