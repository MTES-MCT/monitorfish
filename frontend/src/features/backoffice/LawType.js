import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch, batch } from 'react-redux'
import styled from 'styled-components'
import { EmptyResult } from '../commonStyles/Text.style'
import RegulatoryLayerTopic from '../layers/regulatory/RegulatoryLayerTopic'
import { COLORS } from '../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { setLawTypeOpened, setRegulatoryTopicsOpened } from '../../domain/shared_slices/Regulatory'
import updateLayerNameForAllLayerZones from '../../domain/use_cases/updateLayerNameForAllLayerZones'

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

  function increaseNumberOfZonesOpened (number) {
    setNumberOfZonesOpened(numberOfZonesOpened + number)
  }

  function decreaseNumberOfZonesOpened (number) {
    const value = numberOfZonesOpened - number
    if (value < 0) {
      setNumberOfZonesOpened(0)
    } else {
      setNumberOfZonesOpened(value)
    }
  }

  function updateLayerName (oldLayerName, newLayerName) {
    dispatch(updateLayerNameForAllLayerZones(territory, lawType, oldLayerName, newLayerName))
  }

  const displayRegulatoryTopics = (regulatoryTopics) => {
    return (
      regulatoryTopics && Object.keys(regulatoryTopics).length > 0
        ? Object.keys(regulatoryTopics)
          .sort()
          .map((regulatoryTopic, index) => {
            return <RegulatoryLayerTopic
              key={regulatoryTopic}
              increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
              decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
              regulatoryTopic={regulatoryTopic}
              regulatoryZones={regulatoryTopics[regulatoryTopic]}
              isLastItem={Object.keys(regulatoryTopics).length === index + 1}
              allowRemoveZone={false}
              isEditable={isEditable}
              updateLayerName={updateLayerName}
            />
          })
        : <EmptyResult>Aucun résultat</EmptyResult>
    )
  }

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

export default LawType
