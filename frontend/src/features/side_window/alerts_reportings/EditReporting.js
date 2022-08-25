import React from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import ReportingForm from '../../vessel_sidebar/reporting/current/ReportingForm'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/RiskFactorBox'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes_gris.svg'
import { setEditedReportingInSideWindow } from '../../../domain/shared_slices/Reporting'

const EditReporting = () => {
  const dispatch = useDispatch()
  const baseUrl = window.location.origin
  const editedReportingInSideWindow = useSelector(state => state.reporting.editedReportingInSideWindow)

  const editReportingWrapperStyle = {
    position: 'fixed',
    top: 0,
    height: '100vh',
    background: COLORS.white,
    width: 490,
    right: 0,
    zIndex: 999,
    marginRight: editedReportingInSideWindow ? 0 : -490,
    transition: 'margin-right 0.5s'
  }

  return (
    <EditReportingWrapper
      hasMargin={editedReportingInSideWindow}
      data-cy={'side-window-beacon-malfunctions-detail'}
      style={editReportingWrapperStyle}
    >
      <Header style={headerStyle}>
        <Row style={rowStyle()}>
          <AlertsIcon style={alertsIconStyle}/>
          <Title style={titleStyle}>ÉDITER LE SIGNALEMENT</Title>
          <CloseIcon
            style={closeIconStyle}
            onClick={() => dispatch(setEditedReportingInSideWindow(null))}
          />
        </Row>
        <Row style={rowStyle(10)}>
          {
            editedReportingInSideWindow?.value.flagState
              ? <Flag
                style={flagStyle}
                rel='preload'
                src={`${baseUrl}/flags/${editedReportingInSideWindow?.value.flagState.toLowerCase()}.svg`}
              />
              : null
          }
          <VesselName
            title={editedReportingInSideWindow?.vesselName}
            data-cy={'side-window-beacon-malfunctions-detail-vessel-name'}
            style={vesselNameStyle}
          >
            {editedReportingInSideWindow?.vesselName || 'Aucun nom'}
          </VesselName>
          <InternalReferenceNumber
            data-cy={'side-window-beacon-malfunctions-detail-cfr'}
            style={internalReferenceNumberStyle}
          >
            ({editedReportingInSideWindow?.internalReferenceNumber || 'Aucun CFR'})
          </InternalReferenceNumber>
        </Row>
        <Row style={rowStyle(10)}>
          {
            editedReportingInSideWindow?.riskFactor
              ? <RiskFactorBox
                marginRight={5}
                height={24}
                isBig={true}
                color={getRiskFactorColor(editedReportingInSideWindow?.riskFactor)}
              >
                {parseFloat(editedReportingInSideWindow?.riskFactor).toFixed(1)}
              </RiskFactorBox>
              : null
          }
        </Row>
      </Header>
      <Line style={lineStyle}/>
      <ReportingFormWrapper>
        <ReportingForm
          selectedVesselIdentity={editedReportingInSideWindow}
          editedReporting={editedReportingInSideWindow}
          fromSideWindow
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
  width: '100%',
  borderBottom: `1px solid ${COLORS.lightGray}`
}


const Flag = styled.img``
const flagStyle = {
  height: 14,
  display: 'inline-block',
  verticalAlign: 'middle',
  marginTop: 5,
  cursor: 'pointer'
}

const VesselName = styled.div``
const vesselNameStyle = {
  font: 'normal normal bold 16px/22px Marianne',
  marginLeft: 8,
  color: COLORS.gunMetal,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
}

const InternalReferenceNumber = styled.div``
const internalReferenceNumberStyle = {
  font: 'normal normal normal 16px/22px Marianne',
  marginLeft: 5,
  color: COLORS.gunMetal
}

const CloseIcon = styled(CloseIconSVG)``
const closeIconStyle = {
  width: 20,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 20,
  marginTop: 0,
  marginRight: 4
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
  font: 'normal normal bold 16px Marianne',
  letterSpacing: 0,
  color: COLORS.slateGray,
  marginLeft: 10,
  verticalAlign: 'super'
}

const AlertsIcon = styled(AlertsSVG)``
const alertsIconStyle = {
  width: 17
}

export default EditReporting
