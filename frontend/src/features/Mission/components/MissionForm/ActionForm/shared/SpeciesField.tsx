import { Ellipsised } from '@components/Ellipsised'
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
import { useEffect } from 'react'

import { getDefaultFaoZones, getDefaultPresentationCodes } from '../utils'
import { ControlCheckTable } from './ControlCheckTable'
import {
  AddSpeciesButton,
  DeleteCell,
  Kg,
  QuantityWrapper,
  SelectValue,
  SpeciesName,
  SpeciesRow,
  SpeciesTableWrapper,
  StyledCheckPicker,
  StyledFormikTextInput,
  StyledPickerTd,
  StyledSpeciesSelect,
  TdWithoutPaddingWhenActive,
  useRowActivation,
  useSpeciesAndFaoOptions,
  Weight
} from './speciesTable'
import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'
import { useIsEISREnabled } from '../../hooks/useIsEISREnabled'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

import type { ControlCheckRow } from './ControlCheckTable'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Specy } from 'domain/types/specy'

const PRESENTATION_OPTIONS: Array<Option<string>> = Object.entries(LogbookSpeciesPresentation).map(([code, label]) => ({
  label: `${code} - ${label}`,
  value: code
}))

type SpeciesFieldProps = Readonly<{
  controlledWeightLabel: string
}>
export function SpeciesField({ controlledWeightLabel }: SpeciesFieldProps) {
  const { values } = useFormikContext<MissionActionFormValues>()
  const [input, , helper] = useField<MissionActionFormValues['speciesOnboard']>('speciesOnboard')
  const previousValue = usePrevious(input.value)
  const { updateSegments } = useGetMissionActionFormikUsecases()
  const isEISREnabled = useIsEISREnabled(values.actionDatetimeUtc)
  const { data: vessel } = useGetVesselQuery(values.vesselId ?? skipToken)

  const isLandControl = values.actionType === MissionAction.MissionActionType.LAND_CONTROL
  const legend = isLandControl ? 'Inspection des captures' : 'Espèces à bord'

  const { customSearch, faoAreasAsOptions, getSpecyNameFromSpecyCode, speciesAsOptions } = useSpeciesAndFaoOptions()

  const {
    deactivate,
    handlePickerClose,
    handlePickerOpen,
    handleRowBlur,
    handleRowFocus,
    handleRowMouseEnter,
    handleRowMouseLeave,
    hoveredIndex,
    isRowActive
  } = useRowActivation()

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
      faoZones: undefined,
      nbFish: undefined,
      presentationCodes: undefined,
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
            faoZones: species.faoZones ?? getDefaultFaoZones(isEISREnabled, values.faoAreas, vessel?.length),
            presentationCodes: species.presentationCodes?.length
              ? species.presentationCodes
              : getDefaultPresentationCodes(isEISREnabled, vessel?.length),
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

  const baseSpeciesCheckRows: ControlCheckRow[] = [
    { isRequired: true, label: 'Poids des espèces vérifiés', name: 'speciesWeightControlled' },
    { isRequired: true, label: 'Taille des espèces vérifiées', name: 'speciesSizeControlled' },
    {
      isRequired: true,
      label: 'Arrimage séparé des espèces soumises à plan',
      name: 'separateStowageOfPreservedSpecies'
    }
  ]

  let controlCheckRows: ControlCheckRow[]
  if (isLandControl) {
    controlCheckRows = isEISREnabled
      ? [
          {
            isSectionHeader: true,
            label: (
              <>
                Pour les captures <u>débarquées</u>
              </>
            ),
            name: 'unloadedSection'
          },
          {
            isRequired: true,
            label: 'Taille minimale de référence de conservation contrôlée',
            name: 'minimumConservationReferenceSizeControlled'
          },
          {
            isRequired: true,
            label: 'Contrôle de pesée / décompte des caisses / échantillonnage',
            name: 'cratesWeighingSamplingControl'
          },
          {
            isRequired: true,
            label: "Informations sur l'opérateur de pesée agréé",
            name: 'approvedWeighingOperatorInformation'
          },
          { isRequired: true, label: 'Cale contrôlée après déchargement', name: 'holdControlledAfterUnloading' },
          { isRequired: true, label: 'Pesée des captures lors du débarquement', name: 'catchesWeighedAtLanding' },
          {
            isSectionHeader: true,
            label: (
              <>
                Pour les captures <u>non débarquées</u>
              </>
            ),
            name: 'heldOnboardSection'
          },
          {
            isRequired: true,
            label: "Enregistrement séparé des poissons n'ayant pas la taille requise",
            name: 'underSizedSeparateRecording'
          }
        ]
      : baseSpeciesCheckRows
  } else {
    controlCheckRows = [
      ...baseSpeciesCheckRows,
      ...(isEISREnabled
        ? [
            {
              isRequired: true,
              label: "Arrimage séparé des poissons n'ayant pas la taille requise",
              name: 'underSizedSeparateStowage'
            },
            {
              isRequired: true,
              label: "Enregistrement séparé des poissons n'ayant pas la taille requise",
              name: 'underSizedSeparateRecording'
            }
          ]
        : [])
    ]
  }
  const isDisabled = values.isGangwayDeployed === false
  const actionColumnWidthWithEISREnabled = isLandControl ? 52 : 21

  return (
    <FieldsetGroup isLight legend={legend}>
      <ControlCheckTable rows={controlCheckRows} />

      <FieldsetGroupSeparator marginBottom={12} />
      <SpeciesTableWrapper>
        <SimpleTable.Table>
          <SimpleTable.Head>
            <tr>
              <SimpleTable.Th $width={isEISREnabled ? 165 : 320}>Espèce(s)</SimpleTable.Th>
              <SimpleTable.Th $width={isEISREnabled ? 55 : 80}>
                {isEISREnabled ? 'Déclaré' : 'Qté déclarée'}
              </SimpleTable.Th>
              <SimpleTable.Th $width={isEISREnabled ? 55 : 80}>
                {isEISREnabled ? 'Estimé' : 'Qté estimée'}
              </SimpleTable.Th>
              <SimpleTable.Th $width={isEISREnabled ? 55 : 80}>
                {isEISREnabled ? 'Ss-taille' : 'Sous-taille'}
              </SimpleTable.Th>
              {isEISREnabled && <SimpleTable.Th $width={70}>Présentation</SimpleTable.Th>}
              {isEISREnabled && <SimpleTable.Th $width={70}>Zone</SimpleTable.Th>}
              <SimpleTable.Th $width={isEISREnabled ? actionColumnWidthWithEISREnabled : 25} aria-label="Retirer" />
            </tr>
          </SimpleTable.Head>
          <tbody>
            {(input.value ?? []).map((specyOnboard, index) => {
              const isActive = isRowActive(index)
              const presentationDisplay = specyOnboard.presentationCodes?.length
                ? specyOnboard.presentationCodes.join(', ')
                : '-'
              const faoZonesDisplay = specyOnboard.faoZones?.length ? specyOnboard.faoZones.join(', ') : '-'

              return (
                <SpeciesRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={`speciesOnboard-${specyOnboard.speciesCode}-${index}`}
                  $isHovered={hoveredIndex === index}
                  data-cy={`species-onboard-row-${index}`}
                  onBlurCapture={event => handleRowBlur(index, event)}
                  onFocusCapture={event => handleRowFocus(index, event)}
                  onMouseEnter={() => handleRowMouseEnter(index)}
                  onMouseLeave={() => handleRowMouseLeave(index)}
                >
                  <StyledPickerTd $isActive={isActive}>
                    {!isActive ? (
                      <SpeciesName>{`${specyOnboard.speciesCode} - ${getSpecyNameFromSpecyCode(
                        specyOnboard.speciesCode
                      )}`}</SpeciesName>
                    ) : (
                      <StyledSpeciesSelect
                        $isHovered={hoveredIndex === index}
                        className="Field-SpeciesSelect"
                        cleanable={false}
                        customSearch={customSearch}
                        disabled={isDisabled}
                        isLabelHidden
                        isLight
                        label="Espèce"
                        name={`speciesOnboard[${index}].speciesCode`}
                        onChange={newSpecy => setSpecies(index, newSpecy)}
                        onClose={() => handlePickerClose(index)}
                        onOpen={() => handlePickerOpen(index)}
                        options={speciesAsOptions}
                        optionValueKey="code"
                        popupWidth={isEISREnabled ? 280 : undefined}
                        searchable
                        value={speciesAsOptions.find(option => option.value.code === specyOnboard.speciesCode)?.value}
                        virtualized
                      />
                    )}
                  </StyledPickerTd>

                  <TdWithoutPaddingWhenActive $isActive={isActive}>
                    {isActive ? (
                      <QuantityWrapper>
                        <StyledFormikTextInput
                          $isHovered={hoveredIndex === index}
                          disabled={isDisabled}
                          isLabelHidden
                          isLight
                          label="Qté déclarée"
                          name={`speciesOnboard[${index}].declaredWeight`}
                        />
                        <Kg>kg</Kg>
                      </QuantityWrapper>
                    ) : (
                      <QuantityWrapper>
                        <Weight>{specyOnboard.declaredWeight ?? '-'}</Weight>
                        <Kg>kg</Kg>
                      </QuantityWrapper>
                    )}
                  </TdWithoutPaddingWhenActive>

                  <TdWithoutPaddingWhenActive $isActive={isActive}>
                    {isActive ? (
                      <QuantityWrapper>
                        <StyledFormikTextInput
                          $isHovered={hoveredIndex === index}
                          disabled={isDisabled}
                          isLabelHidden
                          isLight
                          label={specyOnboard.isNotLanded ? 'Qté estimée' : controlledWeightLabel}
                          name={`speciesOnboard[${index}].controlledWeight`}
                        />
                        <Kg>kg</Kg>
                      </QuantityWrapper>
                    ) : (
                      <QuantityWrapper>
                        <Weight>{specyOnboard.controlledWeight ?? '-'}</Weight>
                        <Kg>kg</Kg>
                      </QuantityWrapper>
                    )}
                  </TdWithoutPaddingWhenActive>

                  <TdWithoutPaddingWhenActive $isActive={isEISREnabled && isActive}>
                    {!isEISREnabled && (
                      <FormikCheckbox disabled={isDisabled} label="" name={`speciesOnboard[${index}].underSized`} />
                    )}
                    {isEISREnabled && isActive && (
                      <QuantityWrapper>
                        <StyledFormikTextInput
                          $isHovered={hoveredIndex === index}
                          disabled={isDisabled}
                          isLabelHidden
                          isLight
                          label="Qté ss-taille"
                          name={`speciesOnboard[${index}].underSizedWeight`}
                        />
                        <Kg>kg</Kg>
                      </QuantityWrapper>
                    )}
                    {isEISREnabled && !isActive && (
                      <QuantityWrapper>
                        <Weight>{specyOnboard.underSizedWeight ?? '-'}</Weight>
                        <Kg>kg</Kg>
                      </QuantityWrapper>
                    )}
                  </TdWithoutPaddingWhenActive>

                  {isEISREnabled && (
                    <StyledPickerTd $isActive={isActive}>
                      {isActive ? (
                        <StyledCheckPicker
                          $isHovered={hoveredIndex === index}
                          cleanable={false}
                          disabled={isDisabled}
                          isLabelHidden
                          label="Présentation"
                          name={`speciesOnboard[${index}].presentationCodes`}
                          onClose={() => handlePickerClose(index)}
                          onOpen={() => handlePickerOpen(index)}
                          options={PRESENTATION_OPTIONS}
                          popupWidth={220}
                          renderValue={(_, items) =>
                            items.length > 0 ? (
                              <SelectValue>{items.map(item => item.value).join(', ')}</SelectValue>
                            ) : (
                              <></>
                            )
                          }
                          searchable
                        />
                      ) : (
                        <Ellipsised>{presentationDisplay}</Ellipsised>
                      )}
                    </StyledPickerTd>
                  )}

                  {isEISREnabled && (
                    <StyledPickerTd $isActive={isActive}>
                      {isActive ? (
                        <StyledCheckPicker
                          $isHovered={hoveredIndex === index}
                          cleanable={false}
                          disabled={isDisabled}
                          isLabelHidden
                          isRequired
                          label="Zone de pêche"
                          name={`speciesOnboard[${index}].faoZones`}
                          onClose={() => handlePickerClose(index)}
                          onOpen={() => handlePickerOpen(index)}
                          options={faoAreasAsOptions}
                          popupWidth={150}
                          renderValue={(_, items) =>
                            items.length > 0 ? (
                              <SelectValue>{items.map(item => item.label).join(', ')}</SelectValue>
                            ) : (
                              <></>
                            )
                          }
                          searchable
                        />
                      ) : (
                        <Ellipsised>{faoZonesDisplay}</Ellipsised>
                      )}
                    </StyledPickerTd>
                  )}

                  <DeleteCell $isCenter>
                    {isLandControl &&
                      isEISREnabled &&
                      (specyOnboard.isNotLanded ? (
                        <IconButton
                          accent={Accent.TERTIARY}
                          color={THEME.color.blueGray}
                          Icon={Icon.CrossedFishery}
                          onClick={() => updateNotLandedSpecy(index)}
                          title="Espèce non débarquée"
                        />
                      ) : (
                        <IconButton
                          accent={Accent.TERTIARY}
                          color={THEME.color.lightGray}
                          Icon={Icon.CrossedFishery}
                          onClick={() => updateNotLandedSpecy(index)}
                          title="Espèce débarquée"
                        />
                      ))}
                    <IconButton
                      accent={Accent.TERTIARY}
                      disabled={isDisabled}
                      Icon={Icon.Minus}
                      onClick={() => remove(index)}
                      title="Retirer l'espèce"
                    />
                  </DeleteCell>
                </SpeciesRow>
              )
            })}
            <SimpleTable.BodyTr>
              <SimpleTable.Td colSpan={7}>
                <AddSpeciesButton disabled={isDisabled} onClick={addEmptySpecies} type="button">
                  <Icon.Plus size={18} />
                  Ajouter une espèce
                </AddSpeciesButton>
              </SimpleTable.Td>
            </SimpleTable.BodyTr>
          </tbody>
        </SimpleTable.Table>
      </SpeciesTableWrapper>
      <FieldsetGroupSeparator marginBottom={12} />
      <FormikTextarea label="Observations (hors infraction) sur les espèces" name="speciesObservations" rows={2} />
    </FieldsetGroup>
  )
}
