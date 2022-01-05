import React, { useCallback, useEffect, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { setLawTypeOpened, setRegulatoryTopicsOpened } from '../../domain/shared_slices/Regulatory'
import updateLayerNameForAllLayerZones from '../../domain/use_cases/updateLayerNameForAllLayerZones'
import RegulatoryTopics from './RegulatoryTopics'

const LawType = props => {
  const dispatch = useDispatch()
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const lawTypeOpened = useSelector(state => state.regulatory.lawTypeOpened)
  const {
    lawType,
    regZoneByLawType,
    isEditable,
    territory
  } = props
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(lawTypeOpened === lawType)
  }, [lawType, lawTypeOpened, setIsOpen])

  const increaseNumberOfZonesOpened = useCallback((number) => {
    setNumberOfZonesOpened(numberOfZonesOpened + number)
  }, [numberOfZonesOpened])

  const decreaseNumberOfZonesOpened = useCallback((number) => {
    const value = numberOfZonesOpened - number
    if (value < 0) {
      setNumberOfZonesOpened(0)
    } else {
      setNumberOfZonesOpened(value)
    }
  }, [numberOfZonesOpened])

  const updateLayerName = useCallback((oldLayerName, newLayerName) => {
    dispatch(updateLayerNameForAllLayerZones(territory, lawType, oldLayerName, newLayerName))
  }, [territory, lawType])

  const displayRegulatoryTopics = useCallback((regulatoryTopics) => {
    return <RegulatoryTopics
      regulatoryTopics={regulatoryTopics}
      increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
      decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
      isEditable={isEditable}
      updateLayerName={updateLayerName}
    />
  }, [])

  const openLawTypeList = () => {
    if (isOpen) {
      batch(() => {
        dispatch(setLawTypeOpened(null))
        dispatch(setRegulatoryTopicsOpened([]))
      })
    } else {
      dispatch(setLawTypeOpened(lawType))
    }
    setIsOpen(!isOpen)
  }

  return (<LawTypeContainer data-cy='law-type'>
    <LawTypeName onClick={openLawTypeList} data-cy={lawType}>
      <LawTypeText>{lawType}</LawTypeText>
      <ChevronIcon $isOpen={isOpen}/>
    </LawTypeName>
    {isOpen && <RegulatoryZoneLayerList isOpen={isOpen}>
      {displayRegulatoryTopics(regZoneByLawType[lawType])}
    </RegulatoryZoneLayerList>}
  </LawTypeContainer>)
}

const LawTypeContainer = styled.div`
  margin-top: 10px;
  display: flex;
  min-height: 40px;
  flex-direction: column;
  overflow: hidden;
`

const LawTypeName = styled.div`
  display: flex;
  font-size: 16px;
  color: ${COLORS.gunMetal};
  border-bottom: 2px solid ${COLORS.squareBorder};
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  cursor: pointer;
  padding-bottom: 5px;
`

const LawTypeText = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RegulatoryZoneLayerList = styled.ul`
  margin: 0;
  overflow-y: auto;
  overflow-x: unset;
  flex: 1;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  color: ${COLORS.gunMetal};
  height: ${props => props.isOpen ? 'unset' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition:  all 0.5s;
  overflow-x: hidden;
  max-width: 100%;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: ${props => props.$isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  transition: all 0.5s;
`

export default React.memo(LawType)
