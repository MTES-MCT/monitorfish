import { ConfirmationModal } from '@components/ConfirmationModal'
import { Ellipsised } from '@components/Ellipsised'
import { Bold } from '@components/style'
import { DISCARD_REASON_AS_OPTIONS } from '@features/Mission/components/MissionForm/ActionForm/shared/constants'
import { getDefaultFaoZones } from '@features/Mission/components/MissionForm/ActionForm/utils'
import { useIsEISREnabled } from '@features/Mission/components/MissionForm/hooks/useIsEISREnabled'
import { DISCARD_REASON_LABEL } from '@features/Mission/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useGetVesselQuery } from '@features/Vessel/vesselApi'
import { FrontendError } from '@libs/FrontendError'
import { Accent, FormikSelect, Icon, IconButton, SimpleTable } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useField, useFormikContext } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'

import {
  AddSpeciesButton,
  DeleteCell,
  RequiredAsterisk,
  selectFieldCss,
  SpeciesTableWrapper,
  StyledPickerTd
} from './Species/speciesTable.styles'
import { FaoZonesCell, SpeciesSelectCell, SpeciesTableRow, WeightCell } from './Species/SpeciesTableRow'
import { useRowActivation } from './Species/useRowActivation'
import { useSpeciesAndFaoOptions } from './Species/useSpeciesAndFaoOptions'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'
import type { Specy } from 'domain/types/specy'

