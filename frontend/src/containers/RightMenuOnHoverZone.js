import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { contractRightMenu } from '../domain/reducers/Global'
import { useClickOutsideComponent } from '../hooks/useClickOutside'

const RightMenuOnHoverZone = () => {
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const dispatch = useDispatch()

  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(contractRightMenu())
    }
  }, [clickedOutsideComponent])

  return <>
    {
      selectedVessel
        ? <Zone ref={wrapperRef} onMouseLeave={() => dispatch(contractRightMenu())}/>
        : null
    }
  </>
}

const Zone = styled.div`
  height: 300px;
  right: 0;
  width: 550px;
  opacity: 0;
  position: absolute;
  top: 0;
`

export default RightMenuOnHoverZone
