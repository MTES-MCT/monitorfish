import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { contractRightMenu } from '../../domain/shared_slices/Global'
import { useClickOutsideComponent } from '../../hooks/useClickOutside'

const RightMenuOnHoverArea = () => {
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const dispatch = useDispatch()

  const wrapperRef = useRef(null)
  const timeOutRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(contractRightMenu())
    }
  }, [clickedOutsideComponent])

  return <>
    {
      selectedVessel
        ? <Area ref={wrapperRef} onMouseLeave={() => {
          clearTimeout(timeOutRef.current)
          timeOutRef.current = setTimeout(() => dispatch(contractRightMenu()), 3000)
        }
        }/>
        : null
    }
  </>
}

const Area = styled.div`
  height: 300px;
  right: 0;
  width: 550px;
  opacity: 0;
  position: absolute;
  top: 0;
`

export default RightMenuOnHoverArea
