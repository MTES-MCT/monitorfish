import { ConfirmationModal } from '@components/ConfirmationModal'
import { Ellipsised } from '@components/Ellipsised'
import { Bold } from '@components/style'
import { LogbookSpeciesPresentation } from '@features/Logbook/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useGetVesselQuery } from '@features/Vessel/vesselApi'
import { FrontendError } from '@libs/FrontendError'
import {
  Accent,
  FormikCheckbox,
  FormikTextarea,
  Icon,
  IconButton,
  SimpleTable,
  THEME,
  usePrevious
} from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useField, useFormikContext } from 'formik'
import { isEqual } from 'lodash-es'
import { useEffect, useState } from 'react'

import { getDefaultFaoZones, getDefaultPresentationCodes } from '../utils'
import { ControlCheckTable } from './ControlCheckTable'
import { DEFAULT_SPECIES_EISR_APPLICABILITY, getSpeciesEISRApplicability } from './Species/getSpeciesEISRApplicability'
import { getLandControlNotLandedCheckRows, getSpeciesControlCheckRows } from './Species/speciesControlCheckRows'
import {
  AddSpeciesButton,
  DeleteCell,
  RequiredAsterisk,
  SpeciesTableWrapper,
  StyledCellSelect,
  StyledPickerTd,
  TdWithoutPaddingWhenActive
} from './Species/speciesTable.styles'
import { FaoZonesCell, SpeciesSelectCell, SpeciesTableRow, WeightCell } from './Species/SpeciesTableRow'
import { useForceSpeciesEISRFieldsNotApplicable } from './Species/useForceSpeciesEISRFieldsNotApplicable'
import { useRowActivation } from './Species/useRowActivation'
import { useSpeciesAndFaoOptions } from './Species/useSpeciesAndFaoOptions'
import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'
import { useIsEISREnabled } from '../../hooks/useIsEISREnabled'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Specy } from 'domain/types/specy'

const PRESENTATION_OPTIONS: Array<Option<string>> = Object.entries(LogbookSpeciesPresentation).map(([code, label]) => ({
  label: `${code} - ${label}`,
  value: code
}))

// On land controls these checks are hidden (pending clarification of the topic) and forced to N/A.
// `weightControlMethod` is a WeightControlMethod (not a ControlCheck) but both enums share the
// NOT_APPLICABLE literal.
const LAND_CONTROL_NOT_APPLICABLE_FIELDS: Array<keyof MissionActionFormValues> = [
  'approvedWeighingOperatorInformation',
  'weightControlMethod'
]

