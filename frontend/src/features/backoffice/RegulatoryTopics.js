import React from 'react'
import { EmptyResult } from '../commonStyles/Text.style'
import RegulatoryLayerTopic from '../layers/regulatory/RegulatoryLayerTopic'

const RegulatoryTopics = ({ regulatoryTopics, increaseNumberOfZonesOpened, decreaseNumberOfZonesOpened, isEditable, updateLayerName }) => {
  console.log('youhou')
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

export default React.memo(RegulatoryTopics)
