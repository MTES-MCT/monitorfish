import { Ellipsised } from '@components/Ellipsised'
import { DISCARD_REASON_AS_OPTIONS } from '@features/Mission/components/MissionForm/ActionForm/shared/constants'
import { DISCARD_REASON_LABEL } from '@features/Mission/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { FrontendError } from '@libs/FrontendError'
import { Accent, FormikSelect, Icon, IconButton, SimpleTable } from '@mtes-mct/monitor-ui'
import { useField, useFormikContext } from 'formik'
import styled from 'styled-components'

import {
  AddSpeciesButton,
  DeleteCell,
  Kg,
  QuantityWrapper,
  SelectValue,
  selectFieldCss,
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
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'
import type { Specy } from 'domain/types/specy'

export function DiscardedSpeciesField() {
  const { values } = useFormikContext<MissionActionFormValues>()
  const [input, , helper] = useField<MissionActionFormValues['discardedSpecies']>('discardedSpecies')

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
          ? { ...discard, faoZones: discard.faoZones ?? values.faoAreas, speciesCode: newSpecy.code }
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

  if (!speciesAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend="Rejets" />
  }

  const isDisabled = values.isGangwayDeployed === false

  return (
    <FieldsetGroup isLight legend="Rejets">
      <SpeciesTableWrapper>
        <SimpleTable.Table>
          <SimpleTable.Head>
            <tr>
              <SimpleTable.Th $width={165}>Espèce(s) rejetées</SimpleTable.Th>
              <SimpleTable.Th $width={55}>Qté</SimpleTable.Th>
              <SimpleTable.Th $width={180}>Nature rejet</SimpleTable.Th>
              <SimpleTable.Th $width={80}>Zone</SimpleTable.Th>
              <SimpleTable.Th $width={21} aria-label="Retirer" />
            </tr>
          </SimpleTable.Head>
          <tbody>
            {(input.value ?? []).map((discard, index) => {
              const isActive = isRowActive(index)
              const faoZonesDisplay = discard.faoZones?.length ? discard.faoZones.join(', ') : '-'
              const discardReasonDisplay = discard.discardReason
                ? `${discard.discardReason} - ${DISCARD_REASON_LABEL[discard.discardReason]}`
                : '-'

              return (
                <SpeciesRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={`discardedSpecies-${discard.speciesCode}-${index}`}
                  $isHovered={hoveredIndex === index}
                  data-cy={`discarded-species-row-${index}`}
                  onBlurCapture={event => handleRowBlur(index, event)}
                  onFocusCapture={event => handleRowFocus(index, event)}
                  onMouseEnter={() => handleRowMouseEnter(index)}
                  onMouseLeave={() => handleRowMouseLeave(index)}
                >
                  <StyledPickerTd $isActive={isActive}>
                    {!isActive ? (
                      <SpeciesName>{`${discard.speciesCode} - ${getSpecyNameFromSpecyCode(
                        discard.speciesCode
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
                        name={`discardedSpecies[${index}].speciesCode`}
                        onChange={newSpecy => setSpecies(index, newSpecy)}
                        onClose={() => handlePickerClose(index)}
                        onOpen={() => handlePickerOpen(index)}
                        options={speciesAsOptions}
                        optionValueKey="code"
                        popupWidth={280}
                        searchable
                        value={speciesAsOptions.find(option => option.value.code === discard.speciesCode)?.value}
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
                          label="Qté rejetée"
                          name={`discardedSpecies[${index}].rejectedWeight`}
                        />
                        <Kg>kg</Kg>
                      </QuantityWrapper>
                    ) : (
                      <QuantityWrapper>
                        <Weight>{discard.rejectedWeight ?? '-'}</Weight>
                        <Kg>kg</Kg>
                      </QuantityWrapper>
                    )}
                  </TdWithoutPaddingWhenActive>

                  <StyledPickerTd $isActive={isActive}>
                    {isActive ? (
                      <StyledReasonSelect
                        $isHovered={hoveredIndex === index}
                        cleanable={false}
                        disabled={isDisabled}
                        isLabelHidden
                        isLight
                        label="Nature du rejet"
                        name={`discardedSpecies[${index}].discardReason`}
                        onClose={() => handlePickerClose(index)}
                        onOpen={() => handlePickerOpen(index)}
                        options={DISCARD_REASON_AS_OPTIONS}
                        popupWidth={220}
                      />
                    ) : (
                      <Ellipsised>{discardReasonDisplay}</Ellipsised>
                    )}
                  </StyledPickerTd>

                  <StyledPickerTd $isActive={isActive}>
                    {isActive ? (
                      <StyledCheckPicker
                        $isHovered={hoveredIndex === index}
                        cleanable={false}
                        disabled={isDisabled}
                        isLabelHidden
                        isRequired
                        label="Zone de pêche"
                        name={`discardedSpecies[${index}].faoZones`}
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

                  <DeleteCell $isCenter>
                    <IconButton
                      accent={Accent.TERTIARY}
                      disabled={isDisabled}
                      Icon={Icon.Minus}
                      onClick={() => removeDiscard(index)}
                      title="Retirer le rejet"
                    />
                  </DeleteCell>
                </SpeciesRow>
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
    </FieldsetGroup>
  )
}

const StyledReasonSelect = styled(FormikSelect)<{
  $isHovered: boolean
}>`
  ${selectFieldCss}
`
