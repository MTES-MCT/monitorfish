import { Checkbox, FormikNumberInput, FormikTextarea, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { append, update } from 'ramda'
import { Fragment, useCallback } from 'react'
import styled from 'styled-components'

import { FrontendError } from '../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldGroup } from '../../FieldGroup'
import { FieldsetGroup } from '../../FieldsetGroup'

import type { MissionActionFormValues } from '../../types'

export function GearsField() {
  const [input, , helper] = useField<MissionActionFormValues['gearOnboard']>('gearOnboard')

  const { newWindowContainerRef } = useNewWindow()

  const addSpecyInfraction = useCallback(
    (nextValue: string | undefined) => {
      if (!nextValue) {
        return
      }

      const nextGearInfractions = nextValue
        ? append(
            {
              comments: undefined,
              controlledMesh: undefined,
              declaredMesh: undefined,
              gearCode: 'Code',
              gearName: 'Name',
              gearWasControlled: undefined
            },
            input.value || []
          )
        : undefined

      helper.setValue(nextGearInfractions)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const handleGearWasNotControlledChange = useCallback(
    (index: number, isChecked: boolean) => {
      if (!input.value) {
        throw new FrontendError(
          '`input.value` is undefined. This should never happen.',
          'features/SideWindow/MissionForm/ActionForm/SeaControlForm/GearsField.tsx > handleGearWasNotControlledChange()'
        )
      }

      const gearOnboard = input.value[index]
      if (!gearOnboard) {
        throw new FrontendError(
          '`gearOnboard` is undefined. This should never happen.',
          'features/SideWindow/MissionForm/ActionForm/SeaControlForm/GearsField.tsx > handleGearWasNotControlledChange()'
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

  // const removeDeviceInfraction = useCallback(
  //   (index: number) => {
  //     if (!input.value) {
  //       return
  //     }

  //     const nextGearInfractions = remove(index, 1, input.value)
  //     const normalizedNextGearInfractions = nextGearInfractions.length > 0 ? nextGearInfractions : undefined

  //     helper.setValue(normalizedNextGearInfractions)
  //   },

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [input.value]
  // )

  return (
    <FieldsetGroup isLight legend="Engins à bord">
      {input.value && input.value.length > 0 && (
        <>
          <DeviceInfractionWrapper>
            {input.value &&
              input.value.map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Fragment key={`deviceInfraction-${index}`}>
                  {index > 0 && <hr />}

                  <DeviceInfractionFormWrapper>
                    {/* <Select
                      baseContainer={newWindowContainerRef.current}
                      defaultValue={deviceInfraction.natinf}
                      label="Engin"
                      name={`editedDevice[${index}].deviceName`}
                      onChange={() => removeDeviceInfraction(index)}
                      options={[{ label: String(deviceInfraction.natinf), value: deviceInfraction.natinf }]}
                    /> */}

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
                  </DeviceInfractionFormWrapper>
                </Fragment>
              ))}
          </DeviceInfractionWrapper>

          <hr />
        </>
      )}

      <FieldGroup isInline>
        <Select
          key={`newDevice.deviceName-${input.value?.length}`}
          baseContainer={newWindowContainerRef.current}
          label="Ajouter un engin"
          name="newDevice.deviceName"
          onChange={addSpecyInfraction}
          options={[
            { label: 'Engin 1', value: 'Engin 1' },
            { label: 'Engin 2', value: 'Engin 2' },
            { label: 'Engin 3', value: 'Engin 3' }
          ]}
        />
        {/* <FormikCheckbox
          key={`newDevice.isOmegaGaugeMissing-${input.value?.length}`}
          label="Unité sans jauge oméga"
          name="unitWithoutOmegaGauge"
        /> */}
      </FieldGroup>
    </FieldsetGroup>
  )
}

const DeviceInfractionWrapper = styled.div`
  > legend {
    margin: 24px 0 8px;
  }

  > hr {
    margin-bottom: 16px;
  }
`

const DeviceInfractionFormWrapper = styled.div`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
  }
`
