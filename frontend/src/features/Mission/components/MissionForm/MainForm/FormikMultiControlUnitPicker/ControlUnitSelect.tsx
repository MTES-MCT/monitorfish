import { FIVE_MINUTES } from '@api/APIWorker'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  Accent,
  Icon,
  IconButton,
  Level,
  Message,
  MultiSelect,
  Select,
  TextInput,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { isNotArchived } from '@utils/isNotArchived'
import { Mission } from 'domain/entities/mission/types'
import { useField } from 'formik'
import { uniqBy } from 'lodash'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import {
  findControlUnitByname,
  mapControlUnitsToUniqueSortedNamesAsOptions,
  mapToSortedResourcesAsOptions
} from './utils'
import { useGetEngagedControlUnitsQuery } from '../../../../monitorenvMissionApi'
import { INITIAL_MISSION_CONTROL_UNIT } from '../../constants'

import type { MissionMainFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { LegacyControlUnit } from 'domain/types/legacyControlUnit'
import type { Promisable } from 'type-fest'

type ControlUnitSelectProps = Readonly<{
  allAdministrationsAsOptions: Option[]
  allControlUnits: LegacyControlUnit.LegacyControlUnit[]
  error:
    | {
        administration: string
        name: string
      }
    | undefined
  index: number
  onChange: (
    index: number,
    nextControlUnit: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
  ) => Promisable<void>
  onDelete: (index: number) => Promisable<void>
}>
export function ControlUnitSelect({
  allAdministrationsAsOptions,
  allControlUnits,
  error,
  index,
  onChange,
  onDelete
}: ControlUnitSelectProps) {
  const { newWindowContainerRef } = useNewWindow()
  const selectedPath = useMainAppSelector(state => state.sideWindow.selectedPath)
  const { data: engagedControlUnitsData } = useGetEngagedControlUnitsQuery(undefined, { pollingInterval: FIVE_MINUTES })
  const [{ value }, ,] = useField<LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft>(
    `controlUnits.${index}`
  )

  const engagedControlUnits = useMemo(() => {
    if (!engagedControlUnitsData) {
      return []
    }

    return engagedControlUnitsData
  }, [engagedControlUnitsData])

  // Include archived control units (and administrations) if they're already selected
  const activeAndSelectedControlUnits = useMemo(
    () => allControlUnits.filter(controlUnit => isNotArchived(controlUnit) || value.name === controlUnit.name) || [],
    [allControlUnits, value]
  )

  const engagedControlUnit = engagedControlUnits.find(engaged => engaged.controlUnit.id === value.id)
  const isLoading = !allControlUnits.length
  const isEdition = selectedPath.id

  const filteredNamesAsOptions = useMemo((): Option[] => {
    if (!value.administration) {
      return mapControlUnitsToUniqueSortedNamesAsOptions(activeAndSelectedControlUnits)
    }

    const selectedAdministrationControlUnits = activeAndSelectedControlUnits.filter(
      ({ administration }) => administration === value.administration
    )

    return mapControlUnitsToUniqueSortedNamesAsOptions(selectedAdministrationControlUnits)
  }, [activeAndSelectedControlUnits, value])

  // Include archived resources if they're already selected
  const activeWithSelectedControlUnitResources = useMemo(() => {
    const activeControlUnitResources =
      activeAndSelectedControlUnits.find(unit => unit.administration === value.administration && unit.id === value.id)
        ?.resources ?? []
    // TODO Remove LegacyControlUnitResource to filter archived resources :
    //  .filter(isNotArchived)

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
    (nextName: string | undefined) => {
      if (isLoading) {
        return
      }

      const nextSelectedControlUnit = nextName ? findControlUnitByname(allControlUnits, nextName) : undefined
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
    },
    [allControlUnits, value, index, isLoading, onChange]
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

  const controlUnitWarningMessage = useMemo(() => {
    if (!engagedControlUnit) {
      return ''
    }

    if (engagedControlUnit.missionSources.length === 1) {
      return `Cette unité est actuellement sélectionnée dans une autre mission en cours ouverte par le ${
        Mission.MissionSourceLabel[engagedControlUnit.missionSources[0]!]
      }.`
    }

    if (engagedControlUnit.missionSources.length > 1) {
      return `Cette unité est actuellement sélectionnée dans plusieurs autres missions en cours, ouvertes par le ${engagedControlUnit.missionSources
        .map(source => Mission.MissionSourceLabel[source])
        .join(' et le ')}.`
    }

    return ''
  }, [engagedControlUnit])

  return (
    <Wrapper>
      <UnitWrapper>
        <Select
          baseContainer={newWindowContainerRef.current}
          disabled={isLoading}
          error={error?.administration}
          isErrorMessageHidden
          label={`Administration ${index + 1}`}
          name={`administration_${index}`}
          onChange={handleAdministrationChange}
          options={allAdministrationsAsOptions}
          searchable
          value={value.administration}
        />
        <Select
          // TODO Investigate why updating `filteredNamesAsOptions` doesn't re-render the Select.
          key={JSON.stringify(filteredNamesAsOptions)}
          baseContainer={newWindowContainerRef.current}
          disabled={isLoading}
          error={error?.name}
          isErrorMessageHidden
          label={`Unité ${index + 1}`}
          name={`name_${index}`}
          onChange={handleNameChange}
          options={filteredNamesAsOptions}
          searchable
          value={value.name}
        />
        {!isEdition && !!engagedControlUnit && <Message level={Level.WARNING}>{controlUnitWarningMessage}</Message>}
        <MultiSelect
          baseContainer={newWindowContainerRef.current}
          disabled={isLoading || !value.administration || !value.name}
          isUndefinedWhenDisabled
          label={`Moyen ${index + 1}`}
          name={`resources_${index}`}
          onChange={handleResourcesChange}
          options={controlUnitResourcesAsOptions}
          optionValueKey="id"
          value={value.resources}
        />
        <TextInput
          disabled={isLoading || !value.name}
          label={`Contact de l’unité ${index + 1}`}
          name={`contact_${index}`}
          onChange={handleContactChange}
          value={value.contact}
        />
      </UnitWrapper>

      {index > 0 && (
        <IconButton
          accent={Accent.SECONDARY}
          aria-label="Supprimer cette unité"
          Icon={Icon.Delete}
          onClick={handleDelete}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;

  > button {
    margin: 22px 0 0 8px;
  }
`

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
