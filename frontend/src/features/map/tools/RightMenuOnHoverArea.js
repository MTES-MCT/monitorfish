import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { contractRightMenu, expandRightMenu } from '../../../domain/shared_slices/Global'
import { useClickOutsideWhenOpened } from '../../../hooks/useClickOutsideWhenOpened'

const RightMenuOnHoverArea = () => {
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const mapToolOpened = useSelector(state => state.global.mapToolOpened)
  const dispatch = useDispatch()

  const areaRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(areaRef, selectedVessel)

  useEffect(() => {
    if (clickedOutsideComponent && mapToolOpened === undefined) {
      dispatch(contractRightMenu())
    } else {
      dispatch(expandRightMenu())
    }
  }, [clickedOutsideComponent, mapToolOpened])

  return <>
    {
      selectedVessel && <Area ref={areaRef}/>
    }
  </>
}

const Area = styled.div`
  height: 500px;
  right: 0;
  width: 60px;
  opacity: 0;
  position: absolute;
  top: 0;
`

export default RightMenuOnHoverArea
