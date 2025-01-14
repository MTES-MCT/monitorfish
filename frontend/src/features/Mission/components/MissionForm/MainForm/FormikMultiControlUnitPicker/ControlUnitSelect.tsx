import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { centerOnStation } from '@features/ControlUnit/useCases/centerOnStation'
import { useGetStationsQuery } from '@features/Station/stationApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  Accent,
  Button,
  getOptionsFromIdAndName,
  Icon,
  IconButton,
  MultiSelect,
  Select,
  Size,
  TextInput
} from '@mtes-mct/monitor-ui'
import { displayedComponentActions } from 'domain/shared_slices/DisplayedComponent'
import { useField, useFormikContext } from 'formik'
import { sortBy, uniqBy } from 'lodash'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { ControlUnitWarningMessage } from './ControlUnitWarningMessage'
import {
  getActiveAndSelectedAdministrationAsOptions,
  getActiveAndSelectedControlUnits,
  mapToSortedResourcesAsOptions
} from './utils'
import { useGetEngagedControlUnitsQuery } from '../../../../monitorenvMissionApi'
import { INITIAL_MISSION_CONTROL_UNIT } from '../../constants'
import { missionFormActions } from '../../slice'

import type { MissionMainFormValues } from '../../types'
import type { LegacyControlUnit } from '@features/ControlUnit/legacyControlUnit'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

