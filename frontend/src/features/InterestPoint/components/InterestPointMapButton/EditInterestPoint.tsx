import { deleteInterestPoint } from '@features/InterestPoint/useCases/deleteInterestPoint'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import {
  Accent,
  Button,
  type Coordinates,
  coordinatesAreDistinct,
  CoordinatesInput,
  Icon,
  MapMenuDialog,
  MultiRadio,
  Textarea,
  TextInput,
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

  const updateName = (name: string | undefined) => {
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

  const updateObservations = (observations: string | undefined) => {
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
    <Wrapper data-cy="edit-interest-point" isLeftBox isOpen={isOpen}>
      <Header>
        <CloseButton Icon={Icon.Close} onClick={onCancel} title="Fermer le point d'intérêt" />
        <Title>Créer un point d&apos;intérêt</Title>
      </Header>
      <Body>
        {isOpen && (
          <CoordinatesInput
            coordinatesFormat={coordinatesFormat}
            defaultValue={coordinates}
            label="Localisation"
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
        <StyledTextInput
          data-cy="interest-point-name-input"
          label="Titre du point"
          name="interest-point-name-input"
          onChange={nextValue => updateName(nextValue)}
          value={interestPointEdited?.properties.name ?? ''}
        />
        <StyledTextarea
          data-cy="interest-point-observations-input"
          label="Description du point"
          name="interest-point-observations-input"
          onChange={nextValue => updateObservations(nextValue)}
          value={interestPointEdited?.properties.observations ?? ''}
        />
        <ButtonsRow>
          <StyledButton accent={Accent.SECONDARY} disabled={isEdition} onClick={onCancel}>
            Annuler
          </StyledButton>
          <StyledButton data-cy="interest-point-save" onClick={saveInterestPoint}>
            Valider
          </StyledButton>
        </ButtonsRow>
      </Body>
    </Wrapper>
  )
}

const Header = styled(MapMenuDialog.Header)`
  height: 22px;
`

const Title = styled(MapMenuDialog.Title)`
  text-align: center;
  width: 100%;
  margin-right: 37px;
`

const CloseButton = styled(MapMenuDialog.CloseButton)`
  margin-top: 4px;
`

const StyledButton = styled(Button)`
  width: 100%;
`

const ButtonsRow = styled.div`
  display: flex;
  margin-top: 32px;
  gap: 8px;
`

const StyledTextInput = styled(TextInput)`
  margin-top: 16px;
`

const StyledTextarea = styled(Textarea)`
  margin-top: 16px;
  width: 258px;
`

const RadioWrapper = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
`

const Body = styled.div`
  color: ${THEME.color.slateGray};
  font-size: 13px;
  margin: 10px 15px;
  text-align: left;
`

const Wrapper = styled(MapToolBox)`
  bottom: 0;
  width: 306px;
`
