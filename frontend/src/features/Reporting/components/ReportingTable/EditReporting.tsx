import { WindowContext } from '@api/constants'
import { ErrorWall } from '@components/ErrorWall'
import { reportingActions } from '@features/Reporting/slice'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import CloseIconSVG from '../../../icons/Croix_grise.svg?react'
import AlertsSVG from '../../../icons/Icone_alertes_gris.svg?react'
import { ReportingForm } from '../ReportingForm'

export function EditReporting() {
  const dispatch = useMainAppDispatch()
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const displayedError = useMainAppSelector(
    state => state.displayedError[DisplayedErrorKey.SIDE_WINDOW_REPORTING_FORM_ERROR]
  )

  const baseUrl = window.location.origin
  const vesselIdentity = editedReporting ? extractVesselIdentityProps(editedReporting) : undefined

  const closeForm = useCallback(() => {
    dispatch(reportingActions.unsetEditedReporting())
  }, [dispatch])

  if (displayedError) {
    return (
      <EditReportingWrapper $isEditedInSideWindow={!!editedReporting}>
        <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_REPORTING_FORM_ERROR} isAbsolute />
      </EditReportingWrapper>
    )
  }

  return (
    <EditReportingWrapper $isEditedInSideWindow={!!editedReporting} data-cy="side-window-beacon-malfunctions-detail">
      <Header>
        <Row $topMargin={0}>
          <AlertsIcon />
          <Title> ÉDITER LE SIGNALEMENT</Title>
          <CloseIcon onClick={closeForm} />
        </Row>
        <Row $topMargin={6}>
          {editedReporting && editedReporting.flagState && (
            <Flag rel="preload" src={`${baseUrl}/flags/${editedReporting.flagState.toLowerCase()}.svg`} />
          )}
          <VesselName
            data-cy="side-window-beacon-malfunctions-detail-vessel-name"
            title={editedReporting?.vesselName ?? 'Aucun nom'}
          >
            {editedReporting?.vesselName ?? 'Aucun nom'}
          </VesselName>
          <InternalReferenceNumber data-cy="side-window-beacon-malfunctions-detail-cfr">
            ({editedReporting?.internalReferenceNumber ?? 'Aucun CFR'})
          </InternalReferenceNumber>
        </Row>
      </Header>
      <Line />
      {editedReporting && vesselIdentity && (
        <StyledReportingForm
          editedReporting={editedReporting}
          hasWhiteBackground
          onClose={closeForm}
          vesselIdentity={vesselIdentity}
          windowContext={WindowContext.SideWindow}
        />
      )}
    </EditReportingWrapper>
  )
}

const EditReportingWrapper = styled.div<{
  $isEditedInSideWindow: boolean
}>`
  background: ${THEME.color.white};
  height: 100vh;
  margin-right: ${p => (p.$isEditedInSideWindow ? 0 : -490)}px;
  position: fixed;
  right: 0;
  top: 0;
  transition: margin-right 0.5s;
  width: 490px;
  z-index: 999;
`

const StyledReportingForm = styled(ReportingForm)`
  margin: 20px 25px 20px 25px;
`

const Line = styled.div`
  border-bottom: 1px solid ${THEME.color.lightGray};
  width: 100%;
`

const Flag = styled.img`
  cursor: pointer;
  display: inline-block;
  height: 14px;
  margin-top: 5px;
  vertical-align: middle;
`

const VesselName = styled.div`
  color: ${THEME.color.gunMetal};
  font: normal normal bold 16px/22px Marianne;
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const InternalReferenceNumber = styled.div`
  color: ${THEME.color.gunMetal};
  font: normal normal normal 16px/22px Marianne;
  margin-left: 5;
`

const CloseIcon = styled(CloseIconSVG)`
  cursor: pointer;
  height: 20px;
  margin-left: auto;
  margin-right: 4px;
  margin-top: 0;
  width: 20px;
`

const Row = styled.div<{
  $topMargin: number
}>`
  display: flex;
  margin-top: ${p => p.$topMargin};
`

const Header = styled.div`
  margin: 16px 20px 16px 40px;
`

const Title = styled.span`
  color: ${THEME.color.slateGray};
  font: normal normal bold 16px Marianne;
  letter-spacing: 0;
  margin-left: 10px;
  vertical-align: super;
`

const AlertsIcon = styled(AlertsSVG)`
  width: 17px;
`
