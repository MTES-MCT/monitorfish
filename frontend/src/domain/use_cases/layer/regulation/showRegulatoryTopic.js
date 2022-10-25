import { batch } from 'react-redux'
import showRegulatoryZone from './showRegulatoryZone'
import { Layers } from '../../../entities/layers/constants'

let currentNamespace = 'homepage'

/**
 * Show a Regulatory topic
 * @param topicToShow {{ namespace: string, regulatoryZones: RegulatoryZone[] }} - The zones to show
 */
const showRegulatoryTopic = topicToShow => dispatch => {
  currentNamespace = topicToShow.namespace

  batch(() => {
    topicToShow.regulatoryZones.forEach(regulatoryZone => {
      dispatch(showRegulatoryZone({
        type: Layers.REGULATORY.code,
        ...regulatoryZone,
        namespace: currentNamespace
      }))
    })
  })
}

export default showRegulatoryTopic
