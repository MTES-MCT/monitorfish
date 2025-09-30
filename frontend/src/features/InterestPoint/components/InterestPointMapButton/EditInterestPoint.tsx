import { deleteInterestPoint } from '@features/InterestPoint/useCases/deleteInterestPoint'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { Header } from '@features/Map/components/MapButtons/shared/styles'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import {
  type Coordinates,
  coordinatesAreDistinct,
  CoordinatesInput,
  Label,
  MultiRadio,
  THEME
} from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import styled from 'styled-components'

import { INTEREST_POINTS_OPTIONS } from './constants'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { interestPointActions, interestPointSelectors } from '../../slice'
import { InterestPointType } from '../../utils'

// TODO Refactor this component
// - Move the state logic to the reducer
// - Use formik (or at least uncontrolled form components)
type EditInterestPointProps = Readonly<{
  isOpen: boolean
  onClose: () => void
}>

export function EditInterestPoint({ isOpen, onClose }: EditInterestPointProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const interestPointIdEdited = useMainAppSelector(state => state.interestPoint.interestPointIdEdited)
  const isEdition = useMainAppSelector(state => state.interestPoint.isEdition)

  const interestPointEdited = useMainAppSelector(state =>
    interestPointIdEdited
      ? interestPointSelectors.selectById(state.interestPoint.interestPoints, interestPointIdEdited)
      : undefined
  )

  /** Coordinates formatted in DD [latitude, longitude] */
  const coordinates: Coordinates | undefined = interestPointEdited?.geometry?.coordinates?.length
    ? [interestPointEdited?.geometry?.coordinates[1] as number, interestPointEdited?.geometry?.coordinates[0] as number]
    : undefined

  const updateName = name => {
    assertNotNullish(interestPointEdited)
    dispatch(
      interestPointActions.interestPointUpdated({
        ...interestPointEdited,
        properties: {
          ...interestPointEdited.properties,
          name
        }
      })
    )
  }

  const updateObservations = (observations: string) => {
    assertNotNullish(interestPointEdited)
    dispatch(
      interestPointActions.interestPointUpdated({
        ...interestPointEdited,
        properties: {
          ...interestPointEdited.properties,
          observations
        }
      })
    )
  }

  const updateType = (type: InterestPointType) => {
    assertNotNullish(interestPointEdited)
    dispatch(
      interestPointActions.interestPointUpdated({
        ...interestPointEdited,
        properties: {
          ...interestPointEdited.properties,
          type
        }
      })
    )
  }

  /**
   * Compare with previous coordinates and update interest point coordinates
   * @param {number[]} nextCoordinates - Coordinates ([latitude, longitude]) to update, in decimal format.
   * @param {number[]} previousCoordinates - Coordinates ([latitude, longitude]), in decimal format.
   */
  const updateCoordinates = (nextCoordinates: number[], previousCoordinates: number[]) => {
    assertNotNullish(interestPointIdEdited)
    assertNotNullish(interestPointEdited)

    if (!nextCoordinates?.length || !coordinatesAreDistinct(nextCoordinates, previousCoordinates)) {
      return
    }

    const nextCoordinatesInLonLat = [nextCoordinates[1] as number, nextCoordinates[0] as number]
    dispatch(
      interestPointActions.interestPointUpdated({
        ...interestPointEdited,
        geometry: {
          ...interestPointEdited.geometry,
          coordinates: nextCoordinatesInLonLat
        }
      })
    )
  }

  const saveInterestPoint = () => {
    dispatch(interestPointActions.interestPointEditionEnded())
    onClose()
    trackEvent({
      action: `Création ou édition d'un point d'intérêt`,
      category: 'INTEREST_POINT',
      name: isSuperUser ? 'CNSP' : 'EXT'
    })
  }

  const onCancel = () => {
    assertNotNullish(interestPointIdEdited)

    dispatch(deleteInterestPoint(interestPointIdEdited))
    onClose()
  }

  return (
    <Wrapper $isOpen={isOpen} data-cy="edit-interest-point">
      <Header>Créer un point d&apos;intérêt</Header>
      <Body>
        <p>Coordonnées</p>
        {isOpen && (
          <CoordinatesInput
            coordinatesFormat={coordinatesFormat}
            defaultValue={coordinates}
            isLabelHidden
            label="Coordonnées du point d'intérêt"
            name="interest-point-coordinates"
            onChange={updateCoordinates}
          />
        )}
        <RadioWrapper>
          <MultiRadio
            label="Type de point"
            name="interest-point-type-radio"
            onChange={nextValue => updateType(nextValue as InterestPointType)}
            options={INTEREST_POINTS_OPTIONS}
            value={
              INTEREST_POINTS_OPTIONS.find(
                option =>
                  option.value === interestPointEdited?.properties.type || option.value === InterestPointType.OTHER
              )?.value
            }
          />
        </RadioWrapper>
        <Label htmlFor="label">Libellé du point</Label>
        <Name
          data-cy="interest-point-name-input"
          id="label"
          onChange={e => updateName(e.target.value)}
          type="text"
          value={interestPointEdited?.properties.name ?? ''}
        />
        <Label htmlFor="observations">Observations</Label>
        <textarea
          data-cy="interest-point-observations-input"
          id="observations"
          onChange={e => updateObservations(e.target.value)}
          value={interestPointEdited?.properties.observations ?? ''}
        />
        <OkButton data-cy="interest-point-save" onClick={saveInterestPoint}>
          OK
        </OkButton>
        <CancelButton disabled={isEdition} onClick={onCancel}>
          Annuler
        </CancelButton>
      </Body>
    </Wrapper>
  )
}

const Name = styled.input`
  width: 100%;
  margin-bottom: 16px;
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

  &:disabled {
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

  &:hover,
  &:focus {
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

const Wrapper = styled(MapToolBox)`
  width: 306px;
`
