import { Checkbox, FormikNumberInput, FormikTextarea, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove, update } from 'ramda'
import { Fragment, useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { useGetGearsQuery } from '../../../../../../api/gear'
import { FrontendError } from '../../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../../ui/NewWindow'
import { FieldGroup } from '../../../FieldGroup'
import { FieldsetGroupSeparator } from '../../../FieldsetGroupSeparator'

import type { Gear } from '../../../../../../domain/types/Gear'
import type { MissionAction } from '../../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../../types'
import type { Option } from '@mtes-mct/monitor-ui'

const ERROR_PATH = 'features/SideWindow/MissionForm/ActionForm/SeaControlForm/GearsField/GearOnboardPicker.tsx'

export function GearsPicker() {
  const [input, , helper] = useField<MissionActionFormValues['gearOnboard']>('gearOnboard')

  const { newWindowContainerRef } = useNewWindow()

  const getGearsApiQuery = useGetGearsQuery()

  const gearsAsOptions: Array<Option<Gear>> = useMemo(() => {
    if (!getGearsApiQuery.data) {
      return []
    }

    return getGearsApiQuery.data.map(gear => ({
      label: `${gear.code} - ${gear.name}`,
      value: gear
    }))
  }, [getGearsApiQuery.data])

  const add = useCallback(
    (newGear: Gear | undefined) => {
      if (!newGear) {
        return
      }

      const nextGears: MissionAction.GearControl[] = [
        ...(input.value || []),
        {
          comments: undefined,
          controlledMesh: undefined,
          declaredMesh: undefined,
          gearCode: newGear.code,
          gearName: newGear.name,
          gearWasControlled: undefined
        }
      ]

      helper.setValue(nextGears)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const handleGearWasNotControlledChange = useCallback(
    (index: number, isChecked: boolean) => {
      if (!input.value) {
        throw new FrontendError(
          '`input.value` is undefined. This should never happen.',
          `${ERROR_PATH} > handleGearWasNotControlledChange()`
        )
      }

      const gearOnboard = input.value[index]
      if (!gearOnboard) {
        throw new FrontendError(
          '`gearOnboard` is undefined. This should never happen.',
          `${ERROR_PATH} > handleGearWasNotControlledChange()`
        )
      }

      const updatedGearOnboard = {
        ...gearOnboard,
        gearWasControlled: !isChecked
      }

      const nextGearOnboard = update(index, updatedGearOnboard, input.value)

      helper.setValue(nextGearOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const removeDeviceInfraction = useCallback(
    (index: number) => {
      if (!input.value) {
        return
      }

      const nextGearInfractions = remove(index, 1, input.value)
      const normalizedNextGearInfractions = nextGearInfractions.length > 0 ? nextGearInfractions : undefined

      helper.setValue(normalizedNextGearInfractions)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  if (!gearsAsOptions.length) {
    return <>Loading...</>
  }

  return (
    <>
      {input.value && input.value.length > 0 && (
        <>
          <Row>
            {input.value &&
              input.value.map((onboardGear, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Fragment key={`deviceInfraction-${index}`}>
                  {index > 0 && <FieldsetGroupSeparator />}

                  <RowInnerWrapper>
                    <SingleTag
                      onDelete={() => removeDeviceInfraction(index)}
                    >{`${onboardGear.gearCode} - ${onboardGear.gearName}`}</SingleTag>

                    <FieldGroup isInline>
                      <FormikNumberInput label="Maillage déclaré" name={`gearOnboard[${index}].declaredMesh`} />
                      <FormikNumberInput label="Maillage mesuré" name={`gearOnboard[${index}].controlledMesh`} />
                      <Checkbox
                        label="Maillage non mesuré"
                        name="gearWasNotControlled"
                        onChange={isChecked => handleGearWasNotControlledChange(index, isChecked)}
                      />
                    </FieldGroup>

                    {/* TODO V2. */}
                    {/* <FormikMultiRadio
                      isInline
                      label="Pingers : dispositif conforme (présence, nombre, espacement…)"
                      name={`gearOnboard[${index}].pingersState`}
                      options={[
                        { label: 'Oui', value: 'Oui' },
                        { label: 'Non', value: 'Non' },
                        { label: 'Non contrôlé', value: 'Non contrôlé' }
                      ]}
                    /> */}
                    <FormikTextarea
                      label="OTM : autres mesures et dispositifs"
                      name={`gearOnboard[${index}].comments`}
                    />
                  </RowInnerWrapper>
                </Fragment>
              ))}

            <FieldsetGroupSeparator />
          </Row>
        </>
      )}

      <FieldGroup>
        <Select
          key={String(input.value?.length)}
          baseContainer={newWindowContainerRef.current}
          label="Ajouter un engin"
          name="newGear"
          onChange={add}
          options={gearsAsOptions}
          searchable
          virtualized
        />
      </FieldGroup>
    </>
  )
}

const Row = styled.div`
  > legend {
    margin: 24px 0 8px;
  }

  > hr {
    margin-bottom: 16px;
  }
`

const RowInnerWrapper = styled.div`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
  }
`
