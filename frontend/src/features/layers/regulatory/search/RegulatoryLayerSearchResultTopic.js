import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import Checkbox from 'rsuite/lib/Checkbox'
import CheckboxGroup from 'rsuite/lib/CheckboxGroup'
import RegulatoryLayerSearchResultZones from './RegulatoryLayerSearchResultZones'

const RegulatoryLayerSearchResultTopic = props => {
  const {
    regulatoryLayerTopic,
    regulatoryLayerZones
  } = props

  const [isSelected, setIsSelected] = useState([])
  const [zonesAreOpen, setZonesAreOpen] = useState(false)

  const displayNumberOfZones = () => {
    const zoneNumber = regulatoryLayerZones.length
    return (<ZonesNumber>
        {`${zoneNumber} zone${zoneNumber > 1 ? 's' : ''}`}
      </ZonesNumber>
    )
  }

  // const [globalIsSelected, setGlobalIsSelected] = useState(undefined)
  //
  // const select = subZone => {
  //   if (!subZone) {
  //     if (!globalIsSelected) {
  //       toggleSelectRegulatoryLayer(regulatoryLayerTopic, regulatoryLayerZones.filter(subZone => {
  //         return regulatoryLayersSelected[regulatoryLayerTopic]
  //           ? !regulatoryLayersSelected[regulatoryLayerTopic].some(selectedSubZone => selectedSubZone.zone === subZone.zone)
  //           : true
  //       }))
  //     } else {
  //       toggleSelectRegulatoryLayer(regulatoryLayerTopic, regulatoryLayerZones)
  //     }
  //     setGlobalIsSelected(!globalIsSelected)
  //   } else {
  //     toggleSelectRegulatoryLayer(regulatoryLayerTopic, [subZone])
  //   }
  // }
  //
  // useEffect(() => {
  //   setGlobalIsSelected(regulatoryLayersSelected[regulatoryLayerTopic]
  //     ? regulatoryLayersSelected[regulatoryLayerTopic].length === regulatoryLayerZones.length
  //     : false)
  // }, [regulatoryLayersSelected])

  return (
    <>
      <LayerTopic onClick={() => setZonesAreOpen(!zonesAreOpen)}>
        <TopicName title={regulatoryLayerTopic.replace(/[_]/g, ' ')}>
          {regulatoryLayerTopic.replace(/[_]/g, ' ')}
        </TopicName>
        {displayNumberOfZones()}
        <CheckboxGroup
          inline
          name="checkboxList"
          value={isSelected}
          onChange={setIsSelected}
          style={{ marginLeft: 0, height: 20 }}
        >
          <Checkbox value={regulatoryLayerTopic}/>
        </CheckboxGroup>
      </LayerTopic>
      <RegulatoryLayerSearchResultZones
        regulatoryLayerZones={regulatoryLayerZones}
        zonesAreOpen={zonesAreOpen}
      />
    </>
  )
}

const ZonesNumber = styled.span`
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-left: auto;
  line-height: 34px;
  font-weight: 400;
`

const TopicName = styled.span`
  user-select: none;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: ${COLORS.gunMetal};
  max-width: 300px;
  line-height: 33px;
`

const LayerTopic = styled.div`
  display: flex;
  user-select: none;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  padding-right: 0;
  height: 35px;
  font-size: 13px;
  padding-left: 18px;
  font-weight: 700;
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${COLORS.lightGray};
  
  .rs-checkbox-checker {
    padding-top: 24px;
  }
  
  .rs-checkbox {
    margin-left: 0;
  }
`

export default RegulatoryLayerSearchResultTopic
