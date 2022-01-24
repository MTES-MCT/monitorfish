import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as NoVesselSVG } from '../icons/Picto_photo_navire_manquante.svg'

import { getCoordinates } from '../../coordinates'
import { getDateTime, timeagoFrenchLocale } from '../../utils'
import { WSG84_PROJECTION } from '../../domain/entities/map'
import { COLORS } from '../../constants/constants'
import * as timeago from 'timeago.js'
import { ReactComponent as InfoSVG } from '../icons/Information.svg'
import { useSelector } from 'react-redux'
import { FingerprintSpinner } from 'react-epic-spinners'
import RiskFactorResume from './risk_factor/RiskFactorResume'

timeago.register('fr', timeagoFrenchLocale)

const VesselSummary = props => {
  const { coordinatesFormat } = useSelector(state => state.map)
  const {
    loadingVessel,
    selectedVessel,
    selectedVesselPositions
  } = useSelector(state => state.vessel)
  const [photoFallback, setPhotoFallback] = useState(false)
  const [lastPosition, setLastPosition] = useState(null)

  useEffect(() => {
    if (selectedVessel) {
      if (selectedVessel.mmsi) {
        setPhotoFallback(false)
      } else {
        setPhotoFallback(true)
      }
    }
  }, [selectedVessel, props.error])

  useEffect(() => {
    if (selectedVessel && selectedVessel?.dateTime) {
      const {
        course,
        latitude,
        longitude,
        speed,
        dateTime
      } = selectedVessel

      setLastPosition({
        course,
        latitude,
        longitude,
        speed,
        dateTime
      })
    } else if (selectedVesselPositions?.length) {
      const sortedPositionsByDateTimeDesc = selectedVesselPositions.slice()
        .sort((a, b) => -a.dateTime.localeCompare(b.dateTime))
      setLastPosition(sortedPositionsByDateTimeDesc[0])
    } else {
      setLastPosition(null)
    }
  }, [selectedVessel, selectedVesselPositions])

  return !loadingVessel
    ? (
      <Body>
        <PhotoZone>
          {
            photoFallback
              ? <NoVessel/>
              : <>
                {
                  selectedVessel?.mmsi
                    ? <Photo referrerpolicy="no-referrer" onError={() => setPhotoFallback(true)}
                             src={`https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${selectedVessel?.mmsi}&size=thumb300`}/>
                    : <NoVessel/>
                }
              </>
          }
        </PhotoZone>
        <ZoneWithoutBackground>
          <LatLon>
            <FieldName>Latitude</FieldName>
            <FieldValue data-cy={'vessel-summary-latitude'}>{!isNaN(lastPosition?.latitude) && !isNaN(lastPosition?.longitude)
              ? getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, coordinatesFormat)[0]
              : <NoValue>-</NoValue>}</FieldValue>
            <FieldName>Longitude</FieldName>
            <FieldValue>{!isNaN(lastPosition?.latitude) && !isNaN(lastPosition?.longitude)
              ? getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, coordinatesFormat)[1]
              : <NoValue>-</NoValue>}</FieldValue>
          </LatLon>
          <Course>
            <FieldName>Route</FieldName>
            <FieldValue>{!isNaN(lastPosition?.course)
              ? <>{lastPosition?.course}°</>
              : <NoValue>-</NoValue>}</FieldValue>
            <FieldName>Vitesse</FieldName>
            <FieldValue>{!isNaN(lastPosition?.speed)
              ? <>{lastPosition?.speed} Nds</>
              : <NoValue>-</NoValue>}</FieldValue>
          </Course>
          <Position>
            <FieldName>Dernier signal VMS</FieldName>
            <FieldValue>
              {
                lastPosition?.dateTime
                  ? <>
                    {getDateTime(lastPosition?.dateTime, true)}{' '}
                    <Gray>(UTC)</Gray></>
                  : <NoValue>-</NoValue>
              }
            </FieldValue>
            <FieldName>Dernier cadencement <Info
              title={'Cette valeur est calculée à partir des 2 dernières positions VMS reçues'}/></FieldName>
            <FieldValue>
              {
                selectedVessel?.emissionPeriod
                  ? <>1 signal toutes
                    les {selectedVessel?.emissionPeriod / 60} minutes</>
                  : <NoValue>-</NoValue>
              }
            </FieldValue>
          </Position>
        </ZoneWithoutBackground>
        <RiskFactorResume/>
      </Body>
      )
    : <FingerprintSpinner color={COLORS.charcoal} className={'radar'} size={100}/>
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
  background: ${COLORS.background};
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
  overflow-x: hidden;
  max-height: 700px;
`

const Photo = styled.img`
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
  background: ${COLORS.background};
  margin: 0;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Course = styled.div`
  order: 2;
  background: ${COLORS.background};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Position = styled.div`
  order: 3;
  background: ${COLORS.background};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Info = styled(InfoSVG)`
  width: 14px;
  vertical-align: text-bottom;
  margin-bottom: 2px;
  margin-left: ${props => props.isInfoSegment ? '5px' : '2px'};
`

export default VesselSummary
