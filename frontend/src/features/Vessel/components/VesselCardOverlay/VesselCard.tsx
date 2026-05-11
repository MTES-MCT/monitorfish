import { OverlayTrianglePointer } from '@features/Map/components/Overlay/OverlayTrianglePointer'
import { type OverlayCardMargins, OverlayPosition } from '@features/Map/components/Overlay/types'
import { OPENLAYERS_PROJECTION } from '@features/Map/constants'
import { Square } from '@features/Regulation/components/ZonePreview'
import { extractVesselPropertiesFromFeature } from '@features/Vessel/utils'
import { type Vessel } from '@features/Vessel/Vessel.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, pluralize, THEME } from '@mtes-mct/monitor-ui'
import styled, { useTheme } from 'styled-components'
import * as timeago from 'timeago.js'

import { VESSEL_CARD_WIDTH } from './constants'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { getCoordinates } from '../../../../coordinates'
import { timeagoFrenchLocale } from '../../../../utils'
import BeaconMalfunctionSVG from '../../../icons/Icone_VMS_dark.svg?react'

// @ts-expect-error — timeago.js ships no locale type definitions
timeago.register('fr', timeagoFrenchLocale)

type VesselCardProps = {
  cardHeight: number
  cardWidth: number
  feature: Vessel.VesselLastPositionFeature
  margins: OverlayCardMargins
  overlayPosition: OverlayPosition
}
export function VesselCard({ cardHeight, cardWidth, feature, margins, overlayPosition }: VesselCardProps) {
  const theme = useTheme()
  const isSuperUser = useIsSuperUser()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  const vesselProperties = extractVesselPropertiesFromFeature(feature, [
    'alerts',
    'beaconMalfunctionId',
    'course',
    'dateTime',
    'emissionPeriod',
    'flagState',
    'hasInfractionSuspicion',
    'hasCurrentTripInfractionSuspicion',
    'lastLogbookMessageDateTime',
    'segments',
    'speed',
    'vesselName',
    'groupsDisplayed',
    'numberOfGroupsHidden'
  ])
  const featureCoordinates = feature.getGeometry()!.getCoordinates()

  return (
    <>
      <CardWrapper>
        <VesselCardHeader>
          {!!vesselProperties.flagState && (
            <>
              <Flag rel="preload" src={`flags/${vesselProperties.flagState.toLowerCase()}.svg`} />{' '}
            </>
          )}
          <VesselCardTitle data-cy="vessel-card-name">
            {vesselProperties.vesselName ?? 'NOM INCONNU'}{' '}
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
              ? vesselProperties.alerts[0]
              : `${vesselProperties.alerts?.length} alertes`}
          </VesselCardAlert>
        )}
        {isSuperUser && vesselProperties.hasInfractionSuspicion && (
          <VesselCardInfractionSuspicion>
            <AlertIcon size={17} />
            Suspicion d&apos;infraction {vesselProperties.hasCurrentTripInfractionSuspicion && 'en cours'}
          </VesselCardInfractionSuspicion>
        )}
        {isSuperUser && !!vesselProperties.beaconMalfunctionId && (
          <VesselCardBeaconMalfunction data-cy="vessel-card-beacon-malfunction">
            <BeaconMalfunctionIcon />
            NON-ÉMISSION VMS
          </VesselCardBeaconMalfunction>
        )}
        <ThreeColumnsBody>
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
              <NumericField suffix="°" value={vesselProperties.course} />
            </FieldValue>
            <FieldName>Vitesse</FieldName>
            <FieldValue>
              <NumericField suffix=" Nds" value={vesselProperties.speed} />
            </FieldValue>
          </Course>
          <Position>
            <FieldName>Dernier signal VMS</FieldName>
            <FieldValue>
              {vesselProperties.dateTime ? timeago.format(vesselProperties.dateTime, 'fr') : <NoValue>-</NoValue>}
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
        </ThreeColumnsBody>
        <FleetSegments data-cy="vessel-card-segments">
          <Key>{pluralize('Segment', vesselProperties.segments.length)} de flotte</Key>
          <Value>
            {vesselProperties.segments.length > 0 ? vesselProperties.segments.join(', ') : <NoValue>-</NoValue>}
          </Value>
        </FleetSegments>
        {(vesselProperties.groupsDisplayed.length > 0 || vesselProperties.numberOfGroupsHidden > 0) && (
          <VesselGroups data-cy="vessel-card-groups">
            {vesselProperties.groupsDisplayed.map(vesselGroup => (
              <VesselGroupRow key={vesselGroup.id}>
                <Square $fillColor={vesselGroup.color} $strokeColor={THEME.color.lightGray} />
                {vesselGroup.name}
              </VesselGroupRow>
            ))}
            {vesselProperties.numberOfGroupsHidden > 0 && (
              <OtherGroupsHidden>
                {vesselProperties.numberOfGroupsHidden} {pluralize('autre', vesselProperties.numberOfGroupsHidden)}{' '}
                {pluralize('groupe', vesselProperties.numberOfGroupsHidden)} non{' '}
                {pluralize('affiché', vesselProperties.numberOfGroupsHidden)} sur la carte
              </OtherGroupsHidden>
            )}
          </VesselGroups>
        )}
      </CardWrapper>
      <OverlayTrianglePointer
        $color={theme.color.gainsboro}
        cardHeight={cardHeight}
        cardWidth={cardWidth}
        margins={margins}
        overlayPosition={overlayPosition}
      />
    </>
  )
}

function NumericField({ suffix, value }: { suffix: string; value: null | number | undefined }) {
  if (value === 0 || value != null) {
    return (
      <>
        {value}
        {suffix}
      </>
    )
  }

  return <NoValue>-</NoValue>
}

const CardWrapper = styled.div`
  width: ${VESSEL_CARD_WIDTH}px;
  text-align: left;
  background-color: ${p => p.theme.color.gainsboro};
  border-radius: 2px;
  overflow: hidden;
`

const VesselGroupRow = styled.span``

const OtherGroupsHidden = styled.span`
  font-style: italic;
  color: ${p => p.theme.color.slateGray};
  font-weight: normal;
`

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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  margin-top: 0;
`

const FleetSegments = styled.div`
  display: flex;
  margin: 0 5px 5px 5px;
  padding: 10px;
  background: ${p => p.theme.color.white};
`

const VesselGroups = styled.div`
  gap: 8px;
  display: flex;
  flex-direction: column;
  font-weight: 500;
  margin: 0 5px 5px 5px;
  padding: 10px;
  background: ${p => p.theme.color.white};
`

const Key = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin-right: 10px;
  font-weight: normal;
  width: 125px;
`

const Value = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 200px;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  margin: 0;
  line-height: normal;
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
  margin-top: 0;
  font-size: 16px;
`

const ThreeColumnsBody = styled.div`
  display: flex;
  text-align: center;
`
