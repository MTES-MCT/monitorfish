/* eslint-disable no-nested-ternary */

import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { marginsWithOneWarning, marginsWithoutAlert, marginsWithThreeWarning, marginsWithTwoWarning } from './constants'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { getCoordinates } from '../../../../coordinates'
import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { timeagoFrenchLocale } from '../../../../utils'
import BeaconMalfunctionSVG from '../../../icons/Icone_VMS_dark.svg?react'
import { getAlertNameFromType } from '../../../SideWindow/Alert/AlertListAndReportingList/utils'
import { OverlayPosition } from '../Overlay'

// @ts-ignore
timeago.register('fr', timeagoFrenchLocale)

export function VesselCard({ feature, numberOfWarnings, overlayPosition }) {
  const isSuperUser = useIsSuperUser()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const { vesselProperties } = feature
  const featureCoordinates = feature.getGeometry().getCoordinates()

  if (!vesselProperties) {
    return null
  }

  return (
    <>
      <VesselCardHeader>
        {!!vesselProperties.flagState && (
          <>
            <Flag rel="preload" src={`flags/${vesselProperties.flagState.toLowerCase()}.svg`} />{' '}
          </>
        )}
        <VesselCardTitle data-cy="vessel-card-name">
          {vesselProperties.vesselName ? vesselProperties.vesselName : 'NOM INCONNU'}{' '}
          {vesselProperties.flagState ? <>({vesselProperties.flagState.toUpperCase()})</> : ''}
        </VesselCardTitle>
        {vesselProperties.lastLogbookMessageDateTime ? (
          <Logbook>
            <LogbookOK />
            <MessageText>JPE</MessageText>
          </Logbook>
        ) : (
          <Logbook>
            <NoLogbook />
            <MessageText>JPE</MessageText>
          </Logbook>
        )}
      </VesselCardHeader>
      {isSuperUser && !!vesselProperties.alerts?.length && (
        <VesselCardAlert data-cy="vessel-card-alert">
          <AlertIcon size={17} />
          {vesselProperties.alerts?.length === 1
            ? getAlertNameFromType(vesselProperties.alerts[0])
            : `${vesselProperties.alerts?.length} alertes`}
        </VesselCardAlert>
      )}
      {isSuperUser && vesselProperties.hasInfractionSuspicion && (
        <VesselCardInfractionSuspicion>
          <AlertIcon size={17} />
          Suspicion d&apos;infraction
        </VesselCardInfractionSuspicion>
      )}
      {isSuperUser && !!vesselProperties.beaconMalfunctionId && (
        <VesselCardBeaconMalfunction data-cy="vessel-card-beacon-malfunction">
          <BeaconMalfunctionIcon />
          NON-ÉMISSION VMS
        </VesselCardBeaconMalfunction>
      )}
      <VesselCardBody>
        <LatLon>
          <FieldName>Latitude</FieldName>
          <FieldValue data-cy="vessel-card-latitude">
            {getCoordinates(featureCoordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[0]}
          </FieldValue>
          <FieldName>Longitude</FieldName>
          <FieldValue data-cy="vessel-card-longitude">
            {getCoordinates(featureCoordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[1]}
          </FieldValue>
        </LatLon>
        <Course>
          <FieldName>Route</FieldName>
          <FieldValue>
            {vesselProperties.course === 0 || vesselProperties.course ? (
              <>{vesselProperties.course}°</>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
          <FieldName>Vitesse</FieldName>
          <FieldValue>
            {vesselProperties.speed === 0 || vesselProperties.speed ? (
              <>{vesselProperties.speed} Nds</>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
        </Course>
        <Position>
          <FieldName>Dernier signal VMS</FieldName>
          <FieldValue>
            {vesselProperties.dateTime ? <>{timeago.format(vesselProperties.dateTime, 'fr')}</> : <NoValue>-</NoValue>}
          </FieldValue>
          <FieldName>Cadencement</FieldName>
          <FieldValue>
            {vesselProperties.emissionPeriod ? (
              <>1 signal toutes les {vesselProperties.emissionPeriod / 60} min</>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
        </Position>
      </VesselCardBody>
      <VesselCardBottom>
        <ColumnOne>
          <Fields>
            <Body>
              <Field>
                <Key>CFR</Key>
                <Value data-cy="vessel-card-internal-reference-number">
                  {vesselProperties.internalReferenceNumber ? (
                    vesselProperties.internalReferenceNumber
                  ) : (
                    <NoValue>-</NoValue>
                  )}
                </Value>
              </Field>
              <Field>
                <Key>MMSI</Key>
                <Value data-cy="vessel-card-mmsi">
                  {vesselProperties.mmsi ? vesselProperties.mmsi : <NoValue>-</NoValue>}
                </Value>
              </Field>
            </Body>
          </Fields>
        </ColumnOne>
        <ColumnTwo>
          <Fields>
            <Body>
              <Field>
                <Key>Marquage ext.</Key>
                <Value data-cy="vessel-card-external-reference-number">
                  {vesselProperties.externalReferenceNumber ? (
                    vesselProperties.externalReferenceNumber
                  ) : (
                    <NoValue>-</NoValue>
                  )}
                </Value>
              </Field>
              <Field>
                <Key>Call Sign (IRCS)</Key>
                <Value data-cy="vessel-card-ircs">
                  {vesselProperties.ircs ? vesselProperties.ircs : <NoValue>-</NoValue>}
                </Value>
              </Field>
            </Body>
          </Fields>
        </ColumnTwo>
      </VesselCardBottom>
      <VesselCardBottom>
        <ColumnOne>
          <Fields>
            <Body>
              <Field>
                <Key>Taille du navire</Key>
                <Value>
                  {vesselProperties.length ? vesselProperties.length : <NoValue>-</NoValue>} x{' '}
                  {vesselProperties.width ? vesselProperties.width : <NoValue>-</NoValue>} m
                </Value>
              </Field>
            </Body>
          </Fields>
        </ColumnOne>
      </VesselCardBottom>
      <TrianglePointer>
        {overlayPosition === OverlayPosition.BOTTOM && <BottomTriangleShadow $numberOfWarnings={numberOfWarnings} />}
        {overlayPosition === OverlayPosition.TOP && <TopTriangleShadow $numberOfWarnings={numberOfWarnings} />}
        {overlayPosition === OverlayPosition.RIGHT && <RightTriangleShadow $numberOfWarnings={numberOfWarnings} />}
        {overlayPosition === OverlayPosition.LEFT && <LeftTriangleShadow $numberOfWarnings={numberOfWarnings} />}
      </TrianglePointer>
    </>
  )
}

const AlertIcon = styled(Icon.Alert)`
  width: 17px;
  height: 17px;
  margin-bottom: -3px;
  margin-right: 5px;
`

const BeaconMalfunctionIcon = styled(BeaconMalfunctionSVG)`
  width: 18px;
  height: 18px;
  margin-bottom: -4px;
  margin-right: 5px;
`

const VesselCardAlert = styled.div`
  background: ${p => p.theme.color.maximumRed};
  font-weight: 500;
  font-size: 13px;
  color: ${p => p.theme.color.white};
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  padding: 5px 0;
`

const VesselCardInfractionSuspicion = styled.div`
  background: ${p => p.theme.color.maximumRed15};
  font-weight: 500;
  font-size: 13px;
  color: ${p => p.theme.color.maximumRed};
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  padding: 5px 0;
`

const VesselCardBeaconMalfunction = styled.div`
  background: ${p => p.theme.color.goldenPoppy};
  font-weight: 500;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  padding: 5px 0;
`

const MessageText = styled.span`
  vertical-align: text-top;
  line-height: 11px;
  margin: 0 3px 0 3px;
`

const NoLogbook = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: #e1000f;
  border-radius: 50%;
  display: inline-block;
`

const LogbookOK = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: #8cc61f;
  border-radius: 50%;
  display: inline-block;
`

const Logbook = styled.span`
  border-radius: 11px;
  background: ${p => p.theme.color.gainsboro};
  font-size: 11px;
  color: ${p => p.theme.color.gunMetal};
  margin: 3px 7px 7px 3px;
  height: 17px;
  padding: 3px 5px 0px 2px;
  right: 0;
  position: absolute;
  display: inline;
`

const Flag = styled.img<{
  rel?: 'preload'
}>`
  height: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 0px;
`

const Body = styled.tbody``

const Fields = styled.table`
  width: inherit;
  display: table;
  margin: 0;
  padding-bottom: 0;
`

const Field = styled.tr`
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${p => p.theme.color.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 8px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  margin: 0;
  text-align: left;
  padding: 0 0 0 5px;
  background: none;
  border: none;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 100px;
`

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto;
  width: auto;
`

const BottomTriangleShadow = styled.div<{
  $numberOfWarnings: number
}>`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${p => p.theme.color.gainsboro} transparent transparent transparent;
  margin-left: ${p => {
    if (p.$numberOfWarnings === 1) {
      return -marginsWithOneWarning.xMiddle - 6
    }

    if (p.$numberOfWarnings === 2) {
      return -marginsWithTwoWarning.xMiddle - 6
    }

    if (p.$numberOfWarnings === 3) {
      return -marginsWithThreeWarning.xMiddle - 6
    }

    return -marginsWithoutAlert.xMiddle - 6
  }}px;
  margin-top: -1px;
  clear: top;
`

const TopTriangleShadow = styled.div<{
  $numberOfWarnings: number
}>`
  position: absolute;
  width: 0;
  height: 0;
  border-top: transparent;
  border-right: 6px solid transparent;
  border-bottom: 11px solid ${p => p.theme.color.gainsboro};
  border-left: 6px solid transparent;
  margin-left: ${p => {
    if (p.$numberOfWarnings === 1) {
      return -marginsWithOneWarning.xMiddle - 6
    }

    if (p.$numberOfWarnings === 2) {
      return -marginsWithTwoWarning.xMiddle - 6
    }

    if (p.$numberOfWarnings === 3) {
      return -marginsWithThreeWarning.xMiddle - 6
    }

    return -marginsWithoutAlert.xMiddle - 6
  }}px;
  margin-top: ${p => {
    if (p.$numberOfWarnings === 1) {
      return marginsWithOneWarning.yBottom + 18
    }

    if (p.$numberOfWarnings === 2) {
      return marginsWithTwoWarning.yBottom + 18
    }

    if (p.$numberOfWarnings === 3) {
      return marginsWithThreeWarning.yBottom + 18
    }

    return marginsWithoutAlert.yBottom + 18
  }}px;
  clear: top;
`

const RightTriangleShadow = styled.div<{
  $numberOfWarnings: number
}>`
  position: absolute;
  width: 0;
  height: 0;
  border-right: transparent;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 11px solid ${p => p.theme.color.gainsboro};
  margin-left: ${p => {
    if (p.$numberOfWarnings === 1) {
      return -marginsWithOneWarning.xRight - 20
    }

    if (p.$numberOfWarnings === 2) {
      return -marginsWithTwoWarning.xRight - 20
    }

    if (p.$numberOfWarnings === 3) {
      return -marginsWithThreeWarning.xRight - 20
    }

    return -marginsWithoutAlert.xRight - 20
  }}px;
  margin-top: ${p => {
    if (p.$numberOfWarnings === 1) {
      return marginsWithOneWarning.yMiddle - 6
    }

    if (p.$numberOfWarnings === 2) {
      return marginsWithTwoWarning.yMiddle - 6
    }

    if (p.$numberOfWarnings === 3) {
      return marginsWithThreeWarning.yMiddle - 6
    }

    return marginsWithoutAlert.yMiddle - 6
  }}px;
  clear: top;
`

const LeftTriangleShadow = styled.div<{
  $numberOfWarnings: number
}>`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-top: 6px solid transparent;
  border-right: 11px solid ${p => p.theme.color.gainsboro};
  border-bottom: 6px solid transparent;
  border-left: transparent;
  margin-left: -11px;
  margin-top: ${p => {
    if (p.$numberOfWarnings === 1) {
      return marginsWithOneWarning.yMiddle - 6
    }

    if (p.$numberOfWarnings === 2) {
      return marginsWithTwoWarning.yMiddle - 6
    }

    if (p.$numberOfWarnings === 3) {
      return marginsWithThreeWarning.yMiddle - 6
    }

    return marginsWithoutAlert.yMiddle - 6
  }}px;
  clear: top;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  margin: 0;
  line-height: normal;
`

const ColumnOne = styled.div`
  order: 1;
  padding: 10px 0 0 5px;
  margin-bottom: 5px;
  min-width: 100px;
`

const ColumnTwo = styled.div`
  order: 2;
  padding: 10px 5px 0 5px;
  margin-bottom: 5px;
`

const VesselCardBottom = styled.div`
  display: flex;
  background: ${p => p.theme.color.white};
  margin: 0 5px 5px 5px;
`

const FieldName = styled.div`
  margin-top: 9px;
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  font-weight: normal;
`

const FieldValue = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  font-weight: 500;
  margin-top: 2px;
  max-height: 20px;
  overflow: clip;
`

const LatLon = styled.div`
  width: 122px;
  order: 1;
  background: ${p => p.theme.color.white};
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Course = styled.div`
  width: 70px;
  order: 2;
  background: ${p => p.theme.color.white};
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Position = styled.div`
  width: 175px;
  order: 3;
  background: ${p => p.theme.color.white};
  margin: 5px 5px 5px 5px;
  padding-bottom: 10px;
  padding-left: 5px;
  padding-right: 5px;
`

const VesselCardHeader = styled.div`
  background: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
  padding: 4px 5px 5px 5px;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const VesselCardTitle = styled.span`
  margin-left: 5px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 0px;
  font-size: 16px;
`

const VesselCardBody = styled.div`
  display: flex;
  text-align: center;
`
