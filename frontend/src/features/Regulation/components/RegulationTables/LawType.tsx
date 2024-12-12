import { COLORS } from '@constants/constants'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useState, useEffect } from 'react'
import styled from 'styled-components'

import { EmptyResult } from '../../../commonStyles/Text.style'
import ChevronIconSVG from '../../../icons/Chevron_simple_gris.svg?react'
import { regulationActions } from '../../slice'
import { updateTopicForAllZones } from '../../useCases/updateTopicForAllZones'
import { RegulatoryTopic } from '../RegulatoryZones/RegulatoryTopic'

type LawTypeProps = Readonly<{
  isEditable: boolean
  lawType: string
  regZoneByLawType: Record<string, Record<string, string[]>>
  territory: string
}>
export function LawType({ isEditable, lawType, regZoneByLawType, territory }: LawTypeProps) {
  const dispatch = useBackofficeAppDispatch()
  // const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const lawTypeOpened = useBackofficeAppSelector(state => state.regulation.lawTypeOpened)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(lawTypeOpened === lawType)
  }, [lawType, lawTypeOpened, setIsOpen])

  // const increaseNumberOfZonesOpened = number => {
  //   setNumberOfZonesOpened(numberOfZonesOpened + number)
  // }

  // const decreaseNumberOfZonesOpened = number => {
  //   const value = numberOfZonesOpened - number
  //   if (value < 0) {
  //     setNumberOfZonesOpened(0)
  //   } else {
  //     setNumberOfZonesOpened(value)
  //   }
  // }

  const updateLayerName = (previousTopic: string, nextTopic: string) => {
    dispatch(updateTopicForAllZones(territory, lawType, previousTopic, nextTopic))
  }

  const displayRegulatoryTopics = regulatoryTopics =>
    regulatoryTopics && Object.keys(regulatoryTopics).length > 0 ? (
      Object.keys(regulatoryTopics)
        .sort()
        .map((regulatoryTopic, index) => (
          <RegulatoryTopic
            key={regulatoryTopic}
            allowRemoveZone={false}
            // TODO These props don't exist, check if we can remove them or if they are missing (BUG).
            // decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
            // increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
            isEditable={isEditable}
            isLastItem={Object.keys(regulatoryTopics).length === index + 1}
            regulatoryTopic={regulatoryTopic}
            regulatoryZones={regulatoryTopics[regulatoryTopic]}
            updateLayerName={updateLayerName}
          />
        ))
    ) : (
      <EmptyResult>Aucun résultat</EmptyResult>
    )

  const openLawTypeList = () => {
    if (isOpen) {
      dispatch(regulationActions.setLawTypeOpened(null))
      dispatch(regulationActions.setRegulatoryTopicsOpened([]))
    } else {
      dispatch(regulationActions.setLawTypeOpened(lawType))
    }
    dispatch(regulationActions.closeRegulatoryZoneMetadataPanel())
    setIsOpen(!isOpen)
  }

  return (
    <LawTypeContainer data-cy="law-type">
      <LawTypeName data-cy={lawType} onClick={openLawTypeList}>
        <LawTypeText>{lawType}</LawTypeText>
        <ChevronIcon $isOpen={isOpen} />
      </LawTypeName>
      {isOpen && (
        <RegulatoryZoneLayerList $isOpen={isOpen}>
          {displayRegulatoryTopics(regZoneByLawType[lawType])}
        </RegulatoryZoneLayerList>
      )}
    </LawTypeContainer>
  )
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
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
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

const RegulatoryZoneLayerList = styled.ul<{
  $isOpen: boolean
}>`
  margin: 0;
  overflow-y: auto;
  overflow-x: unset;
  flex: 1;
  background-color: ${COLORS.white};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  color: ${COLORS.gunMetal};
  height: ${props => (props.$isOpen ? 'unset' : '0')};
  opacity: ${props => (props.$isOpen ? '1' : '0')};
  transition: all 0.5s;
  overflow-x: hidden;
  max-width: 100%;
`

const ChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
}>`
  transform: ${props => (props.$isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  transition: all 0.5s;
`