export function DiscardedSpeciesField() {
  const { values } = useFormikContext<MissionActionFormValues>()
  const [input, , helper] = useField<MissionActionFormValues['discardedSpecies']>('discardedSpecies')
  const isEISREnabled = useIsEISREnabled(values.actionDatetimeUtc)
  const { data: vessel } = useGetVesselQuery(values.vesselId ?? skipToken)
  const [discardToDeleteIndex, setDiscardToDeleteIndex] = useState<number | undefined>(undefined)

  const { customSearch, faoAreasAsOptions, getSpecyNameFromSpecyCode, speciesAsOptions } = useSpeciesAndFaoOptions()

  const activation = useRowActivation()
  const { deactivate, handlePickerClose, handlePickerOpen, hoveredIndex, isRowActive } = activation

  const addEmptyDiscard = () => {
    const newDiscard: MissionAction.DiscardedSpeciesControl = {
      discardReason: undefined,
      faoZones: undefined,
      rejectedWeight: undefined,
      speciesCode: ''
    }

    helper.setValue([...(input.value ?? []), newDiscard])
  }

  const setSpecies = (index: number, newSpecy: Specy | undefined) => {
    if (!newSpecy || !input.value) {
      return
    }

    deactivate()

    helper.setValue(
      input.value.map((discard, currentIndex) =>
        currentIndex === index
          ? {
              ...discard,
              faoZones: discard.faoZones ?? getDefaultFaoZones(isEISREnabled, values.faoAreas, vessel?.vesselLength),
              speciesCode: newSpecy.code
            }
          : discard
      )
    )
  }

  const removeDiscard = (index: number) => {
    if (!input.value) {
      throw new FrontendError('`input.value` is undefined')
    }

    helper.setValue(input.value.filter((_, currentIndex) => currentIndex !== index))
  }

  const getDiscardReasonOptions = (index: number) => {
    const currentSpeciesCode = input.value?.[index]?.speciesCode
    const usedReasons = new Set<string>(
      (input.value ?? [])
        .filter(
          (discard, currentIndex) =>
            currentIndex !== index && discard.speciesCode === currentSpeciesCode && !!discard.discardReason
        )
        .map(discard => discard.discardReason as string)
    )

    return DISCARD_REASON_AS_OPTIONS.map(option => ({
      ...option,
      isDisabled: usedReasons.has(option.value)
    }))
  }

  if (!speciesAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend="Rejets" />
  }

  const isDisabled = values.isUnitBoarded === false

  return (
    <FieldsetGroup isLight legend="Rejets">
      <SpeciesTableWrapper>
        <SimpleTable.Table>
          <SimpleTable.Head>
            <tr>
              <SimpleTable.Th $width={165}>Espèce rejetée</SimpleTable.Th>
              <SimpleTable.Th $width={55}>Qté</SimpleTable.Th>
              <SimpleTable.Th $width={180}>Nature rejet</SimpleTable.Th>
              <SimpleTable.Th $width={80}>
                Zone <RequiredAsterisk>*</RequiredAsterisk>
              </SimpleTable.Th>
              <SimpleTable.Th $width={21} aria-label="Retirer" />
            </tr>
          </SimpleTable.Head>
          <tbody>
            {(input.value ?? []).map((discard, index) => {
              const isActive = isRowActive(index)
              const isHovered = hoveredIndex === index
              const discardReasonDisplay = discard.discardReason
                ? `${discard.discardReason} - ${DISCARD_REASON_LABEL[discard.discardReason]}`
                : '-'

              return (
                <SpeciesTableRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={`discardedSpecies-${discard.speciesCode}-${index}`}
                  activation={activation}
                  dataCy={`discarded-species-row-${index}`}
                  index={index}
                  isHovered={isHovered}
                >
                  <SpeciesSelectCell
                    customSearch={customSearch}
                    isActive={isActive}
                    isDisabled={isDisabled}
                    isHovered={isHovered}
                    name={`discardedSpecies[${index}].speciesCode`}
                    onChange={newSpecy => setSpecies(index, newSpecy)}
                    onPickerClose={() => handlePickerClose(index)}
                    onPickerOpen={() => handlePickerOpen(index)}
                    options={speciesAsOptions}
                    popupWidth={280}
                    speciesCode={discard.speciesCode}
                    speciesLabel={`${discard.speciesCode} - ${getSpecyNameFromSpecyCode(discard.speciesCode)}`}
                  />

                  <WeightCell
                    isActive={isActive}
                    isDisabled={isDisabled}
                    isHovered={isHovered}
                    label="Qté rejetée"
                    name={`discardedSpecies[${index}].rejectedWeight`}
                    value={discard.rejectedWeight}
                  />

                  <StyledPickerTd $isActive={isActive}>
                    {isActive ? (
                      <StyledReasonSelect
                        $isHovered={isHovered}
                        cleanable={false}
                        disabled={isDisabled}
                        isLabelHidden
                        isLight
                        label="Nature du rejet"
                        name={`discardedSpecies[${index}].discardReason`}
                        onClose={() => handlePickerClose(index)}
                        onOpen={() => handlePickerOpen(index)}
                        options={getDiscardReasonOptions(index)}
                        popupWidth={220}
                      />
                    ) : (
                      <Ellipsised>{discardReasonDisplay}</Ellipsised>
                    )}
                  </StyledPickerTd>

                  <FaoZonesCell
                    isActive={isActive}
                    isDisabled={isDisabled}
                    isHovered={isHovered}
                    name={`discardedSpecies[${index}].faoZones`}
                    onPickerClose={() => handlePickerClose(index)}
                    onPickerOpen={() => handlePickerOpen(index)}
                    options={faoAreasAsOptions}
                    value={discard.faoZones}
                  />

                  <DeleteCell $isCenter>
                    <IconButton
                      accent={Accent.TERTIARY}
                      disabled={isDisabled}
                      Icon={Icon.Minus}
                      onClick={() => setDiscardToDeleteIndex(index)}
                      title="Retirer le rejet"
                    />
                  </DeleteCell>
                </SpeciesTableRow>
              )
            })}
            <SimpleTable.BodyTr>
              <SimpleTable.Td colSpan={5}>
                <AddSpeciesButton disabled={isDisabled} onClick={addEmptyDiscard} type="button">
                  <Icon.Plus size={18} />
                  Ajouter une espèce rejetée
                </AddSpeciesButton>
              </SimpleTable.Td>
            </SimpleTable.BodyTr>
          </tbody>
        </SimpleTable.Table>
      </SpeciesTableWrapper>
      {discardToDeleteIndex !== undefined && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <>
              <p>Êtes-vous sûr de vouloir supprimer</p>
              <Bold>le rejet ?</Bold>
            </>
          }
          onCancel={() => setDiscardToDeleteIndex(undefined)}
          onConfirm={() => {
            removeDiscard(discardToDeleteIndex)
            setDiscardToDeleteIndex(undefined)
          }}
          title="Suppression du rejet"
        />
      )}
    </FieldsetGroup>
  )
}

const StyledReasonSelect = styled(FormikSelect)<{
  $isHovered: boolean
}>`
  ${selectFieldCss}
`
