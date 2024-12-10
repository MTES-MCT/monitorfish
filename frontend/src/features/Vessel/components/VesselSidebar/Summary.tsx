import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { WSG84_PROJECTION } from '@features/Map/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { getCoordinates } from 'coordinates'
import { showVessel } from 'domain/use_cases/vessel/showVessel'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'
import { getDateTime, timeagoFrenchLocale } from 'utils'

import { RiskFactorResume } from './risk_factor/RiskFactorResume'
import InfoSVG from '../../../icons/Information.svg?react'
import NoVesselSVG from '../../../icons/Picto_photo_navire_manquante.svg?react'

// @ts-ignore
timeago.register('fr', timeagoFrenchLocale)

export function VesselSummary() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const { loadingVessel, selectedVessel, selectedVesselIdentity, selectedVesselPositions } = useMainAppSelector(
    state => state.vessel
  )
  const [photoFallback, setPhotoFallback] = useState(false)
  const [lastPosition, setLastPosition] = useState<
    | {
        course
        dateTime
        latitude
        longitude
        speed
      }
    | undefined
  >(undefined)

  useEffect(() => {
    if (!selectedVessel?.mmsi) {
      setPhotoFallback(true)

      return
    }

    setPhotoFallback(false)
  }, [selectedVessel])

  useEffect(() => {
    if (selectedVessel?.dateTime) {
      const { course, dateTime, latitude, longitude, speed } = selectedVessel

      setLastPosition({
        course,
        dateTime,
        latitude,
        longitude,
        speed
      })

      return
    }

    if (selectedVesselPositions?.length) {
      const sortedPositionsByDateTimeDesc = selectedVesselPositions
        .slice()
        .sort((a, b) => -a.dateTime.localeCompare(b.dateTime))
      setLastPosition(sortedPositionsByDateTimeDesc[0])

      return
    }

    setLastPosition(undefined)
  }, [selectedVessel, selectedVesselPositions])

  useEffect(() => {
    if (!selectedVessel && !loadingVessel && selectedVesselIdentity) {
      dispatch(showVessel(selectedVesselIdentity, false, true))
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
                $referrerpolicy="no-referrer"
                onError={() => setPhotoFallback(true)}
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
            {!Number.isNaN(lastPosition?.latitude) && !Number.isNaN(lastPosition?.longitude) ? (
              getCoordinates([lastPosition?.longitude, lastPosition?.latitude], WSG84_PROJECTION, coordinatesFormat)[0]
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
          <FieldName>Longitude</FieldName>
          <FieldValue>
            {!Number.isNaN(lastPosition?.latitude) && !Number.isNaN(lastPosition?.longitude) ? (
              getCoordinates([lastPosition?.longitude, lastPosition?.latitude], WSG84_PROJECTION, coordinatesFormat)[1]
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
        </LatLon>
        <Course>
          <FieldName>Route</FieldName>
          <FieldValue>
            {!Number.isNaN(lastPosition?.course) ? <>{lastPosition?.course}°</> : <NoValue>-</NoValue>}
          </FieldValue>
          <FieldName>Vitesse</FieldName>
          <FieldValue>
            {!Number.isNaN(lastPosition?.speed) ? <>{lastPosition?.speed} Nds</> : <NoValue>-</NoValue>}
          </FieldValue>
        </Course>
        <Position>
          <FieldName>Dernier signal VMS</FieldName>
          <FieldValue>
            {lastPosition?.dateTime ? (
              <>
                {getDateTime(lastPosition?.dateTime, true)} <Gray>(UTC)</Gray>
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
    </Body>
  ) : (
    <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
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

const PhotoZone = styled.div`
  background: ${p => p.theme.color.white};
  display: flex;
  justify-content: center;
  margin: 5px 5px 10px 5px;
  padding: 10px;
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
  overflow-x: hidden;
  max-height: 662px;
`

const Photo = styled.img<{
  $referrerpolicy: string
}>`
  max-height: 190px;
  left: auto;
  right: auto;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`

const ZoneWithoutBackground = styled.div`
  margin: 5px 5px 10px 5px;
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
