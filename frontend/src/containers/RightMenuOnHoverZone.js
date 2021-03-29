import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { contractRightMenu } from '../domain/reducers/Global'

const RightMenuOnHoverZone = () => {
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const dispatch = useDispatch()

  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        dispatch(contractRightMenu())
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

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
