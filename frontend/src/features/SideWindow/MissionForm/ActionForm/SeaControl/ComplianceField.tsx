import {
  Accent,
  Button,
  FormikMultiRadio,
  FormikMultiSelect,
  FormikTextarea,
  Icon,
  IconButton,
  Legend,
  Tag,
  TagGroup,
  THEME
} from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { append, remove } from 'ramda'
import { Fragment, useCallback, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { FieldsetGroup } from '../../FieldsetGroup'

import type { PartialSeaControl } from '../../types'

export function ComplianceField() {
  const [isEditedIndexNew, setIsEditedIndexNew] = useState(false)
  const [editedIndex, setEditedIndex] = useState<number | undefined>(undefined)
  const [input, , helper] = useField<PartialSeaControl['compliance']>('compliance')

  const addCustomInfraction = useCallback(
    () => {
      const nextCustomInfractions: any[] = append({})(input.value.customInfractions)
      const nextValue = {
        ...input.value,
        customInfractions: nextCustomInfractions
      }

      helper.setValue(nextValue)

      setIsEditedIndexNew(true)
      setEditedIndex(nextCustomInfractions.length - 1)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const removeCustomInfraction = useCallback(
    (index: number) => {
      const nextCustomInfractions: any[] = remove(index, 1)(input.value.customInfractions)
      const nextValue = {
        ...input.value,
        customInfractions: nextCustomInfractions
      }

      helper.setValue(nextValue)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editedIndex, input.value]
  )

  const cancelCustomInfractionEdition = useCallback(() => {
    // If we clicked on cancellation button and the edition form was for a new item, we delete it
    if (isEditedIndexNew && editedIndex) {
      removeCustomInfraction(editedIndex)

      setIsEditedIndexNew(false)
    }

    setEditedIndex(undefined)
  }, [editedIndex, isEditedIndexNew, removeCustomInfraction])

  return (
    <FieldsetGroup isLight legend="Obligations déclaratives et autorisations de pêche">
      <FormikMultiRadio
        isInline
        label="Bonne émission VMS"
        name="compliance.vmsCompliance"
        options={[
          { label: 'Oui', value: 'Oui' },
          { label: 'Non', value: 'Non' },
          { label: 'Non concerné', value: 'Non concerné' }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Bonne émission AIS"
        name="compliance.ais"
        options={[
          { label: 'Oui', value: 'Oui' },
          { label: 'Non', value: 'Non' },
          { label: 'Non concerné', value: 'Non concerné' }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Déclarations journal de pêche conformes à l'activité du navire"
        name="compliance.jdp"
        options={[
          { label: 'Oui', value: 'Oui' },
          { label: 'Non', value: 'Non' },
          { label: 'Non concerné', value: 'Non concerné' }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Autorisations de pêche conformes à l'activité du navire (zone, engins, espèces)"
        name="compliance.permissions"
        options={[
          { label: 'Oui', value: 'Oui' },
          { label: 'Non', value: 'Non' },
          { label: 'Non concerné', value: 'Non concerné' }
        ]}
      />

      <Button accent={Accent.SECONDARY} Icon={Icon.Plus} isFullWidth onClick={addCustomInfraction}>
        Ajouter une infraction obligations déclaratives / autorisations
      </Button>

      {input.value.customInfractions.length > 0 && (
        <CustomInfractionWrapper>
          {input.value.customInfractions.map((customInfraction, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={`customInfraction-${index}`}>
              <hr />

              <Legend>Infraction obligations déclaratives et autorisations {index + 1}</Legend>

              {index !== editedIndex && (
                <CustomInfractionInnerWrapper>
                  <div>
                    <TagGroup>
                      <Tag accent={Accent.PRIMARY}>{customInfraction.type}</Tag>
                      {customInfraction.natinfs &&
                        customInfraction.natinfs.map(natinf => <Tag accent={Accent.PRIMARY}>{natinf}</Tag>)}
                    </TagGroup>

                    <div>
                      <IconButton
                        accent={Accent.SECONDARY}
                        Icon={Icon.Edit}
                        onClick={() => setEditedIndex(index)}
                        style={{ marginRight: '8px' }}
                      />
                      <IconButton
                        accent={Accent.SECONDARY}
                        color={THEME.color.chineseRed}
                        Icon={Icon.Delete}
                        onClick={() => removeCustomInfraction(index)}
                      />
                    </div>
                  </div>

                  <article>
                    <ReactMarkdown>{customInfraction.note}</ReactMarkdown>
                  </article>
                </CustomInfractionInnerWrapper>
              )}

              {index === editedIndex && (
                <CustomInfractionFormWrapper>
                  <FormikMultiRadio
                    isInline
                    label="Type d'infraction"
                    name={`compliance.customInfractions[${index}].type`}
                    options={[
                      { label: 'Avec PV', value: 'Avec PV' },
                      { label: 'Sans PV', value: 'Sans PV' },
                      { label: 'En attente', value: 'En attente' }
                    ]}
                  />
                  <FormikMultiSelect
                    fixedWidth={460}
                    label="NATINF"
                    name={`compliance.customInfractions[${index}].natinfs`}
                    options={[
                      { label: 'NATINF 1', value: 'NATINF 1' },
                      { label: 'NATINF 2', value: 'NATINF 2' },
                      { label: 'NATINF 3', value: 'NATINF 3' },
                      { label: 'NATINF 4', value: 'NATINF 4' },
                      { label: 'NATINF 5', value: 'NATINF 5' },
                      { label: 'NATINF 6', value: 'NATINF 6' },
                      { label: 'NATINF 7', value: 'NATINF 7' },
                      { label: 'NATINF 8', value: 'NATINF 8' },
                      { label: 'NATINF 9', value: 'NATINF 9' }
                    ]}
                  />
                  <FormikTextarea
                    label="Observations sur l'infraction"
                    name={`compliance.customInfractions[${index}].note`}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button accent={Accent.TERTIARY} onClick={cancelCustomInfractionEdition}>
                      Annuler
                    </Button>
                    <Button accent={Accent.PRIMARY} onClick={() => setEditedIndex(undefined)}>
                      {`${isEditedIndexNew ? 'Ajouter' : 'Modifier'} l’infraction`}
                    </Button>
                  </div>
                </CustomInfractionFormWrapper>
              )}
            </Fragment>
          ))}
        </CustomInfractionWrapper>
      )}

      <hr />

      <FormikTextarea
        label="Observations (hors infractions) sur les obligations déclaratives / autorisations"
        name="compliance.note"
      />
    </FieldsetGroup>
  )
}

const CustomInfractionWrapper = styled.div`
  > legend {
    margin: 24px 0 8px;
  }
`

const CustomInfractionInnerWrapper = styled.div`
  > div {
    display: flex;
    justify-content: space-between;

    > div:last-child {
      align-items: flex-start;
      display: flex;
    }
  }

  > article {
    margin-top: 11px;
  }
`

const CustomInfractionFormWrapper = styled.div`
  > div:first-child,
  > fieldset:first-child {
    margin-top: 16px;
  }

  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
  }
`
