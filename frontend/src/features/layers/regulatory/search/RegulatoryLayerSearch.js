import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import RegulatoryLayerSearchInput from './RegulatoryLayerSearchInput'
import RegulatoryLayerSearchResultList from './RegulatoryLayerSearchResultList'
import { COLORS } from '../../../../constants/constants'
import { useDispatch, useSelector } from 'react-redux'
import addRegulatoryLayersToMySelection from '../../../../domain/use_cases/addRegulatoryLayersToMySelection'
import { useClickOutsideComponent } from '../../../../hooks/useClickOutside'
import layer from '../../../../domain/reducers/Layer'

const RegulatoryLayerSearch = props => {
  const {
    namespace,
    numberOfRegulatoryLayersSaved,
    setNumberOfRegulatoryLayersSaved,
    regulatoryLayers,
    layersSidebarIsOpen
  } = props

  const dispatch = useDispatch()
  const { setLayersSideBarOpenedZone } = layer[namespace].actions
  const { regulatoryZoneMetadataPanelIsOpen } = useSelector(state => state.regulatory)
  const { layersSidebarOpenedLayer } = useSelector(state => state.layer)

  const [showRegulatorySearch, setShowRegulatorySearch] = useState(false)
  const [foundRegulatoryLayers, setFoundRegulatoryLayers] = useState({})
  const [regulatoryLayersSelected, setRegulatoryLayersSelected] = useState({})
  const [initSearchFields, setInitSearchFields] = useState(false)

  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (layersSidebarOpenedLayer !== '') {
      setFoundRegulatoryLayers(null)
      setRegulatoryLayersSelected({})
    }
  }, [layersSidebarOpenedLayer])

  useEffect(() => {
    if (clickedOutsideComponent && foundRegulatoryLayers) {
      setFoundRegulatoryLayers(null)
      setRegulatoryLayersSelected({})
    }
  }, [clickedOutsideComponent, foundRegulatoryLayers])

  useEffect(() => {
    if (regulatoryZoneMetadataPanelIsOpen) {
      setFoundRegulatoryLayers(null)
      setRegulatoryLayersSelected({})
    }
  }, [regulatoryZoneMetadataPanelIsOpen])

  const resetSelectedRegulatoryZones = () => {
    setRegulatoryLayersSelected({})
  }

  useEffect(() => {
    if (foundRegulatoryLayers && Object.keys(foundRegulatoryLayers).length > 0) {
      dispatch(setLayersSideBarOpenedZone(''))
    }
  }, [foundRegulatoryLayers])

  const toggleSelectRegulatoryLayer = useCallback((regulatoryLayerTopic, regulatoryLayerZone) => {
    const existingSelectedLayers = { ...regulatoryLayersSelected }

    if (!regulatoryLayersSelected[regulatoryLayerTopic] || !regulatoryLayersSelected[regulatoryLayerTopic].length) {
      existingSelectedLayers[regulatoryLayerTopic] = regulatoryLayerZone
      setRegulatoryLayersSelected(existingSelectedLayers)
    } else {
      regulatoryLayerZone.forEach(regulatorySubZone => {
        if (existingSelectedLayers[regulatoryLayerTopic].some(item =>
          item.topic === regulatorySubZone.topic &&
          item.zone === regulatorySubZone.zone)) {
          existingSelectedLayers[regulatoryLayerTopic] = existingSelectedLayers[regulatoryLayerTopic].filter(item =>
            !(item.topic === regulatorySubZone.topic &&
              item.zone === regulatorySubZone.zone))
          if (!existingSelectedLayers[regulatoryLayerTopic].length) {
            delete existingSelectedLayers[regulatoryLayerTopic]
          }
        } else {
          existingSelectedLayers[regulatoryLayerTopic] = existingSelectedLayers[regulatoryLayerTopic].concat(regulatorySubZone)
        }
        setRegulatoryLayersSelected(existingSelectedLayers)
      })
    }
  }, [regulatoryLayersSelected])

  function saveRegulatoryLayers (regulatoryLayersSelected) {
    const numberOfLayersAdded = Object.keys(regulatoryLayersSelected)
      .map(regulatoryLayerKey => regulatoryLayersSelected[regulatoryLayerKey].length)
      .reduce((a, b) => a + b, 0)

    setNumberOfRegulatoryLayersSaved(numberOfLayersAdded)
    setTimeout(() => { setNumberOfRegulatoryLayersSaved(0) }, 2000)
    dispatch(addRegulatoryLayersToMySelection(regulatoryLayersSelected))
    setRegulatoryLayersSelected({})
  }

  return (<Search ref={wrapperRef}>
      <RegulatoryLayerSearchInput
        setShowRegulatorySection={setShowRegulatorySearch}
        regulatoryLayers={regulatoryLayers}
        setFoundRegulatoryLayers={setFoundRegulatoryLayers}
        foundRegulatoryLayers={foundRegulatoryLayers}
        initSearchFields={initSearchFields}
        setInitSearchFields={setInitSearchFields}
        layersSidebarIsOpen={layersSidebarIsOpen}
        resetSelectedRegulatoryLayer={resetSelectedRegulatoryZones}
      />
      <RegulatoryLayerSearchResultList
        foundRegulatoryLayers={foundRegulatoryLayers}
        showRegulatorySection={showRegulatorySearch}
        regulatoryLayersSelected={regulatoryLayersSelected}
        toggleSelectRegulatoryLayer={toggleSelectRegulatoryLayer}
      />
      <AddRegulatoryLayer
        onClick={() => saveRegulatoryLayers(regulatoryLayersSelected)}
        foundRegulatoryZones={foundRegulatoryLayers}
      >
        {
          numberOfRegulatoryLayersSaved
            ? `${numberOfRegulatoryLayersSaved} zones ajoutées`
            : 'Ajouter à mes zones'
        }
      </AddRegulatoryLayer>
    </Search>
  )
}

const Search = styled.div`
  width: 350px;
`

const AddRegulatoryLayer = styled.div`
  cursor: pointer;
  border-radius: 0;
  font-size: 13px;
  background: ${COLORS.charcoal};
  color: ${COLORS.gray};
  padding: 0;
  line-height: 2.5em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  user-select: none;
  height: ${props => props.foundRegulatoryZones && Object.keys(props.foundRegulatoryZones).length > 0 ? '36' : '0'}px;
  max-height: 600px;
  transition: 0.5s all;
`

export default RegulatoryLayerSearch
