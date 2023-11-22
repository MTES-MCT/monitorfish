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
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import {
  findControlUnitByname,
  mapControlUnitsToUniqueSortedNamesAsOptions,
  mapControlUnitToSortedResourcesAsOptions
} from './utils'
import { FIVE_MINUTES } from '../../../../../api/APIWorker'
import { useGetEngagedControlUnitsQuery } from '../../../../../api/mission'
import { Mission } from '../../../../../domain/entities/mission/types'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { INITIAL_MISSION_CONTROL_UNIT } from '../../constants'
import { isValidControlUnit } from '../../utils'

import type { LegacyControlUnit } from '../../../../../domain/types/legacyControlUnit'
import type { MissionMainFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

export type ControlUnitSelectProps = {
  allAdministrationsAsOptions: Option[]
  allControlUnits: LegacyControlUnit.LegacyControlUnit[]
  allNamesAsOptions: Option[]
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
  value: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
}
export function ControlUnitSelect({
  allAdministrationsAsOptions,
  allControlUnits,
  allNamesAsOptions,
  error,
  index,
  onChange,
  onDelete,
  value
}: ControlUnitSelectProps) {
  const { newWindowContainerRef } = useNewWindow()
  const selectedPath = useMainAppSelector(state => state.sideWindow.selectedPath)
  const { data: engagedControlUnitsData } = useGetEngagedControlUnitsQuery(undefined, { pollingInterval: FIVE_MINUTES })

  const engagedControlUnits = useMemo(() => {
    if (!engagedControlUnitsData) {
      return []
    }

    return engagedControlUnitsData
  }, [engagedControlUnitsData])

  const [controlledValue, setControlledValue] = useState(value)
  const [selectedControlUnit, setSelectedControlUnit] = useState<LegacyControlUnit.LegacyControlUnit | undefined>(
    isValidControlUnit(value) ? value : undefined
  )

  const engagedControlUnit = engagedControlUnits.find(engaged => engaged.controlUnit.id === value.id)
  const isLoading = !allControlUnits.length
  const isEdition = selectedPath.id

  const filteredNamesAsOptions = useMemo((): Option[] => {
    if (!allControlUnits || !controlledValue.administration) {
      return allNamesAsOptions
    }

    const selectedAdministrationControlUnits = allControlUnits.filter(
      ({ administration }) => administration === controlledValue.administration
    )

    return mapControlUnitsToUniqueSortedNamesAsOptions(selectedAdministrationControlUnits)
  }, [allControlUnits, allNamesAsOptions, controlledValue])

  const selectedControlUnitResourcesAsOptions = useMemo(
    (): Option<LegacyControlUnit.LegacyControlUnitResource>[] =>
      selectedControlUnit ? mapControlUnitToSortedResourcesAsOptions(selectedControlUnit) : [],
    [selectedControlUnit]
  )

  const handleAdministrationChange = useCallback(
    (nextAdministration: string | undefined) => {
      const nextControlUnit: MissionMainFormValues['controlUnits'][0] = {
        ...INITIAL_MISSION_CONTROL_UNIT,
        administration: nextAdministration
      }

      setControlledValue(nextControlUnit)
      setSelectedControlUnit(undefined)

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
              contact: controlledValue.contact,
              resources: controlledValue.resources
            }
          : {
              ...INITIAL_MISSION_CONTROL_UNIT,
              administration: controlledValue.administration
            }

      setControlledValue(nextControlUnit)
      setSelectedControlUnit(nextSelectedControlUnit)

      onChange(index, nextControlUnit)
    },
    [allControlUnits, controlledValue, index, isLoading, onChange]
  )

  const handleResourcesChange = useCallback(
    (nextResources: LegacyControlUnit.LegacyControlUnitResource[] | undefined) => {
      const nextControlUnit: LegacyControlUnit.LegacyControlUnitDraft = {
        ...controlledValue,
        resources: nextResources || []
      }

      setControlledValue(nextControlUnit)

      onChange(index, nextControlUnit)
    },
    [controlledValue, index, onChange]
  )

  const handleContactChange = useCallback(
    (nextValue: string | undefined) => {
      const nextControlUnit: LegacyControlUnit.LegacyControlUnitDraft = {
        ...controlledValue,
        contact: nextValue
      }

      setControlledValue(nextControlUnit)

      onChange(index, nextControlUnit)
    },
    [controlledValue, index, onChange]
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
    // eslint-disable-next-line react/no-array-index-key
    <Wrapper key={`unit${index}`}>
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
          value={controlledValue.administration}
        />
        <Select
          baseContainer={newWindowContainerRef.current}
          disabled={isLoading}
          error={error?.name}
          isErrorMessageHidden
          label={`Unité ${index + 1}`}
          name={`name_${index}`}
          onChange={handleNameChange}
          options={filteredNamesAsOptions}
          searchable
          value={controlledValue.name}
        />
        {!isEdition && !!engagedControlUnit && <Message level={Level.WARNING}>{controlUnitWarningMessage}</Message>}
        <MultiSelect
          baseContainer={newWindowContainerRef.current}
          disabled={isLoading || !controlledValue.administration || !controlledValue.name}
          isUndefinedWhenDisabled
          label={`Moyen ${index + 1}`}
          name={`resources_${index}`}
          onChange={handleResourcesChange}
          options={selectedControlUnitResourcesAsOptions}
          optionValueKey="name"
          value={controlledValue.resources}
        />
        <TextInput
          disabled={isLoading || !controlledValue.name}
          label={`Contact de l’unité ${index + 1}`}
          name={`contact_${index}`}
          onChange={handleContactChange}
          value={controlledValue.contact}
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
