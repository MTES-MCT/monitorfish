import { useMemo, useRef } from 'react'
import { SelectPicker } from 'rsuite'
import styled from 'styled-components'

import { endOfBeaconMalfunctionReasons, vesselStatuses } from '../../../domain/entities/beaconMalfunction'
import { VesselStatusSelectValue } from './VesselStatusSelectValue'

/**
 * @typedef {object} VesselStatusSelectOrEndOfMalfunctionProps
 * @property {BeaconMalfunction} beaconMalfunction
 * @property {unknown} domRef
 * @property {boolean=} isAbsolute
 * @property {boolean} isMalfunctioning
 * @property {unknown} showedInCard
 * @property {unknown} updateVesselStatus
 * @property {unknown} vesselStatus
 */

/**
 * @param {VesselStatusSelectOrEndOfMalfunctionProps} props
 */
export function VesselStatusSelectOrEndOfMalfunction({
  beaconMalfunction,
  domRef,
  isAbsolute = false,
  isMalfunctioning,
  showedInCard,
  updateVesselStatus,
  vesselStatus,
}) {
  const selectMenuRef = useRef()

  const endOfBeaconMalfunctionReason = useMemo(
    () => endOfBeaconMalfunctionReasons[beaconMalfunction?.endOfBeaconMalfunctionReason],
    [beaconMalfunction],
  )

  return vesselStatus && isMalfunctioning ? (
    <>
      <SelectPicker
        cleanable={false}
        container={() => domRef.current}
        data={vesselStatuses}
        menuStyle={
          isAbsolute
            ? { marginLeft: 40, marginTop: 160, position: 'absolute' }
            : { marginLeft: -10, marginTop: -48, position: 'relative' }
        }
        onChange={status => updateVesselStatus(beaconMalfunction, status)}
        renderValue={(_, item) => <VesselStatusSelectValue item={item} />}
        searchable={false}
        style={selectPickerStyle}
        value={vesselStatus.value}
      />
      <span ref={selectMenuRef} />
    </>
  ) : (
    <EndOfMalfunction
      data-cy="side-window-beacon-malfunctions-end-of-malfunction"
      style={endOfMalfunctionStyle(endOfBeaconMalfunctionReason, showedInCard)}
    >
      {endOfBeaconMalfunctionReason?.label || 'Sans raison'}
    </EndOfMalfunction>
  )
}

const selectPickerStyle = {
  margin: '2px 10px 10px 0',
  width: 90,
}

const EndOfMalfunction = styled.div``
const endOfMalfunctionStyle = (endOfBeaconMalfunctionReason, showedInCard) => ({
  background: endOfBeaconMalfunctionReason?.color || 'unset',
  color: endOfBeaconMalfunctionReason?.textColor || 'unset',
  fontWeight: 500,
  height: 20,
  margin: showedInCard ? '8px 10px 5px 10px' : '8px 10px 8px 0px',
  padding: '5px 10px',
  textAlign: 'left',
  width: 'fit-content',
})

export default VesselStatusSelectOrEndOfMalfunction
