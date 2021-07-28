import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import RegulatoryLayerSearchInput from './RegulatoryLayerSearchInput'
import { ReactComponent as SearchIconSVG } from '../../icons/Loupe.svg'
import RegulatoryLayerSearchList from './RegulatoryLayerSearchList'
import { COLORS } from '../../../constants/constants'
import { useDispatch, useSelector } from 'react-redux'
import closeRegulatoryZoneMetadata from '../../../domain/use_cases/closeRegulatoryZoneMetadata'
import addRegulatoryLayersToMySelection from '../../../domain/use_cases/addRegulatoryLayersToMySelection'
import { useClickOutsideComponent } from '../../../hooks/useClickOutside'

const RegulatoryLayerSearch = props => {
  const {
    setHideLayersListWhenSearching,
    regulatoryLayersAddedToMySelection,
    setRegulatoryLayersAddedToMySelection,
    regulatoryLayers,
    layersSidebarIsOpen
  } = props

  const dispatch = useDispatch()
  const { regulatoryZoneMetadataPanelIsOpen } = useSelector(state => state.regulatory)

  const [showRegulatorySection, setShowRegulatorySection] = useState(false)
  const [foundRegulatoryLayers, setFoundRegulatoryLayers] = useState({})
  const [regulatoryLayersSelected, setRegulatoryLayersSelected] = useState({})
  const [initSearchFields, setInitSearchFields] = useState(false)

  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent && showRegulatorySection) {
      setShowRegulatorySection(false)
    }
  }, [clickedOutsideComponent, showRegulatorySection])

  useEffect(() => {
    if (showRegulatorySection && regulatoryZoneMetadataPanelIsOpen) {
      setShowRegulatorySection(false)
    }
  }, [regulatoryZoneMetadataPanelIsOpen])

  useEffect(() => {
    if (showRegulatorySection && regulatoryZoneMetadataPanelIsOpen) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [showRegulatorySection])

  const resetSelectRegulatoryZone = () => {
    setRegulatoryLayersSelected({})
  }

  useEffect(() => {
    if (foundRegulatoryLayers && Object.keys(foundRegulatoryLayers).length > 0) {
      setHideLayersListWhenSearching({})
    }
  }, [foundRegulatoryLayers, showRegulatorySection])

  const toggleSelectRegulatoryLayer = (regulatoryLayerTopic, regulatoryLayerZone) => {
    const existingSelectedLayers = { ...regulatoryLayersSelected }

    if (!regulatoryLayersSelected[regulatoryLayerTopic] || !regulatoryLayersSelected[regulatoryLayerTopic].length) {
      existingSelectedLayers[regulatoryLayerTopic] = regulatoryLayerZone
      setRegulatoryLayersSelected(existingSelectedLayers)
    } else {
      regulatoryLayerZone.forEach(regulatorySubZone => {
        if (existingSelectedLayers[regulatoryLayerTopic].some(item =>
          item.layerName === regulatorySubZone.layerName &&
          item.zone === regulatorySubZone.zone)) {
          existingSelectedLayers[regulatoryLayerTopic] = existingSelectedLayers[regulatoryLayerTopic].filter(item =>
            !(item.layerName === regulatorySubZone.layerName &&
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
  }

  function callAddRegulatoryLayersToMySelection (regulatoryLayersSelected) {
    const numberOfLayersAdded = Object.keys(regulatoryLayersSelected)
      .map(regulatoryLayerKey => regulatoryLayersSelected[regulatoryLayerKey].length)
      .reduce((a, b) => a + b, 0)

    setRegulatoryLayersAddedToMySelection(numberOfLayersAdded)
    setTimeout(() => { setRegulatoryLayersAddedToMySelection(0) }, 2000)
    dispatch(addRegulatoryLayersToMySelection(regulatoryLayersSelected))
    setRegulatoryLayersSelected({})
  }

  return (<Search ref={wrapperRef}>
      {
        showRegulatorySection
          ? null
          : <RegulatoryLayerSearchTitle
            onClick={() => setShowRegulatorySection(!showRegulatorySection)}
            showRegulatorySection={showRegulatorySection}
          >
            <TitleText>
              Rechercher des zones réglementaires
            </TitleText>
            <SearchIcon/>
          </RegulatoryLayerSearchTitle>
      }
      <RegulatoryLayerSearchInput
        showRegulatorySearchInput={showRegulatorySection}
        setShowRegulatorySection={setShowRegulatorySection}
        regulatoryLayers={regulatoryLayers}
        setFoundRegulatoryLayers={setFoundRegulatoryLayers}
        foundRegulatoryLayers={foundRegulatoryLayers}
        initSearchFields={initSearchFields}
        setInitSearchFields={setInitSearchFields}
        layersSidebarIsOpen={layersSidebarIsOpen}
        resetSelectRegulatoryLayer={resetSelectRegulatoryZone}
      />
      <RegulatoryLayerSearchList
        showRegulatorySearchInput={showRegulatorySection}
        foundRegulatoryLayers={foundRegulatoryLayers}
        showRegulatorySection={showRegulatorySection}
        regulatoryLayersSelected={regulatoryLayersSelected}
        toggleSelectRegulatoryLayer={toggleSelectRegulatoryLayer}
      />
      <AddRegulatoryLayer
        onClick={() => callAddRegulatoryLayersToMySelection(regulatoryLayersSelected)}
        showRegulatorySearchInput={showRegulatorySection}
        foundRegulatoryZones={foundRegulatoryLayers}
      >
        {
          regulatoryLayersAddedToMySelection ? `${regulatoryLayersAddedToMySelection} zones ajoutées` : 'Ajouter à mes zones'
        }
      </AddRegulatoryLayer>
    </Search>
  )
}

const Search = styled.div`
  width: 355px;
`

const TitleText = styled.span`
  margin-top: 10px;
  font-size: 13px;
  display: inline-block;
  font-weight: 400;
`

const AddRegulatoryLayer = styled.div`
  cursor: pointer;
  border-radius: 0;
  font-size: 0.8em;
  background: ${COLORS.charcoal};
  color: ${COLORS.gray};
  padding: 0;
  line-height: 2.5em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  user-select: none;
  animation: ${props => props.showRegulatorySearchInput && props.foundRegulatoryZones ? Object.keys(props.foundRegulatoryZones).length > 0 ? 'regulatory-button-opening' : 'regulatory-button-closing' : 'regulatory-button-closing'} 0.5s ease forwards;

  @keyframes regulatory-button-opening {
    0%   { height: 0;   }
    100% { height: 36px; }
  }

  @keyframes regulatory-button-closing {
    0%   { height: 36px; }
    100% { height: 0;   }
  }
`

const RegulatoryLayerSearchTitle = styled.div`
  height: 40px;
  background: white;
  color: ${COLORS.grayDarkerTwo};
  font-size: 0.8em;
  cursor: pointer;
  font-weight: 300;
  text-align: left;
  padding-left: 10px;
  user-select: none;
  width: 345px;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
`

const SearchIcon = styled(SearchIconSVG)`
  width: 40px;
  height: 40px;
  float: right;
  background: ${COLORS.charcoal};  
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
`

export default RegulatoryLayerSearch
