import {
  FormikCheckbox,
  FormikDateRangePicker,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikMultiSelect,
  FormikSelect,
  FormikTextarea,
  FormikTextInput
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { dissoc, equals, pipe } from 'ramda'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import { MissionGoal, MissionType } from '../../../../domain/types/mission'
import { useNewWindow } from '../../../../ui/NewWindow'
import { getOptionsFromLabelledEnum } from '../../../../utils/getOptionsFromLabelledEnum'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'
import { MultiZonePicker } from '../MultiZonePicker'
import { FLIGHT_GOALS_AS_OPTIONS, INITIAL_VALUES, TARGETTED_SEGMENTS_AS_OPTIONS } from './constants'
import { MultiUnitPicker } from './MultiUnitPicker'

import type { FormValues } from './types'
import type { Promisable } from 'type-fest'

export type MainFormProps = {
  onTypeChange: (nextType: MissionType) => Promisable<void>
}
export function MainForm({ onTypeChange }: MainFormProps) {
  const currentValues = useRef<FormValues>(INITIAL_VALUES)
  const [hasMissionUnderJdpType, setHasMissionUnderJdpType] = useState(false)

  const { newWindowContainerRef } = useNewWindow()

  const updateCurrentValues = useCallback(
    (nextValues: FormValues) => {
      const previousValues = { ...currentValues.current }
      currentValues.current = nextValues

      if (currentValues.current.type !== previousValues.type) {
        if (currentValues.current.type !== MissionType.AIR) {
          const nextValueWithoutExtraProps = pipe(dissoc('flightGoal'), dissoc('flightGoal'))(nextValues)

          currentValues.current = nextValueWithoutExtraProps
        }

        onTypeChange(currentValues.current.type)
      }

      if (!equals(nextValues.goals, previousValues.goals) || nextValues.hasOrder !== previousValues.hasOrder) {
        // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
        const _hasMissionUnderJdpType =
          (nextValues.goals !== undefined && nextValues.goals.includes(MissionGoal.FISHING)) ||
          Boolean(nextValues.hasOrder)

        if (!_hasMissionUnderJdpType) {
          const nextValueWithoutExtraProps = pipe(dissoc('isUnderJdp'))(nextValues)

          currentValues.current = nextValueWithoutExtraProps
        }

        setHasMissionUnderJdpType(_hasMissionUnderJdpType)
      }
    },
    [onTypeChange]
  )

  return (
    <Formik initialValues={currentValues.current} onSubmit={noop}>
      <Wrapper>
        <FormikEffect onChange={updateCurrentValues as any} />

        <FormHead>
          <h2>Informations générales</h2>
        </FormHead>

        <CustomFormBody>
          <FormikDateRangePicker
            baseContainer={newWindowContainerRef.current}
            label="Début et fin de mission"
            name="dateRange"
          />
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
          <UnderJdpBox>
            <FormikCheckbox disabled={!hasMissionUnderJdpType} label="Mission sous JDP" name="isUnderJdp" />
          </UnderJdpBox>

          <MultiUnitPicker name="units" />

          <MultiZonePicker addButtonLabel="Ajouter une zone de mission" />

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

          {currentValues.current.type === MissionType.AIR && (
            <InlineFieldGroupWrapper>
              <FormikMultiSelect
                fixedWidth={218}
                label="Objectifs du vol"
                name="flightGoal"
                options={FLIGHT_GOALS_AS_OPTIONS}
              />
              <FormikSelect
                label="Segment ciblé (si pertinent)"
                name="targettedSegment"
                options={TARGETTED_SEGMENTS_AS_OPTIONS}
              />
            </InlineFieldGroupWrapper>
          )}

          <RelatedFieldGroupWrapper>
            <FormikTextarea label="CACEM : orientations, observations" name="cacemNote" />
            <FormikTextarea label="CNSP : orientations, observations" name="cnspNote" />
          </RelatedFieldGroupWrapper>

          <InlineFieldGroupWrapper>
            <FormikTextInput label="Ouvert par" name="openBy" />
            <FormikTextInput label="Clôturé par" name="closedBy" />
          </InlineFieldGroupWrapper>
        </CustomFormBody>
      </Wrapper>
    </Formik>
  )
}

// TODO Why is there a `font-weight: 700` for legends in mini.css?
const Wrapper = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 33.33%;

  /* TODO Handle that in @mtes-mct/monitor-ui. */
  legend {
    font-weight: 400;
  }
`

const CustomFormBody = styled(FormBody)`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 2rem;
  }

  > button {
    margin-top: 1rem;
  }
`

const RelatedFieldGroupWrapper = styled.div`
  > div:not(:first-child) {
    margin-top: 0.5rem;
  }
`

const InlineFieldGroupWrapper = styled.div`
  display: flex;

  > div:first-child {
    margin-right: 0.5rem;
    width: 50%;
  }

  > div:last-child {
    margin-left: 0.5rem;
    width: 50%;
  }
`

const UnderJdpBox = styled.div`
  position: relative;

  > div {
    left: 213px;
    position: absolute;
    top: -51px;
  }
`
