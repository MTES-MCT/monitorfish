import { SELECT_TRACK_DEPTH_OPTIONS } from '@features/VesselSidebar/actions/TrackRequest/constants'
import { Label, Select } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'

import type { Promisable } from 'type-fest'

type SelectableVesselTrackDepth = Exclude<VesselTrackDepth, VesselTrackDepth.CUSTOM>

type DateRangeRadioProps = {
  defaultValue?: VesselTrackDepth
  onChange: (nextTrackDepth: SelectableVesselTrackDepth | undefined) => Promisable<void>
}
export function DateRangeRadio({ defaultValue, onChange }: DateRangeRadioProps) {
  const normalizedDefaultValue = useMemo(
    () => (defaultValue !== VesselTrackDepth.CUSTOM ? defaultValue : undefined),
    [defaultValue]
  )

  return (
    <ColumnsBox>
      <ShowFromLabel>Afficher la piste VMS depuis</ShowFromLabel>
      <StyledSelect
        isCleanable={false}
        isErrorMessageHidden
        isLabelHidden
        label="Afficher la piste VMS depuis"
        name="vessel-track-depth"
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

const ShowFromLabel = styled(Label)`
  margin-right: 8px;
  line-height: 27px;
  margin-left: auto;
`

const StyledSelect = styled(Select)`
  margin-right: auto;
`
