import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { COLORS } from '../../constants/constants'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import RadioGroup from 'rsuite/lib/RadioGroup'
import Radio from 'rsuite/lib/Radio'
import { interestPointType } from '../../domain/entities/interestPoints'

import { ReactComponent as GearSVG } from '../icons/Label_engin_de_peche.svg'
import { ReactComponent as ControlSVG } from '../icons/Label_controle.svg'
import { ReactComponent as VesselSVG } from '../icons/Label_segment_de_flotte.svg'
import { ReactComponent as OtherSVG } from '../icons/Point_interet_autre.svg'
import SetCoordinates from '../coordinates/SetCoordinates'
import { useDispatch, useSelector } from 'react-redux'
import { addInterestPoint, updateInterestPointKeyBeingDrawed } from '../../domain/reducers/InterestPoint'
import { getCoordinates } from '../../utils'
import { CoordinatesFormat, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../domain/entities/map'
import { transform } from 'ol/proj'
import saveInterestPointFeature from '../../domain/use_cases/saveInterestPointFeature'

const SaveInterestPoint = (
  {
    healthcheckTextWarning,
    isOpen,
    close
  }) => {
  const dispatch = useDispatch()

  const { coordinatesFormat } = useSelector(state => state.map)
  const {
    /** @type {InterestPoint | null} interestPointBeingDrawed */
    interestPointBeingDrawed,
    isEditing
  } = useSelector(state => state.interestPoint)

  const [coordinates, setCoordinates] = useState([])
  const [name, setName] = useState('')
  const [observations, setObservations] = useState('')
  const [type, setType] = useState(interestPointType.FISHING_VESSEL)

  useEffect(() => {
    if (isEditing && interestPointBeingDrawed) {
      setName(interestPointBeingDrawed.name)
      setObservations(interestPointBeingDrawed.observations)
      setType(interestPointBeingDrawed.type)
    }
  }, [interestPointBeingDrawed, isEditing])

  useEffect(() => {
    if (!isOpen && !interestPointBeingDrawed) {
      setCoordinates([])
      setName('')
      setObservations('')
      setType('')
    } else if (!interestPointBeingDrawed) {
      setType(interestPointType.FISHING_VESSEL)
    }
  }, [isOpen, interestPointBeingDrawed])

  useEffect(() => {
    if (coordinatesFormat) {
      if (interestPointBeingDrawed && interestPointBeingDrawed.coordinates && interestPointBeingDrawed.coordinates.length) {
        const ddCoordinates = getCoordinates(interestPointBeingDrawed.coordinates, OPENLAYERS_PROJECTION, CoordinatesFormat.DECIMAL_DEGREES)
          .map(coordinate => {
            return parseFloat(coordinate.replace(/°/g, ''))
          })
        setCoordinates(ddCoordinates)
      }
    }
  }, [interestPointBeingDrawed, isEditing])

  useEffect(() => {
    if (interestPointBeingDrawed && name && interestPointBeingDrawed.name !== name) {
      dispatch(updateInterestPointKeyBeingDrawed({
        key: 'name',
        value: name
      }))
    }
  }, [name, interestPointBeingDrawed])

  useEffect(() => {
    if (interestPointBeingDrawed && observations && interestPointBeingDrawed.observations !== observations) {
      dispatch(updateInterestPointKeyBeingDrawed({
        key: 'observations',
        value: observations
      }))
    }
  }, [observations, interestPointBeingDrawed])

  useEffect(() => {
    if (interestPointBeingDrawed && type && interestPointBeingDrawed.type !== type) {
      dispatch(updateInterestPointKeyBeingDrawed({
        key: 'type',
        value: type
      }))
    }
  }, [type, interestPointBeingDrawed])

  /**
   * Compare with previous coordinates and update interest point coordinates
   * @param {number[]} nextCoordinates - Coordinates ([latitude, longitude]) to update, in decimal format.
   * @param {number[]} coordinates - Previous coordinates ([latitude, longitude]), in decimal format.
   */
  const updateCoordinates = (nextCoordinates, coordinates) => {
    if (nextCoordinates && nextCoordinates.length) {
      if (!coordinates || !coordinates.length || areDistinct(nextCoordinates, coordinates)) {
        const updatedCoordinates = transform([nextCoordinates[1], nextCoordinates[0]], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
        dispatch(updateInterestPointKeyBeingDrawed({
          key: 'coordinates',
          value: updatedCoordinates
        }))
      }
    }
  }

  function areDistinct (nextCoordinates, coordinates) {
    return nextCoordinates &&
      nextCoordinates.length &&
      coordinates.length &&
      !isNaN(coordinates[0]) &&
      !isNaN(coordinates[1]) &&
      !isNaN(nextCoordinates[0]) &&
      !isNaN(nextCoordinates[1]) &&
      (coordinates[0] !== nextCoordinates[0] ||
        coordinates[1] !== nextCoordinates[1])
  }

  const saveInterestPoint = () => {
    if (type && coordinates && coordinates.length) {
      dispatch(saveInterestPointFeature())
      dispatch(addInterestPoint())
      close()
    }
  }

  return (
    <Wrapper
      healthcheckTextWarning={healthcheckTextWarning}
      isOpen={isOpen}>
      <Header>
        Créer un point d&apos;intérêt
      </Header>
      <Body>
        <p>Coordonnées</p>
        <SetCoordinates
          coordinates={coordinates}
          updateCoordinates={updateCoordinates}
        />
        <p>Type de point</p>
        <RadioWrapper>
          <RadioGroup
            name="interestTypeRadio"
            value={type}
            onChange={value => {
              setType(value)
            }}
          >
            <Radio value={interestPointType.CONTROL_ENTITY}>
              <Control/>
              Moyen de contrôle
            </Radio>
            <Radio value={interestPointType.FISHING_VESSEL}>
              <Vessel/>
              Navire de pêche
            </Radio>
            <Radio value={interestPointType.FISHING_GEAR}>
              <Gear/>
              Engin de pêche
            </Radio>
            <Radio value={interestPointType.OTHER}>
              <Other/>
              Autre point
            </Radio>
          </RadioGroup>
        </RadioWrapper>
        <p>Libellé du point</p>
        <Name
          data-cy={'interest-point-name-input'}
          type='text'
          onChange={e => setName(e.target.value)}
          value={name}
        />
        <p>Observations</p>
        <textarea
          data-cy={'interest-point-observations-input'}
          onChange={e => setObservations(e.target.value)}
          value={observations}
        />
        <OkButton
          data-cy={'interest-point-save'}
          onClick={saveInterestPoint}
        >
          OK
        </OkButton>
        <CancelButton
          disabled={isEditing}
          onClick={close}
        >
          Annuler
        </CancelButton>
      </Body>
    </Wrapper>
  )
}

const Name = styled.input`
  width: 100%;
`

const RadioWrapper = styled.div`
  margin-top: 10px;
`

const CancelButton = styled.button`
  border: 1px solid ${COLORS.grayDarkerThree};
  width: 130px;
  padding: 5px 12px;
  margin: 15px 0 0 15px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.grayDarker};
  }
`

const OkButton = styled.button`
  background: ${COLORS.grayDarkerThree};
  width: 130px;
  padding: 5px 12px;
  margin: 15px 0 0;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  
  :hover, :focus {
    background: ${COLORS.grayDarkerThree};
  }
`

const Body = styled.div`
  text-align: left;
  font-size: 13px;
  color: ${COLORS.textGray};
  margin: 10px 15px;
  
  p {
    margin: 0;
    font-size: 13px;
  }
  
  p:nth-of-type(2) {
    margin-top: 15px;
    font-size: 13px;
  }
  
  p:nth-of-type(3) {
    margin-top: 15px;
    font-size: 13px;
  }
  
  p:nth-of-type(4) {
    margin-top: 15px;
    font-size: 13px;
  }
  
  input {
    margin-top: 7px;
    color: ${COLORS.grayDarkerThree};
    background: ${COLORS.grayLighter};
    border: none;
    height: 27px;
    padding-left: 8px;
  }
  
  textarea {
    color: ${COLORS.grayDarkerThree};
    margin-top: 7px;
    background: ${COLORS.grayLighter};
    border: none;
    min-height: 50px;
    padding-left: 8px;
    padding-top: 3px;
    width: 100% !important;
    resize: vertical;
  }
`

const Header = styled.div`
  background: ${COLORS.textGray};
  color: ${COLORS.grayBackground};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const Wrapper = styled(MapComponentStyle)`
  width: 306px;
  background: ${COLORS.background};
  margin-right: ${props => props.isOpen ? '45px' : '-320px'};
  opacity:  ${props => props.isOpen ? '1' : '0'};
  top: 249px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

const iconStyle = css`
  vertical-align: sub;
  width: 14px;
  margin-left: 3px;
  margin-right: 7px;
`

const Gear = styled(GearSVG)`
  ${iconStyle}
`

const Control = styled(ControlSVG)`
  ${iconStyle}
`

const Vessel = styled(VesselSVG)`
  ${iconStyle}
`

const Other = styled(OtherSVG)`
  ${iconStyle}
`

export default SaveInterestPoint
