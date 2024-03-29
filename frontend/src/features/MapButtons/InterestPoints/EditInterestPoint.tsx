import { INTEREST_POINTS_OPTIONS } from '@features/MapButtons/InterestPoints/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { MultiRadio, THEME } from '@mtes-mct/monitor-ui'
import { transform } from 'ol/proj'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { coordinatesAreDistinct, getCoordinates } from '../../../coordinates'
import { InterestPointType } from '../../../domain/entities/interestPoints'
import { CoordinatesFormat, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { addInterestPoint, updateInterestPointKeyBeingDrawed } from '../../../domain/shared_slices/InterestPoint'
import saveInterestPointFeature from '../../../domain/use_cases/interestPoint/saveInterestPointFeature'
import { SetCoordinates } from '../../coordinates/SetCoordinates'
import { MapToolBox } from '../shared/MapToolBox'

import type { InterestPointOptionValueType } from '@features/MapButtons/InterestPoints/constants'

// TODO Refactor this component
// - Move the state logic to the reducer
// - Use formik (or at least uncontrolled form components)
type EditInterestPointProps = {
  close: () => void
  isOpen: boolean
}
export function EditInterestPoint({ close, isOpen }: EditInterestPointProps) {
  const dispatch = useMainAppDispatch()

  const interestPointBeingDrawed = useMainAppSelector(state => state.interestPoint.interestPointBeingDrawed)
  const isEditing = useMainAppSelector(state => state.interestPoint.isEditing)

  /** Coordinates formatted in DD [latitude, longitude] */
  const coordinates: number[] = useMemo(() => {
    if (!interestPointBeingDrawed?.coordinates?.length) {
      return []
    }

    const [latitude, longitude] = getCoordinates(
      interestPointBeingDrawed.coordinates,
      OPENLAYERS_PROJECTION,
      CoordinatesFormat.DECIMAL_DEGREES,
      false
    )
    if (!latitude || !longitude) {
      return []
    }

    return [parseFloat(latitude.replace(/°/g, '')), parseFloat(longitude.replace(/°/g, ''))]
  }, [interestPointBeingDrawed?.coordinates])

  const updateName = useCallback(
    name => {
      if (interestPointBeingDrawed?.name !== name) {
        dispatch(
          updateInterestPointKeyBeingDrawed({
            key: 'name',
            value: name
          })
        )
      }
    },
    [dispatch, interestPointBeingDrawed?.name]
  )

  const updateObservations = useCallback(
    observations => {
      if (interestPointBeingDrawed?.observations !== observations) {
        dispatch(
          updateInterestPointKeyBeingDrawed({
            key: 'observations',
            value: observations
          })
        )
      }
    },
    [dispatch, interestPointBeingDrawed?.observations]
  )

  const updateType = useCallback(
    type => {
      if (type && interestPointBeingDrawed?.type !== type && coordinates?.length) {
        dispatch(
          updateInterestPointKeyBeingDrawed({
            key: 'type',
            value: type
          })
        )
      }
    },
    [dispatch, interestPointBeingDrawed?.type, coordinates]
  )

  /**
   * Compare with previous coordinates and update interest point coordinates
   * @param {number[]} nextCoordinates - Coordinates ([latitude, longitude]) to update, in decimal format.
   * @param {number[]} coordinates - Previous coordinates ([latitude, longitude]), in decimal format.
   */
  const updateCoordinates = useCallback(
    (nextCoordinates: number[], previousCoordinates: number[]) => {
      if (nextCoordinates?.length) {
        if (!previousCoordinates?.length || coordinatesAreDistinct(nextCoordinates, previousCoordinates)) {
          const [latitude, longitude] = nextCoordinates
          if (!latitude || !longitude) {
            return
          }

          // Convert to [longitude, latitude] and OpenLayers projection
          const updatedCoordinates = transform([longitude, latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
          dispatch(
            updateInterestPointKeyBeingDrawed({
              key: 'coordinates',
              value: updatedCoordinates
            })
          )
        }
      }
    },
    [dispatch]
  )

  const saveInterestPoint = () => {
    if (coordinates?.length) {
      dispatch(saveInterestPointFeature())
      dispatch(addInterestPoint())
      close()
    }
  }

  return (
    <Wrapper data-cy="save-interest-point" isOpen={isOpen}>
      <Header>Créer un point d&apos;intérêt</Header>
      <Body>
        <p>Coordonnées</p>
        {isOpen && <SetCoordinates coordinates={coordinates} updateCoordinates={updateCoordinates} />}
        <RadioWrapper>
          <MultiRadio<InterestPointOptionValueType>
            label="Type de point"
            name="interest-point-type-radio"
            onChange={nextValue => updateType(nextValue?.name)}
            options={INTEREST_POINTS_OPTIONS}
            optionValueKey="name"
            renderMenuItem={(label, value) => (
              <>
                <value.Icon />
                {label}
              </>
            )}
            value={
              INTEREST_POINTS_OPTIONS.find(
                option => option.value.name === interestPointBeingDrawed?.type || InterestPointType.OTHER
              )?.value
            }
          />
        </RadioWrapper>
        <p>Libellé du point</p>
        <Name
          data-cy="interest-point-name-input"
          onChange={e => updateName(e.target.value)}
          type="text"
          value={interestPointBeingDrawed?.name || ''}
        />
        <p>Observations</p>
        <textarea
          data-cy="interest-point-observations-input"
          onChange={e => updateObservations(e.target.value)}
          value={interestPointBeingDrawed?.observations || ''}
        />
        <OkButton data-cy="interest-point-save" onClick={saveInterestPoint}>
          OK
        </OkButton>
        <CancelButton disabled={isEditing} onClick={close}>
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
  margin-top: 12px;
  margin-bottom: 12px;
`

const CancelButton = styled.button`
  border: 1px solid ${THEME.color.lightGray};
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  margin: 15px 0 0 15px;
  padding: 5px 12px;
  width: 130px;

  :disabled {
    border: 1px solid ${THEME.color.lightGray};
    color: ${THEME.color.slateGray};
  }
`

const OkButton = styled.button`
  background: ${THEME.color.charcoal};
  color: ${THEME.color.gainsboro};
  font-size: 13px;
  margin: 15px 0 0;
  padding: 5px 12px;
  width: 130px;

  :hover,
  :focus {
    background: ${THEME.color.charcoal};
  }
`

const Body = styled.div`
  color: ${THEME.color.slateGray};
  font-size: 13px;
  margin: 10px 15px;
  text-align: left;

  p {
    font-size: 13px;
    margin: 0;
  }

  p:nth-of-type(2) {
    font-size: 13px;
    margin-top: 15px;
  }

  p:nth-of-type(3) {
    font-size: 13px;
    margin-top: 15px;
  }

  p:nth-of-type(4) {
    font-size: 13px;
    margin-top: 15px;
  }

  input {
    background: ${THEME.color.gainsboro};
    border: none;
    color: ${THEME.color.gunMetal};
    height: 27px;
    margin-top: 7px;
    padding-left: 8px;
  }

  textarea {
    background: ${THEME.color.gainsboro};
    border: none;
    color: ${THEME.color.gunMetal};
    margin-top: 7px;
    min-height: 50px;
    padding-left: 8px;
    padding-top: 3px;
    resize: vertical;
    width: 100% !important;
  }
`

const Header = styled.div`
  background: ${THEME.color.charcoal};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${THEME.color.gainsboro};
  font-size: 16px;
  padding: 9px 0 7px 15px;
  text-align: left;
`

const Wrapper = styled(MapToolBox)`
  top: 333px;
  width: 306px;
`
