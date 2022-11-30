import {
  Field,
  FormikCheckbox,
  FormikDateRangePicker,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikSelect,
  FormikTextarea,
  FormikTextInput,
  Label
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { equals } from 'ramda'
import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { MissionGoal, MissionType } from '../../../../domain/types/mission'
import { useForceUpdate } from '../../../../hooks/useForceUpdate'
import { Button, ButtonAccent } from '../../../../ui/Button'
import { getOptionsFromLabelledEnum } from '../../../../utils/getOptionsFromLabelledEnum'
import { FormTitle } from '../FormTitle'
import { EMPTY_UNIT, INITIAL_VALUES } from './constant'

import type { Mission } from '../../../../domain/types/mission'
import type { FormValues } from '../types'

export type MainFormProps = {
  mission?: Mission
}
export function MainForm({ mission }: MainFormProps) {
  const currentValues = useRef<FormValues>(INITIAL_VALUES)
  const key = useRef<string | undefined>(undefined)
  const [hasMissionUnderJdpType, setHasMissionUnderJdpType] = useState(false)
  const { forceUpdate } = useForceUpdate()

  const isNew = useMemo(() => Boolean(mission), [mission])
  console.log(isNew)

  const addUnit = useCallback(() => {
    const nextCurrentValues = {
      ...currentValues.current,
      units: [...currentValues.current.units, EMPTY_UNIT]
    }

    currentValues.current = nextCurrentValues
    key.current = JSON.stringify(nextCurrentValues)

    forceUpdate()
  }, [forceUpdate])

  const updateCurrentValues = useCallback((nextValues: FormValues) => {
    const previousValues = { ...currentValues.current }
    currentValues.current = nextValues

    if (!equals(nextValues.goals, previousValues.goals) || nextValues.hasOrder !== previousValues.hasOrder) {
      setHasMissionUnderJdpType(
        (nextValues.goals !== undefined && nextValues.goals.includes(MissionGoal.FISHING)) ||
          Boolean(nextValues.hasOrder)
      )
    }
  }, [])

  return (
    <Formik initialValues={currentValues.current} onSubmit={noop}>
      <Wrapper>
        <FormikEffect onChange={updateCurrentValues as any} />

        <FormTitle>Informations générales</FormTitle>

        <FieldsWrapper>
          <FormikDateRangePicker label="Début et fin de mission" name="dateRange" />
          <FormikMultiRadio
            isInline
            label="Type de mission"
            name="type"
            options={getOptionsFromLabelledEnum(MissionType)}
          />
          <FormikMultiCheckbox
            isInline
            label="Intentions principales de mission"
            name="goals"
            options={getOptionsFromLabelledEnum(MissionGoal)}
          />
          {hasMissionUnderJdpType && <FormikCheckbox label="Mission sous JDP" name="isUnderJdp" />}

          <Fragment key={`units-${key.current}`}>
            {currentValues.current.units &&
              currentValues.current.units.map((unit, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <RelatedFieldsWrapper key={`unit-${key.current}-${index}`}>
                  <FormikSelect label={`Administration ${index + 1}`} name="administrationId" options={[]} />
                  <FormikSelect
                    disabled={!unit.unitId}
                    label={`Unité ${index + 1}`}
                    name="administrationId"
                    options={[]}
                  />
                  <FormikSelect
                    disabled={!unit.meanId}
                    label={`Moyen ${index + 1}`}
                    name="administrationId"
                    options={[]}
                  />
                  <FormikSelect
                    disabled={!unit.contactId}
                    label={`Contact de l’unité ${index + 1}`}
                    name="administrationId"
                    options={[]}
                  />
                </RelatedFieldsWrapper>
              ))}
          </Fragment>
          <Button accent={ButtonAccent.SECONDARY} onClick={addUnit}>
            Ajouter une autre unité
          </Button>

          <Field>
            <Label>Localisations</Label>
            <Button accent={ButtonAccent.SECONDARY} isFullWidth onClick={noop}>
              Ajouter une zone de mission
            </Button>
          </Field>

          <FormikMultiRadio
            isInline
            label="Ordre de mission"
            name="hasOrder"
            // TODO Allow more Monitor UI `Option` types.
            options={[
              { label: 'Oui', value: true as any },
              { label: 'Non', value: false as any }
            ]}
          />

          <RelatedFieldsWrapper>
            <FormikTextarea label="CACEM : orientations, observations" name="cacemNote" />
            <FormikTextarea label="CNSP : orientations, observations" name="cnspNote" />
          </RelatedFieldsWrapper>

          <InlineFieldsWrapper>
            <FormikTextInput label="Ouvert par" name="openBy" />
            <FormikTextInput label="Clôturé par" name="closedBy" />
          </InlineFieldsWrapper>
        </FieldsWrapper>
      </Wrapper>
    </Formik>
  )
}

// TODO Why is there a `font-weight: 700` for legends in mini.css?
const Wrapper = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  flex-grow: 0.33;
  padding: 2rem;
  overflow-y: auto;

  legend {
    font-weight: 400;
  }
`

const FieldsWrapper = styled.div`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 2rem;
  }

  > button {
    margin-top: 1rem;
  }
`

const RelatedFieldsWrapper = styled.div`
  > div:not(:first-child) {
    margin-top: 0.5rem;
  }
`

const InlineFieldsWrapper = styled.div`
  display: flex;

  > div:first-child {
    flex-grow: 0.5;
    margin-right: 0.5rem;
  }
  > div:last-child {
    flex-grow: 0.5;
    margin-left: 0.5rem;
  }
`
