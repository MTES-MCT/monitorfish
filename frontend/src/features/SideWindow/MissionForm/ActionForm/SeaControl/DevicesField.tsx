import { FormikCheckbox, FormikMultiRadio, FormikNumberInput, FormikTextarea, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { append, remove } from 'ramda'
import { Fragment, useCallback } from 'react'
import styled from 'styled-components'

import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldGroup } from '../../FieldGroup'
import { FieldsetGroup } from '../../FieldsetGroup'

import type { PartialSeaControl } from '../../types'

export function DevicesField() {
  const [input, , helper] = useField<PartialSeaControl['deviceInfractions']>('deviceInfractions')

  const { newWindowContainerRef } = useNewWindow()

  const addSpecyInfraction = useCallback(
    (_nextValue: string | undefined) => {
      if (!_nextValue) {
        return
      }

      const nextValue = append({
        deviceName: _nextValue
      } as any)(input.value)

      helper.setValue(nextValue)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const removeDeviceInfraction = useCallback(
    (index: number) => {
      const nextValue: any = remove(index, 1)(input.value)

      helper.setValue(nextValue)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  return (
    <FieldsetGroup isLight legend="Engins à bord">
      {input.value.length > 0 && (
        <DeviceInfractionWrapper>
          {input.value.map((deviceInfraction, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={`deviceInfraction-${index}`}>
              {index > 0 && <hr />}

              <DeviceInfractionFormWrapper>
                <Select
                  baseContainer={newWindowContainerRef.current}
                  defaultValue={deviceInfraction.deviceName}
                  label="Engin"
                  name={`editedDevice[${index}].deviceName`}
                  onChange={() => removeDeviceInfraction(index)}
                  options={[{ label: deviceInfraction.deviceName, value: deviceInfraction.deviceName }] as any}
                />

                <FieldGroup isInline>
                  <FormikNumberInput label="Maillage déclaré" name={`deviceInfractions[${index}].declaredNetting`} />
                  <FormikNumberInput label="Maillage mesuré" name={`deviceInfractions[${index}].measuredNetting`} />
                  <FormikCheckbox
                    label="Maillage non mesuré"
                    name={`deviceInfractions[${index}].isNettingUnmeasured`}
                  />
                </FieldGroup>

                <FormikMultiRadio
                  isInline
                  label="Pingers : dispositif conforme (présence, nombre, espacement…)"
                  name={`deviceInfractions[${index}].pingersState`}
                  options={[
                    { label: 'Oui', value: 'Oui' },
                    { label: 'Non', value: 'Non' },
                    { label: 'Non contrôlé', value: 'Non contrôlé' }
                  ]}
                />
                <FormikTextarea label="OTM : autres mesures et dispositifs" name={`deviceInfractions[${index}].note`} />
              </DeviceInfractionFormWrapper>
            </Fragment>
          ))}
        </DeviceInfractionWrapper>
      )}

      {input.value.length > 0 && <hr />}

      <FieldGroup isInline>
        <Select
          key={`newDevice.deviceName-${input.value.length}`}
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
        <FormikCheckbox
          key={`newDevice.isOmegaGaugeMissing-${input.value.length}`}
          label="Unité sans jauge oméga"
          name="isOmegaGaugeMissing"
        />
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
