import { ControlUnit, Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash/fp'
import { useCallback } from 'react'
import styled from 'styled-components'

import { AreaNote } from './AreaNote'
import { ControlUnitContactList } from './ControlUnitContactList'
import { ControlUnitResourceList } from './ControlUnitResourceList'
import { RTK_COMMON_QUERY_OPTIONS } from '../../../../api/constants'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendApiError } from '../../../../libs/FrontendApiError'
import { FrontendError } from '../../../../libs/FrontendError'
import { NoRsuiteOverrideWrapper } from '../../../../ui/NoRsuiteOverrideWrapper'
import { monitorenvControlUnitApi, useGetControlUnitQuery } from '../../controlUnitApi'

export function ControlUnitDialog() {
  const dispatch = useMainAppDispatch()
  const controlUnitId = useMainAppSelector(store => store.controlUnitDialog.controlUnitId)
  if (!controlUnitId) {
    throw new FrontendError('`store.controlUnitDialog.controlUnitId` is undefined.')
  }
  const healthcheckTextWarning = useMainAppSelector(store => store.global.healthcheckTextWarning)

  const { data: controlUnit, error: getControlControlUnitError } = useGetControlUnitQuery(
    controlUnitId,
    RTK_COMMON_QUERY_OPTIONS
  )
  FrontendApiError.handleIfAny(getControlControlUnitError)

  const close = useCallback(() => {
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isControlUnitDialogDisplayed: false
      })
    )
  }, [dispatch])

  const updateControlUnit = useCallback(
    async (nextControlUnitData: ControlUnit.ControlUnitData) => {
      try {
        await dispatch(monitorenvControlUnitApi.endpoints.updateControlUnit.initiate(nextControlUnitData)).unwrap()
      } catch (err) {
        FrontendApiError.handleIfAny(err)
      }
    },
    [dispatch]
  )

  if (!controlUnit) {
    return (
      <NoRsuiteOverrideWrapper>
        <StyledMapMenuDialogContainer $hasHealthcheckTextWarning={!!healthcheckTextWarning}>
          <MapMenuDialog.Header>
            <MapMenuDialog.Title>Chargement en cours...</MapMenuDialog.Title>
            <MapMenuDialog.CloseButton Icon={Icon.Close} onClick={close} />
          </MapMenuDialog.Header>
        </StyledMapMenuDialogContainer>
      </NoRsuiteOverrideWrapper>
    )
  }

  return (
    <NoRsuiteOverrideWrapper>
      <StyledMapMenuDialogContainer $hasHealthcheckTextWarning={!!healthcheckTextWarning} data-cy="ControlUnitDialog">
        <MapMenuDialog.Header>
          <MapMenuDialog.Title>
            <b>{controlUnit.name}</b> ({controlUnit.administration.name})
          </MapMenuDialog.Title>
          <MapMenuDialog.CloseButton Icon={Icon.Close} onClick={close} />
        </MapMenuDialog.Header>
        <Formik initialValues={controlUnit} onSubmit={noop}>
          <StyledMapMenuDialogBody>
            <ControlUnitContactList controlUnit={controlUnit} onSubmit={updateControlUnit} />
            <ControlUnitResourceList controlUnit={controlUnit} />
            <AreaNote controlUnit={controlUnit} onSubmit={updateControlUnit} />
          </StyledMapMenuDialogBody>
        </Formik>
      </StyledMapMenuDialogContainer>
    </NoRsuiteOverrideWrapper>
  )
}

const StyledMapMenuDialogContainer = styled(MapMenuDialog.Container)<{
  $hasHealthcheckTextWarning: boolean
}>`
  bottom: 10px;
  max-height: none;
  position: absolute;
  right: 50px;
  top: ${p => (p.$hasHealthcheckTextWarning ? '60px' : '10px')};
  width: 500px;
  /* Above search bar */
  z-index: 1001;
`

const StyledMapMenuDialogBody = styled(MapMenuDialog.Body)`
  background-color: ${p => p.theme.color.gainsboro};

  > div:not(:first-child) {
    margin-top: 12px;
  }
`
