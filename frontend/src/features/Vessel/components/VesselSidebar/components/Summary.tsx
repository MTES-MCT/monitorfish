import { VesselSidebarFleetSegments } from '@features/FleetSegment/components/VesselSidebarFleetSegments'
import { WSG84_PROJECTION } from '@features/Map/constants'
import { RiskFactorResume } from '@features/RiskFactor/components/RiskFactorResume'
import { VesselProfile } from '@features/Vessel/components/VesselSidebar/components/VesselProfile'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { SelectedVesselGroups } from '@features/VesselGroup/components/SelectedVesselGroups'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FingerprintLoader, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'
import { getCoordinates } from '../../../../../coordinates'
import { getDateTime, timeagoFrenchLocale } from '../../../../../utils'
import InfoSVG from '../../../../icons/Information.svg?react'
import NoVesselSVG from '../../../../icons/Picto_photo_navire_manquante.svg?react'

// @ts-ignore
timeago.register('fr', timeagoFrenchLocale)

export function VesselSummary() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const loadingVessel = useMainAppSelector(state => state.vessel.loadingVessel)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)

  const [photoFallback, setPhotoFallback] = useState(false)
  const coordinates =
    !Number.isNaN(selectedVessel?.lastPositionLatitude) && !Number.isNaN(selectedVessel?.lastPositionLongitude)
      ? getCoordinates(
          [selectedVessel?.lastPositionLongitude, selectedVessel?.lastPositionLatitude],
          WSG84_PROJECTION,
          coordinatesFormat
        )
      : undefined

  useEffect(() => {
    // The MMSI is required for the vessel picture to be available
    if (!selectedVessel?.mmsi) {
      setPhotoFallback(true)

      return
    }

    setPhotoFallback(false)
  }, [selectedVessel])

  useEffect(() => {
    if (!selectedVessel && !loadingVessel && selectedVesselIdentity) {
      dispatch(showVessel(selectedVesselIdentity, false))
    }
  }, [dispatch, selectedVessel, loadingVessel, selectedVesselIdentity])

  return !loadingVessel ? (
    <Body>
      <PhotoZone>
        {photoFallback ? (
          <NoVessel />
        ) : (
          <>
            {selectedVessel?.mmsi ? (
              <Photo
                onError={() => setPhotoFallback(true)}
                referrerPolicy="no-referrer"
                src={`https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${selectedVessel?.mmsi}&size=thumb300`}
              />
            ) : (
              <NoVessel />
            )}
          </>
        )}
      </PhotoZone>
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
            {!Number.isNaN(selectedVessel?.lastPositionCourse) ? (
              <>{selectedVessel?.lastPositionCourse}°</>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
          <FieldName>Vitesse</FieldName>
          <FieldValue>
            {!Number.isNaN(selectedVessel?.lastPositionSpeed) ? (
              <>{selectedVessel?.lastPositionSpeed} Nds</>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
        </Course>
        <Position>
          <FieldName>Dernier signal VMS</FieldName>
          <FieldValue>
            {selectedVessel?.lastPositionDateTime ? (
              <>
                {getDateTime(selectedVessel?.lastPositionDateTime, true)} <Gray>(UTC)</Gray>
              </>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
          <FieldName>
            Dernier cadencement <Info title="Cette valeur est calculée à partir des 2 dernières positions VMS reçues" />
          </FieldName>
          <FieldValue>
            {selectedVessel?.emissionPeriod ? (
              <>1 signal toutes les {selectedVessel.emissionPeriod / 60} minutes</>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
        </Position>
      </ZoneWithoutBackground>
      {isSuperUser && <RiskFactorResume />}
      {!isSuperUser && (
        <VesselSidebarFleetSegments
          activityOrigin={selectedVessel?.activityOrigin}
          segments={selectedVessel?.riskFactor?.segments}
        />
      )}
      <VesselProfile />
      <SelectedVesselGroups />
    </Body>
  ) : (
    <FingerprintLoader className="radar" color={THEME.color.charcoal} />
  )
}

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
`

const NoVessel = styled(NoVesselSVG)`
  width: 60px;
  background: ${p => p.theme.color.gainsboro};
  padding: 92px 136px 92px 136px;
`

const FieldName = styled.div`
  margin-top: 9px;
  color: #FF3392;
  font-size: 13px;
  font-weight: normal;
`

const FieldValue = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  margin-top: 2px;
  font-weight: 500;
`

const PhotoZone = styled.div`
  background: ${p => p.theme.color.white};
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  padding: 10px;
`

const Body = styled.div`
  padding: 10px;
`

const Photo = styled.img<{
  referrerPolicy: string
}>`
  max-height: 190px;
  left: auto;
  right: auto;
`

const NoValue = styled.span`
  color: #FF3392;
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