type ControlUnitSelectProps = Readonly<{
  activeAdministrationsAsOptions: Option[]
  allControlUnits: LegacyControlUnit.LegacyControlUnit[]
  error:
    | {
        administration: string
        name: string
      }
    | undefined
  index: number
  missionId: number | undefined
  onChange: (
    index: number,
    nextControlUnit: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
  ) => Promisable<void>
  onDelete: (index: number) => Promisable<void>
}>
export function ControlUnitSelect({
  activeAdministrationsAsOptions,
  allControlUnits,
  error,
  index,
  missionId,
  onChange,
  onDelete
}: ControlUnitSelectProps) {
  const selectedPath = useMainAppSelector(state => state.sideWindow.selectedPath)
  const engagedControlUnit = useMainAppSelector(state => state.missionForm.engagedControlUnit)

  const { data: stations } = useGetStationsQuery(undefined, RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS)

  const dispatch = useMainAppDispatch()

  const { setFieldValue, values } = useFormikContext<MissionMainFormValues>()

  const [{ value }, ,] = useField<LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft>(
    `controlUnits.${index}`
  )

  // Include archived control units (and administrations) of not found control units if they're already selected
  const activeAndSelectedControlUnits = useMemo(
    () => getActiveAndSelectedControlUnits(allControlUnits, value),
    [allControlUnits, value]
  )

  // Include missing administration
  const activeAndSelectedAdministrationAsOptions = useMemo(
    () => getActiveAndSelectedAdministrationAsOptions(activeAdministrationsAsOptions, value),
    [activeAdministrationsAsOptions, value]
  )

  const isLoading = !allControlUnits.length
  const isEdition = selectedPath.id

  const { data: engagedControlUnits = [] } = useGetEngagedControlUnitsQuery(undefined, {
    skip: !!isEdition
  })

  const filteredUnitsAsOptions = useMemo(() => {
    if (!value.administration) {
      return sortBy(getOptionsFromIdAndName(activeAndSelectedControlUnits), ({ name }) => name)
    }

    const selectedAdministrationControlUnits = activeAndSelectedControlUnits.filter(
      ({ administration }) => administration === value.administration
    )

    return sortBy(getOptionsFromIdAndName(selectedAdministrationControlUnits), ({ name }) => name)
  }, [activeAndSelectedControlUnits, value])

  // Include archived resources if they're already selected
  const activeWithSelectedControlUnitResources = useMemo(() => {
    const activeControlUnitResources =
      activeAndSelectedControlUnits.find(unit => unit.administration === value.administration && unit.id === value.id)
        ?.resources ?? []

    const resources = [...activeControlUnitResources, ...value.resources]

    return uniqBy(resources, 'id')
  }, [activeAndSelectedControlUnits, value])

  const controlUnitResourcesAsOptions = useMemo(
    (): Option<LegacyControlUnit.LegacyControlUnitResource>[] =>
      activeWithSelectedControlUnitResources
        ? mapToSortedResourcesAsOptions(activeWithSelectedControlUnitResources)
        : [],
    [activeWithSelectedControlUnitResources]
  )

  const handleAdministrationChange = useCallback(
    (nextAdministration: string | undefined) => {
      const nextControlUnit: MissionMainFormValues['controlUnits'][0] = {
        ...INITIAL_MISSION_CONTROL_UNIT,
        administration: nextAdministration
      }

      onChange(index, nextControlUnit)
    },
    [index, onChange]
  )

  const handleNameChange = useCallback(
    (nextId: number | undefined) => {
      if (isLoading) {
        return
      }

      const nextSelectedControlUnit = nextId
        ? allControlUnits.find(controlUnit => controlUnit.id === nextId)
        : undefined
      const nextControlUnit: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft =
        nextSelectedControlUnit
          ? {
              ...nextSelectedControlUnit,
              contact: value.contact,
              resources: value.resources
            }
          : {
              ...INITIAL_MISSION_CONTROL_UNIT,
              administration: value.administration
            }

      onChange(index, nextControlUnit)

      if (!isEdition) {
        const controlUnitAlreadyEngaged = engagedControlUnits.find(
          engaged => engaged.controlUnit.id === nextSelectedControlUnit?.id
        )
        if (controlUnitAlreadyEngaged) {
          dispatch(missionFormActions.setEngagedControlUnit(controlUnitAlreadyEngaged))

          return
        }
        dispatch(missionFormActions.setEngagedControlUnit(undefined))
      }
    },
    [allControlUnits, dispatch, isEdition, engagedControlUnits, value, index, isLoading, onChange]
  )

  const handleResourcesChange = useCallback(
    (nextResources: LegacyControlUnit.LegacyControlUnitResource[] | undefined) => {
      const nextControlUnit: LegacyControlUnit.LegacyControlUnitDraft = {
        ...value,
        resources: nextResources ?? []
      }

      onChange(index, nextControlUnit)
    },
    [value, index, onChange]
  )

  const handleContactChange = useCallback(
    (nextValue: string | undefined) => {
      const nextControlUnit: LegacyControlUnit.LegacyControlUnitDraft = {
        ...value,
        contact: nextValue
      }

      onChange(index, nextControlUnit)
    },
    [value, index, onChange]
  )

  const handleDelete = useCallback(() => {
    onDelete(index)
  }, [index, onDelete])

  const zoomOnStation = () => {
    const selectedControlUnit = allControlUnits?.find(controlUnit => controlUnit.id === value.id)
    const stationsToHighlight = uniqBy(
      stations?.filter(base =>
        selectedControlUnit?.resources?.some(resource => base.controlUnitResourceIds.includes(resource.id))
      ),
      'id'
    )
    if (!selectedControlUnit) {
      return
    }
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isStationLayerDisplayed: true
      })
    )
    dispatch(centerOnStation(stationsToHighlight))
  }

  const addUnit = () => {
    const nextControlUnits = [...values.controlUnits, INITIAL_MISSION_CONTROL_UNIT]

    setFieldValue('controlUnits', nextControlUnits)
  }

  return (
    <UnitWrapper>
      <Select
        disabled={isLoading}
        error={error?.administration}
        isErrorMessageHidden
        isRequired={index === 0}
        label={`Administration ${index + 1}`}
        name={`mission_control_unit_administration_${index}`}
        onChange={handleAdministrationChange}
        options={activeAndSelectedAdministrationAsOptions}
        searchable
        value={value.administration}
      />
      <SelectAndZoomContainer>
        <Select
          // TODO Investigate why updating `filteredNamesAsOptions` doesn't re-render the Select.
          key={JSON.stringify(filteredUnitsAsOptions)}
          disabled={isLoading}
          error={error?.name}
          isErrorMessageHidden
          isRequired={index === 0}
          label={`Unité ${index + 1}`}
          name={`mission_control_unit_name_${index}`}
          onChange={handleNameChange}
          options={filteredUnitsAsOptions}
          searchable
          style={{ flex: 1 }}
          value={value.id}
        />
        <StyledIconButton
          accent={Accent.SECONDARY}
          disabled={controlUnitResourcesAsOptions?.length === 0 || !value}
          Icon={Icon.FocusZones}
          onClick={zoomOnStation}
          title={
            controlUnitResourcesAsOptions?.length === 0 || !value.id
              ? 'Cette unité n’a pas de moyens, donc pas de bases'
              : 'Centrer la carte sur les bases de l’unité'
          }
        />
      </SelectAndZoomContainer>
      {!isEdition && <ControlUnitWarningMessage controlUnitIndex={index} missionId={missionId} />}
      <MultiSelect
        disabled={isLoading || !value.administration || !value.name}
        isUndefinedWhenDisabled
        label={`Moyen ${index + 1}`}
        name={`mission_control_unit_resources_${index}`}
        onChange={handleResourcesChange}
        options={controlUnitResourcesAsOptions}
        optionValueKey="id"
        value={value.resources}
      />
      <TextInput
        disabled={isLoading || !value.name}
        label={`Contact de l’unité ${index + 1}`}
        name={`mission_control_unit_contact_${index}`}
        onChange={handleContactChange}
        value={value.contact}
      />
      <Buttonscontainer>
        {index > 0 && (
          <StyledButton accent={Accent.SECONDARY} Icon={Icon.Delete} onClick={handleDelete} size={Size.SMALL}>
            Supprimer l&apos;unité
          </StyledButton>
        )}
        {values.controlUnits.length === index + 1 && (
          <Button
            accent={Accent.SECONDARY}
            data-cy="add-other-control-unit"
            disabled={!!engagedControlUnit}
            Icon={Icon.Plus}
            onClick={addUnit}
            size={Size.SMALL}
          >
            Ajouter une autre unité
          </Button>
        )}
      </Buttonscontainer>
    </UnitWrapper>
  )
}

const UnitWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  min-width: 384px;
  max-width: 384px;
  width: 384px;

  > div:not(:first-child) {
    margin-top: 8px;
  }
`
const SelectAndZoomContainer = styled.div`
  display: flex;
  gap: 8px;
`

const StyledIconButton = styled(IconButton)`
  align-self: end;
`
const Buttonscontainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`
const StyledButton = styled(Button)`
  svg {
    color: ${p => p.theme.color.maximumRed};
  }
`