export function SpeciesField() {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const [input, , helper] = useField<MissionActionFormValues['speciesOnboard']>('speciesOnboard')
  const previousValue = usePrevious(input.value)
  const { updateSegments } = useGetMissionActionFormikUsecases()
  const isEISREnabled = useIsEISREnabled(values.actionDatetimeUtc)
  const { data: vessel } = useGetVesselQuery(values.vesselId ?? skipToken)
  const [speciesToDeleteIndex, setSpeciesToDeleteIndex] = useState<number | undefined>(undefined)

  const isLandControl = values.actionType === MissionAction.MissionActionType.LAND_CONTROL
  const legend = isLandControl ? 'Inspection des captures' : 'Inspection des espèces'

  const {
    customSearch,
    faoAreasAsOptions,
    getScipSpeciesTypeFromSpecyCode,
    getSpecyNameFromSpecyCode,
    speciesAsOptions
  } = useSpeciesAndFaoOptions()

  const activation = useRowActivation()
  const { deactivate, handlePickerClose, handlePickerOpen, hoveredIndex, isRowActive } = activation

  const speciesEISRApplicability =
    values.vesselId !== undefined
      ? getSpeciesEISRApplicability(input.value, getScipSpeciesTypeFromSpecyCode, vessel?.vesselLength, isLandControl)
      : DEFAULT_SPECIES_EISR_APPLICABILITY
  useForceSpeciesEISRFieldsNotApplicable(isEISREnabled, speciesEISRApplicability)

  useEffect(() => {
    if (!isLandControl) {
      return
    }

    LAND_CONTROL_NOT_APPLICABLE_FIELDS.forEach(field => {
      if (values[field] !== MissionAction.ControlCheck.NOT_APPLICABLE) {
        void setFieldValue(field, MissionAction.ControlCheck.NOT_APPLICABLE)
      }
    })
    // Only trigger from values of LAND_CONTROL_NOT_APPLICABLE_FIELDS const
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLandControl, setFieldValue, values.approvedWeighingOperatorInformation, values.weightControlMethod])

  /**
   * This is only used to re-compute fleet segments when a species is modified
   *  (`input.value.length === previousValue.length`).
   * This should NOT re-compute when:
   * - A species is added
   * - A species is removed
   * As these actions are handled below by functions `add()` and `remove()`.
   * */
  useEffect(() => {
    if (
      !!input.value &&
      !!previousValue &&
      input.value.length === previousValue.length &&
      !isEqual(input.value, previousValue)
    ) {
      updateSegments({
        ...values,
        speciesOnboard: input.value
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.value, previousValue])

  const addEmptySpecies = () => {
    const newSpecies: MissionAction.SpeciesOnboardControl = {
      controlledWeight: undefined,
      declaredWeight: undefined,
      faoZones: getDefaultFaoZones(isEISREnabled, values.faoAreas, vessel?.vesselLength),
      nbFish: undefined,
      presentationCodes: getDefaultPresentationCodes(isEISREnabled, vessel?.vesselLength),
      speciesCode: '',
      speciesName: undefined,
      underSized: false,
      underSizedWeight: undefined
    }

    helper.setValue([...(input.value ?? []), newSpecies])
  }

  const setSpecies = (index: number, newSpecy: Specy | undefined) => {
    if (!newSpecy || !input.value) {
      return
    }

    deactivate()

    const nextSpeciesOnboard = input.value.map((species, currentIndex) =>
      currentIndex === index
        ? {
            ...species,
            faoZones: species.faoZones ?? getDefaultFaoZones(isEISREnabled, values.faoAreas, vessel?.vesselLength),
            presentationCodes: species.presentationCodes?.length
              ? species.presentationCodes
              : getDefaultPresentationCodes(isEISREnabled, vessel?.vesselLength),
            speciesCode: newSpecy.code,
            speciesName: newSpecy.name
          }
        : species
    )

    updateSegments({
      ...values,
      speciesOnboard: nextSpeciesOnboard
    })
    helper.setValue(nextSpeciesOnboard)
  }

  const remove = (index: number) => {
    if (!input.value) {
      throw new FrontendError('`input.value` is undefined')
    }

    const nextSpeciesOnboard = input.value.filter((_, currentIndex) => currentIndex !== index)

    updateSegments({
      ...values,
      speciesOnboard: nextSpeciesOnboard
    })
    helper.setValue(nextSpeciesOnboard)
  }

  const setSpecyRowValue = (index: number, patch: Partial<MissionAction.SpeciesOnboardControl>) => {
    if (!input.value) {
      throw new FrontendError('`input.value` is undefined')
    }

    void helper.setValue(
      input.value.map((species, currentIndex) => (currentIndex === index ? { ...species, ...patch } : species))
    )
  }

  const updateNotLandedSpecy = (index: number) => {
    if (!input.value) {
      throw new FrontendError('`input.value` is undefined')
    }

    const nextSpeciesOnboard = input.value.map((species, currentIndex) =>
      currentIndex === index
        ? {
            ...species,
            isNotLanded: !species.isNotLanded
          }
        : species
    )

    updateSegments({
      ...values,
      speciesOnboard: nextSpeciesOnboard
    })
    helper.setValue(nextSpeciesOnboard)
  }

  if (!speciesAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend={legend} />
  }

  const isDisabled = values.isUnitBoarded === false
  const actionColumnWidth = isLandControl ? 52 : 21
  const controlledWeightLabel = isLandControl ? 'Pesée' : 'Estimé'
  const hasNotLandedSpecies = (input.value ?? []).some(species => species.isNotLanded)

  return (
    <FieldsetGroup isLight legend={legend}>
      <ControlCheckTable rows={getSpeciesControlCheckRows(isLandControl, isEISREnabled, speciesEISRApplicability)} />

      <FieldsetGroupSeparator marginBottom={12} />
      <SpeciesTableWrapper>
        <SimpleTable.Table>
          <SimpleTable.Head>
            <tr>
              <SimpleTable.Th $width={isEISREnabled ? 165 : 320}>Espèce</SimpleTable.Th>
              <SimpleTable.Th $width={isEISREnabled ? 55 : 80}>
                {isEISREnabled ? 'Déclaré' : 'Qté déclarée'}
              </SimpleTable.Th>
              <SimpleTable.Th $width={isEISREnabled ? 55 : 80}>
                {isEISREnabled ? controlledWeightLabel : `Qté ${controlledWeightLabel}`}
              </SimpleTable.Th>
              <SimpleTable.Th $width={isEISREnabled ? 55 : 80}>
                {isEISREnabled ? 'Ss-taille' : 'Sous-taille'}
              </SimpleTable.Th>
              {isEISREnabled && <SimpleTable.Th $width={70}>Présentation</SimpleTable.Th>}
              {isEISREnabled && (
                <SimpleTable.Th $width={70}>
                  Zone <RequiredAsterisk>*</RequiredAsterisk>
                </SimpleTable.Th>
              )}
              <SimpleTable.Th $width={isEISREnabled ? actionColumnWidth : 25} aria-label="Retirer" />
            </tr>
          </SimpleTable.Head>
          <tbody>
            {(input.value ?? []).map((specyOnboard, index) => {
              const isActive = isRowActive(index)
              const isHovered = hoveredIndex === index

              return (
                <SpeciesTableRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={`speciesOnboard-${specyOnboard.speciesCode}-${index}`}
                  activation={activation}
                  dataCy={`species-onboard-row-${index}`}
                  index={index}
                  isHovered={isHovered}
                >
                  <SpeciesSelectCell
                    customSearch={customSearch}
                    isActive={isActive}
                    isDisabled={isDisabled}
                    isHovered={isHovered}
                    isNotLanded={!!specyOnboard.isNotLanded}
                    name={`speciesOnboard[${index}].speciesCode`}
                    onChange={newSpecy => setSpecies(index, newSpecy)}
                    onPickerClose={() => handlePickerClose(index)}
                    onPickerOpen={() => handlePickerOpen(index)}
                    options={speciesAsOptions}
                    popupWidth={isEISREnabled ? 280 : undefined}
                    speciesCode={specyOnboard.speciesCode}
                    speciesLabel={`${specyOnboard.speciesCode} - ${getSpecyNameFromSpecyCode(specyOnboard.speciesCode)}`}
                  />

                  <WeightCell
                    isActive={isActive}
                    isDisabled={isDisabled}
                    isHovered={isHovered}
                    label="Qté déclarée"
                    name={`speciesOnboard[${index}].declaredWeight`}
                    value={specyOnboard.declaredWeight}
                  />

                  <WeightCell
                    isActive={isActive}
                    isDisabled={isDisabled}
                    isHovered={isHovered}
                    label={specyOnboard.isNotLanded ? 'Qté estimée' : controlledWeightLabel}
                    name={`speciesOnboard[${index}].controlledWeight`}
                    value={specyOnboard.controlledWeight}
                  />

                  {isEISREnabled ? (
                    <WeightCell
                      isActive={isActive}
                      isDisabled={isDisabled}
                      isHovered={isHovered}
                      label="Qté ss-taille"
                      name={`speciesOnboard[${index}].underSizedWeight`}
                      value={specyOnboard.underSizedWeight}
                    />
                  ) : (
                    <TdWithoutPaddingWhenActive $isActive={false}>
                      <FormikCheckbox disabled={isDisabled} label="" name={`speciesOnboard[${index}].underSized`} />
                    </TdWithoutPaddingWhenActive>
                  )}

                  {isEISREnabled && (
                    <StyledPickerTd $isActive={isActive}>
                      {isActive ? (
                        <StyledCellSelect
                          $isHovered={isHovered}
                          cleanable={false}
                          disabled={isDisabled}
                          isLabelHidden
                          isLight
                          label="Présentation"
                          name={`speciesOnboard[${index}].presentationCodes`}
                          onChange={code => setSpecyRowValue(index, { presentationCodes: code ? [code] : undefined })}
                          onClose={() => handlePickerClose(index)}
                          onOpen={() => handlePickerOpen(index)}
                          options={PRESENTATION_OPTIONS}
                          popupWidth={220}
                          searchable
                          value={specyOnboard.presentationCodes?.[0]}
                        />
                      ) : (
                        <Ellipsised>
                          {specyOnboard.presentationCodes?.length ? specyOnboard.presentationCodes.join(', ') : '-'}
                        </Ellipsised>
                      )}
                    </StyledPickerTd>
                  )}

                  {isEISREnabled && (
                    <FaoZonesCell
                      isActive={isActive}
                      isDisabled={isDisabled}
                      isHovered={isHovered}
                      name={`speciesOnboard[${index}].faoZones`}
                      onChange={zone => setSpecyRowValue(index, { faoZones: zone ? [zone] : undefined })}
                      onPickerClose={() => handlePickerClose(index)}
                      onPickerOpen={() => handlePickerOpen(index)}
                      options={faoAreasAsOptions}
                      value={specyOnboard.faoZones}
                    />
                  )}

                  <DeleteCell $isCenter>
                    {isLandControl && isEISREnabled && (
                      <IconButton
                        accent={Accent.TERTIARY}
                        color={specyOnboard.isNotLanded ? THEME.color.blueGray : THEME.color.lightGray}
                        Icon={Icon.CrossedFishery}
                        onClick={() => updateNotLandedSpecy(index)}
                        title={specyOnboard.isNotLanded ? 'Espèce non débarquée' : 'Espèce débarquée'}
                      />
                    )}
                    <IconButton
                      accent={Accent.TERTIARY}
                      disabled={isDisabled}
                      Icon={Icon.Minus}
                      onClick={() => setSpeciesToDeleteIndex(index)}
                      title="Retirer l'espèce"
                    />
                  </DeleteCell>
                </SpeciesTableRow>
              )
            })}
            <SimpleTable.BodyTr>
              <SimpleTable.Td colSpan={isEISREnabled ? 7 : 5}>
                <AddSpeciesButton disabled={isDisabled} onClick={addEmptySpecies} type="button">
                  <Icon.Plus size={18} />
                  Ajouter une espèce
                </AddSpeciesButton>
              </SimpleTable.Td>
            </SimpleTable.BodyTr>
          </tbody>
        </SimpleTable.Table>
      </SpeciesTableWrapper>
      {isLandControl && isEISREnabled && hasNotLandedSpecies && (
        <>
          <FieldsetGroupSeparator marginBottom={12} />
          <ControlCheckTable rows={getLandControlNotLandedCheckRows(speciesEISRApplicability)} />
        </>
      )}
      <FieldsetGroupSeparator marginBottom={12} />
      <FormikTextarea label="Observations (hors infraction) sur les espèces" name="speciesObservations" rows={2} />
      {speciesToDeleteIndex !== undefined && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <>
              <p>Êtes-vous sûr de vouloir</p>
              <Bold>supprimer l’espèce ?</Bold>
            </>
          }
          onCancel={() => setSpeciesToDeleteIndex(undefined)}
          onConfirm={() => {
            remove(speciesToDeleteIndex)
            setSpeciesToDeleteIndex(undefined)
          }}
          title="Suppression de l’espèce"
        />
      )}
    </FieldsetGroup>
  )
}
