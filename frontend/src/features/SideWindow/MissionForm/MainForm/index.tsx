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

import {
  FLIGHT_GOALS_AS_OPTIONS,
  MISSION_NATURES_AS_OPTIONS,
  MISSION_TYPES_AS_OPTIONS,
  TARGETTED_SEGMENTS_AS_OPTIONS
} from './constants'
import { FormikMultiControlUnitPicker } from './FormikMultiControlUnitPicker'
import { FormikMultiZonePicker } from './FormikMultiZonePicker'
import { getMissionFormInitialValues } from './utils'
import { MissionNature, MissionType } from '../../../../domain/types/mission'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { MissionFormValues } from './types'
import type { Promisable } from 'type-fest'

export type MainFormProps = {
  initialValues: MissionFormValues | undefined
  onChange: (nextPartialMission: MissionFormValues) => Promisable<void>
  onTypeChange: (nextType: MissionType) => Promisable<void>
}
export function MainForm({ initialValues, onChange, onTypeChange }: MainFormProps) {
  const currentValuesRef = useRef<MissionFormValues>(initialValues || getMissionFormInitialValues())

  const [hasMissionUnderJdpType, setHasMissionUnderJdpType] = useState(false)

  const { newWindowContainerRef } = useNewWindow()

  const updateCurrentValues = useCallback(
    (nextValues: MissionFormValues) => {
      const previousValues = { ...currentValuesRef.current }
      currentValuesRef.current = nextValues

      if (currentValuesRef.current.missionType !== previousValues.missionType) {
        if (currentValuesRef.current.missionType !== MissionType.AIR) {
          const nextValueWithoutExtraProps = pipe(dissoc('flightGoal'), dissoc('flightGoal'))(nextValues)

          currentValuesRef.current = nextValueWithoutExtraProps
        }

        onTypeChange(currentValuesRef.current.missionType)
      }

      if (
        !equals(nextValues.missionNature, previousValues.missionNature) ||
        nextValues.hasOrder !== previousValues.hasOrder
      ) {
        // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
        const _hasMissionUnderJdpType =
          (nextValues.missionNature !== undefined && nextValues.missionNature.includes(MissionNature.FISH)) ||
          Boolean(nextValues.hasOrder)

        if (!_hasMissionUnderJdpType) {
          const nextValueWithoutExtraProps = pipe(dissoc('isUnderJdp'))(nextValues)

          currentValuesRef.current = nextValueWithoutExtraProps
        }

        setHasMissionUnderJdpType(_hasMissionUnderJdpType)
      }

      onChange(currentValuesRef.current)
    },
    [onChange, onTypeChange]
  )

  return (
    <Formik initialValues={currentValuesRef.current} onSubmit={noop}>
      <Wrapper>
        <FormikEffect onChange={updateCurrentValues as any} />

        <FormHead>
          <h2>Informations générales</h2>
        </FormHead>

        <CustomFormBody>
          <FormikDateRangePicker
            baseContainer={newWindowContainerRef.current}
            isCompact
            isStringDate
            label="Début et fin de mission"
            // `inputStartDateTimeUtc` & `inputEndDateTimeUtc` in API
            name="inputDateTimeRangeUtc"
            withTime
          />
          <FormikMultiRadio isInline label="Type de mission" name="missionType" options={MISSION_TYPES_AS_OPTIONS} />
          <MissionNatureWrapper>
            <FormikMultiCheckbox
              isInline
              label="Intentions principales de mission"
              name="missionNature"
              options={MISSION_NATURES_AS_OPTIONS}
            />

            {/* TODO What to do with this prop? */}
            <FormikCheckbox disabled={!hasMissionUnderJdpType} label="Mission sous JDP" name="isUnderJdp" />
          </MissionNatureWrapper>

          <FormikMultiControlUnitPicker name="controlUnits" />

          <FormikMultiZonePicker name="geom" />

          {/* TODO What to do with this prop? */}
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

          {/* TODO What to do with this prop? */}
          {currentValuesRef.current.missionType === MissionType.AIR && (
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
            <FormikTextarea label="CACEM : orientations, observations" name="observationsCacem" />
            <FormikTextarea label="CNSP : orientations, observations" name="observationsCnsp" />
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

const MissionNatureWrapper = styled.div`
  align-items: flex-end;
  display: flex;

  > div {
    margin-left: 12px;
  }
`
