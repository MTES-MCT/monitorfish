import { VesselSidebarFleetSegments } from '@features/FleetSegment/components/VesselSidebarFleetSegments'
import { WSG84_PROJECTION } from '@features/Map/constants'
import { UnavailableDuringPositionReplay } from '@features/PositionReplay/components/UnavailableDuringPositionReplay'
import { DataKind, selectIsDataAvailable } from '@features/PositionReplay/replayableData'
import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'
import { getLastVMSPositionOfTrack } from '@features/PositionReplay/track'
import { RiskFactorResume } from '@features/RiskFactor/components/RiskFactorResume'
import { VesselPhoto } from '@features/Vessel/components/VesselSidebar/components/VesselPhoto'
import { VesselProfile } from '@features/Vessel/components/VesselSidebar/components/VesselProfile'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { SelectedVesselGroups } from '@features/VesselGroup/components/SelectedVesselGroups'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FingerprintLoader, getCoordinates, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'
import { getDateTime, timeagoFrenchLocale } from '../../../../../utils'
import InfoSVG from '../../../../icons/Information.svg?react'

// @ts-ignore
timeago.register('fr', timeagoFrenchLocale)

export function VesselSummary() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const loadingVessel = useMainAppSelector(state => state.vessel.loadingVessel)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const isPositionReplayActive = useMainAppSelector(selectIsPositionReplayActive)
  const isRiskFactorAvailable = useMainAppSelector(state => selectIsDataAvailable(state, DataKind.RISK_FACTOR))
  const areFleetSegmentsAvailable = useMainAppSelector(state => selectIsDataAvailable(state, DataKind.FLEET_SEGMENTS))
  const areVesselGroupsAvailable = useMainAppSelector(state => selectIsDataAvailable(state, DataKind.VESSEL_GROUPS))
  const isVesselProfileAvailable = useMainAppSelector(state => selectIsDataAvailable(state, DataKind.VESSEL_PROFILE))

  // The selected vessel last position is the current one: the replayed one ends the replayed track
  const lastPosition = useMemo(
    () =>
      isPositionReplayActive
        ? getLastVMSPositionOfTrack(selectedVesselPositions)
        : {
            course: selectedVessel?.lastPositionCourse,
            dateTime: selectedVessel?.lastPositionDateTime,
            emissionPeriod: selectedVessel?.emissionPeriod,
            latitude: selectedVessel?.lastPositionLatitude,
            longitude: selectedVessel?.lastPositionLongitude,
            speed: selectedVessel?.lastPositionSpeed
          },
    [isPositionReplayActive, selectedVesselPositions, selectedVessel]
  )

  const coordinates =
    !Number.isNaN(lastPosition.latitude) && !Number.isNaN(lastPosition.longitude)
      ? getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, coordinatesFormat)
      : undefined

  useEffect(() => {
    if (!selectedVessel && !loadingVessel && selectedVesselIdentity) {
      dispatch(showVessel(selectedVesselIdentity, false))
    }
  }, [dispatch, selectedVessel, loadingVessel, selectedVesselIdentity])

  return !loadingVessel ? (
    <Body>
      <VesselPhoto />
      <ZoneWithoutBackground>
        <LatLon>
          <FieldName>Latitude</FieldName>
          <FieldValue data-cy="vessel-summary-latitude">
            {coordinates ? coordinates[0] : <NoValue>-</NoValue>}
          </FieldValue>
          <FieldName>Longitude</FieldName>
          <FieldValue>{coordinates ? coordinates[1] : <NoValue>-</NoValue>}</FieldValue>
        </LatLon>
        <Course>
          <FieldName>Route</FieldName>
          <FieldValue>
            {!Number.isNaN(lastPosition.course) ? <>{lastPosition.course}°</> : <NoValue>-</NoValue>}
          </FieldValue>
          <FieldName>Vitesse</FieldName>
          <FieldValue>
            {!Number.isNaN(lastPosition.speed) ? <>{lastPosition.speed} Nds</> : <NoValue>-</NoValue>}
          </FieldValue>
        </Course>
        <Position>
          <FieldName>Dernier signal VMS</FieldName>
          <FieldValue>
            {lastPosition.dateTime ? (
              <>
                {getDateTime(lastPosition.dateTime, true)} <Gray>(UTC)</Gray>
              </>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
          <FieldName>
            Dernier cadencement <Info title="Cette valeur est calculée à partir des 2 dernières positions VMS reçues" />
          </FieldName>
          <FieldValue>
            {lastPosition.emissionPeriod ? (
              <>1 signal toutes les {lastPosition.emissionPeriod / 60} minutes</>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
        </Position>
      </ZoneWithoutBackground>
      {isSuperUser &&
        (isRiskFactorAvailable ? (
          <RiskFactorResume />
        ) : (
          <UnavailableDuringPositionReplay
            message="En mode rejeu, la note de risque n'est pas calculée."
            title="Note de risque globale"
          />
        ))}
      {!isSuperUser &&
        (areFleetSegmentsAvailable ? (
          <VesselSidebarFleetSegments
            activityOrigin={selectedVessel?.activityOrigin}
            segments={selectedVessel?.riskFactor?.segments}
          />
        ) : (
          <UnavailableDuringPositionReplay
            message="En mode rejeu, les segments de flotte ne sont pas calculés."
            title="Segments de flotte"
          />
        ))}
      {areVesselGroupsAvailable ? (
        <SelectedVesselGroups />
      ) : (
        <UnavailableDuringPositionReplay
          message="En mode rejeu, les groupes du navire ne sont pas affichés."
          title="Groupes du navire"
        />
      )}
      {isVesselProfileAvailable && <VesselProfile />}
    </Body>
  ) : (
    <FingerprintLoader className="radar" color={THEME.color.charcoal} />
  )
}

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
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
  margin-top: 2px;
  font-weight: 500;
`

const Body = styled.div`
  padding: 10px;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`

const ZoneWithoutBackground = styled.div`
  margin-bottom: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 1;
`

const LatLon = styled.div`
  order: 1;
  background: ${p => p.theme.color.white};
  margin: 0;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Course = styled.div`
  order: 2;
  background: ${p => p.theme.color.white};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Position = styled.div`
  order: 3;
  background: ${p => p.theme.color.white};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Info = styled(InfoSVG)`
  width: 14px;
  vertical-align: text-bottom;
  margin-bottom: 2px;
  margin-left: 2px;
`
