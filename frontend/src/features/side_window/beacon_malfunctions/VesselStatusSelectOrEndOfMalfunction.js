import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { endOfBeaconMalfunctionReasons, vesselStatuses } from '../../../domain/entities/beaconMalfunction'
import { SelectPicker } from 'rsuite'
import { VesselStatusSelectValue } from './VesselStatusSelectValue'
import { useClickOutsideWhenOpenedWithinRef } from '../../../hooks/useClickOutsideWhenOpenedWithinRef'

const VesselStatusSelectOrEndOfMalfunction = props => {
  const {
    domRef,
    vesselStatus,
    /** @type {BeaconMalfunction} */
    beaconMalfunction,
    updateVesselStatus,
    isMalfunctioning,
    showedInCard,
    isAbsolute,
    baseRef
  } = props
  const endOfBeaconMalfunctionReason = endOfBeaconMalfunctionReasons[beaconMalfunction?.endOfBeaconMalfunctionReason]
  const selectMenuRef = useRef()
  const [vesselStatusSelectIsOpened, setVesselStatusSelectIsOpened] = useState(false)
  const clickedOutsideVesselStatusMenu = useClickOutsideWhenOpenedWithinRef(selectMenuRef, vesselStatusSelectIsOpened, baseRef)

  useEffect(() => {
    if (clickedOutsideVesselStatusMenu) {
      setVesselStatusSelectIsOpened(false)
    }
  }, [clickedOutsideVesselStatusMenu])

  return vesselStatus && isMalfunctioning
    ? <>
      <SelectPicker
        container={() => domRef.current}
        menuStyle={isAbsolute
          ? { position: 'absolute', marginLeft: 40, marginTop: 160 }
          : { position: 'relative', marginLeft: -10, marginTop: -48 }}
        style={selectPickerStyle}
        searchable={false}
        open={vesselStatusSelectIsOpened}
        onClick={() => setVesselStatusSelectIsOpened(true)}
        value={vesselStatus.value}
        onChange={status => updateVesselStatus(beaconMalfunction, status)}
        data={vesselStatuses}
        renderValue={(_, item) => <VesselStatusSelectValue item={item}/>}
        cleanable={false}
      />
      <span ref={selectMenuRef}/>
      </>
    : <EndOfMalfunction
      data-cy={'side-window-beacon-malfunctions-end-of-malfunction'}
      style={endOfMalfunctionStyle(endOfBeaconMalfunctionReason, showedInCard)}
    >
      { endOfBeaconMalfunctionReason?.label || 'Sans raison' }
    </EndOfMalfunction>
}

const selectPickerStyle = {
  width: 90,
  margin: '2px 10px 10px 0'
}

const EndOfMalfunction = styled.div``
const endOfMalfunctionStyle = (endOfBeaconMalfunctionReason, showedInCard) => ({
  margin: showedInCard ? '8px 10px 5px 10px' : '8px 10px 8px 0px',
  padding: '5px 10px',
  textAlign: 'left',
  width: 'fit-content',
  height: 20,
  fontWeight: 500,
  color: endOfBeaconMalfunctionReason?.textColor || 'unset',
  background: endOfBeaconMalfunctionReason?.color || 'unset'
})

export default VesselStatusSelectOrEndOfMalfunction
