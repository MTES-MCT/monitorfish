import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { setEditedReportingInSideWindow } from '../../../domain/shared_slices/Reporting'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes_gris.svg'
import ReportingForm from '../../vessel_sidebar/reporting/current/ReportingForm'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/RiskFactorBox'

function EditReporting() {
  const dispatch = useDispatch()
  const baseUrl = window.location.origin
  const editedReportingInSideWindow = useSelector(state => state.reporting.editedReportingInSideWindow)

  const editReportingWrapperStyle = {
    background: COLORS.white,
    height: '100vh',
    marginRight: editedReportingInSideWindow ? 0 : -490,
    position: 'fixed',
    right: 0,
    top: 0,
    transition: 'margin-right 0.5s',
    width: 490,
    zIndex: 999
  }

  function closeForm() {
    dispatch(setEditedReportingInSideWindow(null))
  }

  return (
    <EditReportingWrapper
      data-cy="side-window-beacon-malfunctions-detail"
      hasMargin={editedReportingInSideWindow}
      style={editReportingWrapperStyle}
    >
      <Header style={headerStyle}>
        <Row style={rowStyle()}>
          <AlertsIcon style={alertsIconStyle} />
          <Title style={titleStyle}>ÉDITER LE SIGNALEMENT</Title>
          <CloseIcon onClick={() => dispatch(setEditedReportingInSideWindow(null))} style={closeIconStyle} />
        </Row>
        <Row style={rowStyle(10)}>
          {editedReportingInSideWindow?.value.flagState ? (
            <Flag
              rel="preload"
              src={`${baseUrl}/flags/${editedReportingInSideWindow?.value.flagState.toLowerCase()}.svg`}
              style={flagStyle}
            />
          ) : null}
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
        <Row style={rowStyle(10)}>
          {editedReportingInSideWindow?.riskFactor ? (
            <RiskFactorBox
              color={getRiskFactorColor(editedReportingInSideWindow?.riskFactor)}
              height={24}
              isBig
              marginRight={5}
            >
              {parseFloat(editedReportingInSideWindow?.riskFactor).toFixed(1)}
            </RiskFactorBox>
          ) : null}
        </Row>
      </Header>
      <Line style={lineStyle} />
      <ReportingFormWrapper>
        <ReportingForm
          closeForm={closeForm}
          editedReporting={editedReportingInSideWindow}
          fromSideWindow
          hasWhiteBackground
          selectedVesselIdentity={editedReportingInSideWindow}
        />
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

const Flag = styled.img``
const flagStyle = {
  cursor: 'pointer',
  display: 'inline-block',
  height: 14,
  marginTop: 5,
  verticalAlign: 'middle'
}

const VesselName = styled.div``
const vesselNameStyle = {
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
const rowStyle = topMargin => ({
  display: 'flex',
  marginTop: topMargin || 0
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

export default EditReporting
