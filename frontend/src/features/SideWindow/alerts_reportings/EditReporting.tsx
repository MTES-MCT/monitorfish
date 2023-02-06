import { CSSProperties, useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getOnlyVesselIdentityProperties } from '../../../domain/entities/vessel/vessel'
import { setEditedReportingInSideWindow } from '../../../domain/shared_slices/Reporting'
import { ReportingType } from '../../../domain/types/reporting'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes_gris.svg'
import { ReportingForm } from '../../VesselSidebar/Reportings/Current/ReportingForm'

export function EditReporting() {
  const dispatch = useMainAppDispatch()
  const baseUrl = window.location.origin
  const { editedReportingInSideWindow } = useMainAppSelector(state => state.reporting)

  const editReportingWrapperStyle: CSSProperties = useMemo(
    () => ({
      background: COLORS.white,
      height: '100vh',
      marginRight: editedReportingInSideWindow ? 0 : -490,
      position: 'fixed',
      right: 0,
      top: 0,
      transition: 'margin-right 0.5s',
      width: 490,
      zIndex: 999
    }),
    [editedReportingInSideWindow]
  )

  const closeForm = useCallback(() => {
    dispatch(setEditedReportingInSideWindow())
  }, [dispatch])

  return (
    <EditReportingWrapper data-cy="side-window-beacon-malfunctions-detail" style={editReportingWrapperStyle}>
      <Header style={headerStyle}>
        <Row style={rowStyle()}>
          <AlertsIcon style={alertsIconStyle} />
          <Title style={titleStyle}>ÉDITER LE SIGNALEMENT</Title>
          <CloseIcon onClick={() => dispatch(setEditedReportingInSideWindow())} style={closeIconStyle} />
        </Row>
        <Row style={rowStyle(10)}>
          {editedReportingInSideWindow &&
            editedReportingInSideWindow.type === ReportingType.ALERT &&
            editedReportingInSideWindow.value.flagState && (
              <Flag
                rel="preload"
                src={`${baseUrl}/flags/${editedReportingInSideWindow.value.flagState.toLowerCase()}.svg`}
                style={flagStyle}
              />
            )}
          <VesselName
            data-cy="side-window-beacon-malfunctions-detail-vessel-name"
            style={vesselNameStyle}
            title={editedReportingInSideWindow?.vesselName}
          >
            {editedReportingInSideWindow?.vesselName || 'Aucun nom'}
          </VesselName>
          <InternalReferenceNumber
            data-cy="side-window-beacon-malfunctions-detail-cfr"
            style={internalReferenceNumberStyle}
          >
            ({editedReportingInSideWindow?.internalReferenceNumber || 'Aucun CFR'})
          </InternalReferenceNumber>
        </Row>
      </Header>
      <Line style={lineStyle} />
      <ReportingFormWrapper>
        {editedReportingInSideWindow && (
          <ReportingForm
            closeForm={closeForm}
            editedReporting={editedReportingInSideWindow}
            fromSideWindow
            hasWhiteBackground
            selectedVesselIdentity={getOnlyVesselIdentityProperties(editedReportingInSideWindow)}
          />
        )}
      </ReportingFormWrapper>
    </EditReportingWrapper>
  )
}

const EditReportingWrapper = styled.div``

const ReportingFormWrapper = styled.div`
  padding: 10px 25px 20px 25px;
`

const Line = styled.div``
const lineStyle = {
  borderBottom: `1px solid ${COLORS.lightGray}`,
  width: '100%'
}

const Flag = styled.img<{
  rel?: 'preload'
}>``
const flagStyle = {
  cursor: 'pointer',
  display: 'inline-block',
  height: 14,
  marginTop: 5,
  verticalAlign: 'middle'
}

const VesselName = styled.div``
const vesselNameStyle: CSSProperties = {
  color: COLORS.gunMetal,
  font: 'normal normal bold 16px/22px Marianne',
  marginLeft: 8,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

const InternalReferenceNumber = styled.div``
const internalReferenceNumberStyle = {
  color: COLORS.gunMetal,
  font: 'normal normal normal 16px/22px Marianne',
  marginLeft: 5
}

const CloseIcon = styled(CloseIconSVG)``
const closeIconStyle = {
  cursor: 'pointer',
  height: 20,
  marginLeft: 'auto',
  marginRight: 4,
  marginTop: 0,
  width: 20
}

const Row = styled.div``
const rowStyle = (topMargin: number = 0): CSSProperties => ({
  display: 'flex',
  marginTop: topMargin
})

const Header = styled.div``
const headerStyle = {
  margin: '20px 20px 5px 40px'
}

const Title = styled.span``
const titleStyle = {
  color: COLORS.slateGray,
  font: 'normal normal bold 16px Marianne',
  letterSpacing: 0,
  marginLeft: 10,
  verticalAlign: 'super'
}

const AlertsIcon = styled(AlertsSVG)``
const alertsIconStyle = {
  width: 17
}
