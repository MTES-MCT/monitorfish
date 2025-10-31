import { SELECT_TRACK_DEPTH_OPTIONS } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/constants'
import { Select } from '@mtes-mct/monitor-ui'
import { type MutableRefObject, useRef } from 'react'
import styled from 'styled-components'

import { VesselTrackDepth } from '../../../../types/vesselTrackDepth'

import type { Promisable } from 'type-fest'

type SelectableVesselTrackDepth = Exclude<VesselTrackDepth, VesselTrackDepth.CUSTOM>

type DateRangeRadioProps = {
  className?: string | undefined
  defaultValue?: VesselTrackDepth
  label: string
  name: string
  onChange: (nextTrackDepth: SelectableVesselTrackDepth | undefined) => Promisable<void>
}
export function TrackDepthSelection({ className, defaultValue, label, name, onChange }: DateRangeRadioProps) {
  const normalizedDefaultValue = defaultValue !== VesselTrackDepth.CUSTOM ? defaultValue : undefined
  const ref = useRef() as MutableRefObject<HTMLDivElement>

  return (
    <ColumnsBox ref={ref} className={className}>
      <StyledSelect
        isCleanable={false}
        isErrorMessageHidden
        label={label}
        name={name}
        onChange={nextValue => onChange(nextValue as SelectableVesselTrackDepth | undefined)}
        options={SELECT_TRACK_DEPTH_OPTIONS}
        value={normalizedDefaultValue}
      />
    </ColumnsBox>
  )
}

const ColumnsBox = styled.div`
  display: flex;
  flex-grow: 1;
`

const StyledSelect = styled(Select)`
  display: flex;
  flex-direction: row;

  .Element-Label {
    margin-right: 8px;
    line-height: 27px;
    flex-shrink: 0;
  }
`
