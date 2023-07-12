import { useEffect, useState } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { COLORS } from '../../../constants/constants'
import { getCoordinates } from '../../../coordinates'
import { WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { showVessel } from '../../../domain/use_cases/vessel/showVessel'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { getDateTime, timeagoFrenchLocale } from '../../../utils'
import { ReactComponent as InfoSVG } from '../../icons/Information.svg'
import { ReactComponent as NoVesselSVG } from '../../icons/Picto_photo_navire_manquante.svg'
import RiskFactorResume from '../risk_factor/RiskFactorResume'

// @ts-ignore
timeago.register('fr', timeagoFrenchLocale)

export function VesselSummary() {
  const dispatch = useMainAppDispatch()
  const { coordinatesFormat } = useMainAppSelector(state => state.map)
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
                onError={() => setPhotoFallback(true)}
                referrerpolicy="no-referrer"
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
      <RiskFactorResume />
    </Body>
  ) : (
    <FingerprintSpinner className="radar" color={COLORS.charcoal} size={100} />
  )
}

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

const NoVessel = styled(NoVesselSVG)`
  width: 60px;
  background: ${COLORS.gainsboro};
  padding: 92px 136px 92px 136px;
  margin: 10px 0 5px 0;
`

const FieldName = styled.div`
  margin-top: 9px;
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: normal;
`

const FieldValue = styled.div`
  color: ${COLORS.gunMetal};
  font-size: 13px;
  margin-top: 2px;
  font-weight: 500;
`

const PhotoZone = styled.div`
  margin: 5px 5px 10px 5px;
  background: ${COLORS.white};
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
  overflow-x: hidden;
  max-height: 700px;
`

const Photo = styled.img<{
  referrerpolicy: string
}>`
  margin: 15px 0 10px 0;
  max-height: 190px;
  left: auto;
  right: auto;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
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
  background: ${COLORS.white};
  margin: 0;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Course = styled.div`
  order: 2;
  background: ${COLORS.white};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Position = styled.div`
  order: 3;
  background: ${COLORS.white};
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
