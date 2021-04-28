import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as VesselListSVG } from '../components/icons/Icone_liste_navires.svg'
import { ReactComponent as BoxFilterSVG } from '../components/icons/Filtre_zone_rectangle.svg'
import { ReactComponent as PolygonFilterSVG } from '../components/icons/Filtre_zone_polygone.svg'
import { ReactComponent as CloseIconSVG } from '../components/icons/Croix_grise.svg'
import { COLORS } from '../constants/constants'
import LayersEnum, { layersType as LayersType, layersType } from '../domain/entities/layers'
import Modal from 'rsuite/lib/Modal'
import TagPicker from 'rsuite/lib/TagPicker'
import Tag from 'rsuite/lib/Tag'
import SelectPicker from 'rsuite/lib/SelectPicker'
import { removeZoneSelected, resetZonesSelected, setInteraction, setZonesSelected } from '../domain/reducers/Map'
import { Interactions, OPENLAYERS_PROJECTION } from '../domain/entities/map'
import {
  resetTemporaryVesselsToHighLightOnMap,
  setTemporaryVesselsToHighLightOnMap
} from '../domain/reducers/Vessel'
import VesselListTable from '../components/vessel_list/VesselListTable'
import DownloadVesselListModal from '../components/vessel_list/DownloadVesselListModal'
import countries from 'i18n-iso-countries'
import { getCoordinates } from '../utils'
import getAdministrativeZoneGeometry from '../domain/use_cases/getAdministrativeZoneGeometry'
import { getAdministrativeSubZonesFromAPI } from '../api/fetch'
import { VESSELS_UPDATE_EVENT } from '../layers/VesselsLayer'
import { expandRightMenu } from '../domain/reducers/Global'
import unselectVessel from '../domain/use_cases/unselectVessel'
import MultiCascader from 'rsuite/lib/MultiCascader'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

const VesselList = () => {
  const dispatch = useDispatch()
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const vesselsLayerSource = useSelector(state => state.vessel.vesselsLayerSource)
  const vesselsFromApi = useSelector(state => state.vessel.vessels)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const firstUpdate = useRef(true)
  const [vesselListModalIsOpen, setVesselListModalIsOpen] = useState(false)
  const [downloadVesselListModalIsOpen, setDownloadVesselListModalIsOpen] = useState(false)

  const [isShowed, setIsShowed] = useState(true)

  const [showBackToVesselListButton, setShowBackToVesselListButton] = useState(false)
  const [vessels, setVessels] = useState([])
  const [filteredVessels, setFilteredVessels] = useState([])
  const [vesselsCountTotal, setVesselsCountTotal] = useState(0)
  const [vesselsCountShowed, setVesselsCountShowed] = useState(0)
  const [allVesselsChecked, setAllVesselsChecked] = useState({ globalCheckbox: true })
  const [makeVesselListToNotUpdate, setMakeVesselListToNotUpdate] = useState(false)
  const [zonesFilter, setZonesFilter] = useState([])

  // Filters
  const [lastPositionTimeAgoFilter, setLastPositionTimeAgoFilter] = useState(2)
  const [countriesFiltered, setCountriesFiltered] = useState([])
  const [administrativeZonesFiltered, setAdministrativeZonesFiltered] = useState([])
  const [zoneGroups, setZoneGroups] = useState([])
  const zonesSelected = useSelector(state => state.map.zonesSelected)

  useEffect(() => {
    if (vesselListModalIsOpen === true) {
      dispatch(unselectVessel())
      firstUpdate.current = false
    }

    const nextZonesPromises = Object.keys(LayersEnum)
      .map(layerName => LayersEnum[layerName])
      .filter(layer => layer.type === layersType.ADMINISTRATIVE)
      .filter(layer => layer.isIntersectable)
      .map(zone => {
        if (zone.containsMultipleZones) {
          return getAdministrativeSubZonesFromAPI(zone.code).then(subZonesFeatures => {
            return subZonesFeatures.features.map(subZone => {
              return {
                group: zone.name,
                groupCode: zone.code,
                label: subZone.properties[zone.subZoneFieldKey] ? subZone.properties[zone.subZoneFieldKey].replace(/[_]/g, ' ') : 'Aucun nom',
                name: subZone.properties[zone.subZoneFieldKey] ? subZone.properties[zone.subZoneFieldKey].replace(/[_]/g, ' ') : 'Aucun nom',
                code: subZone.id,
                value: subZone.id,
                isSubZone: true
              }
            })
          }).catch(error => {
            console.error(error)
          })
        }

        const nextZone = { ...zone }

        nextZone.label = zone.name
        nextZone.value = zone.code
        nextZone.group = zone.group ? zone.group.name : 'Administratives'

        return nextZone
      })

    Promise.all(nextZonesPromises).then((nextZones) => {
      let nextZonesWithoutNulls = nextZones.flat().filter(zone => zone)

      const groups = [...new Set(nextZonesWithoutNulls.map(zone => zone.group))]
      setZoneGroups(groups)

      nextZonesWithoutNulls = groups.map(group => {
        return {
          value: group,
          label: group,
          children: nextZonesWithoutNulls.filter(zone => zone.group === group)
        }
      })

      setZonesFilter(nextZonesWithoutNulls)
    })
  }, [vesselListModalIsOpen])

  useEffect(() => {
    if (!makeVesselListToNotUpdate && vesselsLayerSource) {
      if (vesselsLayerSource) {
        vesselsLayerSource.once(VESSELS_UPDATE_EVENT, ({ features }) => {
          if (features && features.length) {
            const vessels = features.map(vessel => {
              const coordinates = [...vessel.getGeometry().getCoordinates()]

              return {
                targetNumber: '',
                id: vessel.id_,
                checked: true,
                vesselName: vessel.getProperties().vesselName,
                course: vessel.getProperties().course,
                speed: vessel.getProperties().speed,
                flagState: vessel.getProperties().flagState.toLowerCase(),
                mmsi: vessel.getProperties().mmsi,
                internalReferenceNumber: vessel.getProperties().internalReferenceNumber,
                externalReferenceNumber: vessel.getProperties().externalReferenceNumber,
                ircs: vessel.getProperties().ircs,
                dateTimeTimestamp: new Date(vessel.getProperties().dateTime).getTime(),
                dateTime: vessel.getProperties().dateTime,
                latitude: getCoordinates(coordinates, OPENLAYERS_PROJECTION)[0],
                longitude: getCoordinates(coordinates, OPENLAYERS_PROJECTION)[1],
                olCoordinates: coordinates,
                gears: vessel.getProperties().gears
              }
            })

            setVessels(vessels)
            setVesselsCountTotal(vessels.length)
            setMakeVesselListToNotUpdate(true)
          }
        })
      }
    }
  }, [vesselsLayerSource, vesselsFromApi])

  useEffect(() => {
    if (vessels && vessels.length) {
      let filteredVessels = vessels

      if (countriesFiltered && countriesFiltered.length) {
        filteredVessels = filteredVessels.filter(vessel => countriesFiltered.some(country => vessel.flagState === country))
      }

      if (lastPositionTimeAgoFilter) {
        filteredVessels = filteredVessels.filter(vessel => {
          const vesselDate = new Date(vessel.dateTimeTimestamp)
          const vesselIsHidden = new Date()
          vesselIsHidden.setHours(vesselIsHidden.getHours() - lastPositionTimeAgoFilter)

          return vesselDate > vesselIsHidden
        })
      }

      if (zonesSelected && zonesSelected.length) {
        filteredVessels = filteredVessels.filter(vessel => {
          return zonesSelected.some(zoneSelected => zoneSelected.feature.getGeometry()
            .intersectsCoordinate(vessel.olCoordinates))
        }).filter((zone, index, acc) => acc
          .findIndex(existingZone => (existingZone.id === zone.id)) === index)
      }

      setFilteredVessels(filteredVessels)
      setVesselsCountShowed(filteredVessels.length)
    }
  }, [countriesFiltered, lastPositionTimeAgoFilter, zonesSelected, vessels])

  useEffect(() => {
    const nextVessels = vessels.map(vessel => {
      vessel.checked = allVesselsChecked.globalCheckbox

      return vessel
    })

    setVessels(nextVessels)
  }, [allVesselsChecked])

  const handleChange = (id, key, value) => {
    const nextVessels = Object.assign([], vessels)

    nextVessels.find(item => item.id === id)[key] = value
    setVessels(nextVessels)
  }

  const closeAndResetVesselList = () => {
    setVesselListModalIsOpen(false)
    setMakeVesselListToNotUpdate(false)
    setCountriesFiltered([])
    setAdministrativeZonesFiltered([])
    setLastPositionTimeAgoFilter(2)
    dispatch(resetZonesSelected())
  }

  const getCountries = () => {
    return Object.keys(countries.getAlpha2Codes()).map(country => {
      return {
        value: country.toLowerCase(),
        label: countries.getName(country, 'fr')
      }
    })
  }

  const selectBox = () => {
    setVesselListModalIsOpen(false)
    dispatch(setInteraction(Interactions.SQUARE))
  }

  const selectPolygon = () => {
    setVesselListModalIsOpen(false)
    dispatch(setInteraction(Interactions.POLYGON))
  }

  const highLightOnMap = () => {
    dispatch(setTemporaryVesselsToHighLightOnMap(filteredVessels.filter(vessel => vessel.checked)))
    setVesselListModalIsOpen(false)
  }

  const goBackToVesselList = () => {
    dispatch(resetTemporaryVesselsToHighLightOnMap())
    setVesselListModalIsOpen(true)
  }

  const callRemoveZoneSelected = zoneSelectedToRemove => {
    dispatch(removeZoneSelected(zoneSelectedToRemove.name))
  }

  const download = () => {
    setDownloadVesselListModalIsOpen(true)
  }

  useEffect(() => {
    if (zonesSelected && zonesSelected.length) {
      setVesselListModalIsOpen(true)
    }
  }, [zonesSelected])

  useEffect(() => {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length) {
      setShowBackToVesselListButton(true)
      setIsShowed(false)
    } else {
      setShowBackToVesselListButton(false)
      setIsShowed(true)
    }
  }, [temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    if (administrativeZonesFiltered && zonesSelected &&
          administrativeZonesFiltered.length > zonesSelected.length) {
      const zonesGeometryToFetch = administrativeZonesFiltered
        .filter(zonesFiltered => !zonesSelected.some(alreadyFetchedZone => alreadyFetchedZone.code === zonesFiltered))
        .map(zoneName =>
          zonesFilter
            .map(group => group.children)
            .flat()
            .filter(zone => zone)
            .find(zone => zone.code === zoneName))

      zonesGeometryToFetch
        .forEach(zoneToFetch => {
          if (zoneToFetch.isSubZone) {
            dispatch(getAdministrativeZoneGeometry(zoneToFetch.groupCode, zoneToFetch.code, zoneToFetch.name))
          } else {
            dispatch(getAdministrativeZoneGeometry(zoneToFetch.code, null, zoneToFetch.name))
          }
        })
    }
  }, [administrativeZonesFiltered])

  useEffect(() => {
    if (zonesSelected && zonesSelected.length &&
            administrativeZonesFiltered &&
            zonesSelected.length > administrativeZonesFiltered.length) {
      const nextZonesSelected = zonesSelected.filter(zoneSelected => {
        if (zoneSelected.code === 'FREE_DRAW') {
          return true
        }

        return administrativeZonesFiltered
          .find(zoneFiltered => zoneFiltered === zoneSelected.code)
      })

      dispatch(setZonesSelected(nextZonesSelected))
    }
  }, [administrativeZonesFiltered])

  const getLastPositionTimeAgo = () => {
    return [
      {
        label: '1 heure',
        value: 1
      },
      {
        label: '2 heures',
        value: 2
      },
      {
        label: '3 heures',
        value: 3
      },
      {
        label: '4 heures',
        value: 4
      },
      {
        label: '5 heures',
        value: 5
      },
      {
        label: '6 heures',
        value: 6
      },
      {
        label: '12 heures',
        value: 12
      },
      {
        label: '24 heures',
        value: 24
      }
    ]
  }

  return (
        <>
            <Wrapper isShowed={isShowed}>
                <VesselListIcon
                    selectedVessel={selectedVessel}
                    onMouseEnter={() => dispatch(expandRightMenu())}
                    rightMenuIsOpen={rightMenuIsOpen}
                    title={'Liste des navires avec VMS'}
                    onClick={() => setVesselListModalIsOpen(true)}>
                    <Vessel
                      selectedVessel={selectedVessel}
                      rightMenuIsOpen={rightMenuIsOpen}
                    />
                </VesselListIcon>
                <Modal
                    full
                    backdrop={'static'}
                    show={vesselListModalIsOpen}
                    onHide={() => closeAndResetVesselList()}
                >
                    <Modal.Header>
                        <Modal.Title>
                            <Vessel isTitle={true}/> Liste des navires avec VMS
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Title>FILTRER LA LISTE</Title>
                        <Filters>
                            <FilterDesc>
                                Dernières positions depuis {' '}
                            </FilterDesc>
                            <TimeAgoSelect>
                                <SelectPicker
                                    style={{ width: 70 }}
                                    searchable={false}
                                    placeholder="x heures..."
                                    value={lastPositionTimeAgoFilter}
                                    onChange={setLastPositionTimeAgoFilter}
                                    data={getLastPositionTimeAgo()}
                                />
                            </TimeAgoSelect>
                            <TagPicker
                                value={countriesFiltered}
                                style={{ width: 180, margin: '2px 10px 0 20px', verticalAlign: 'top' }}
                                data={getCountries()}
                                placeholder="Nationalité"
                                renderMenuItem={(name, item) => {
                                  return (
                                        <Label>
                                            {item.label}
                                        </Label>
                                  )
                                }}
                                onChange={change => setCountriesFiltered(change)}
                                renderValue={(values, items, tags) => {
                                  return items.map((tag, index) => (
                                        <Tag key={index}>
                                            {tag.label}
                                        </Tag>
                                  ))
                                }}
                            />
                            <ZoneFilter>
                                <MultiCascader
                                  data={zonesFilter}
                                  style={{ width: 230, verticalAlign: 'top', margin: '2px 10px 0 10px' }}
                                  placeholder="Filtrer avec une zone existante"
                                  menuWidth={250}
                                  uncheckableItemValues={zoneGroups}
                                  value={administrativeZonesFiltered}
                                  onClean={() => setAdministrativeZonesFiltered([])}
                                  onChange={change => setAdministrativeZonesFiltered(change)}
                                />
                                <CustomZone>
                                ou définir une zone
                                </CustomZone>
                                <BoxFilter onClick={() => selectBox()}/>
                                <PolygonFilter onClick={() => selectPolygon()}/>
                                {
                                    zonesSelected && zonesSelected.length && zonesSelected.find(zone => zone.code === LayersType.FREE_DRAW)
                                      ? zonesSelected.filter(zone => zone.code === LayersType.FREE_DRAW).map((zoneSelected, index) => {
                                        return <ZoneSelected key={zoneSelected.code + index}>
                                                <DeleteZoneText>Effacer la zone définie</DeleteZoneText>
                                                <CloseIcon onClick={() => callRemoveZoneSelected(zoneSelected)}/>
                                            </ZoneSelected>
                                      })
                                      : null
                                }
                            </ZoneFilter>
                        </Filters>
                        <VesselListTable
                            vessels={vessels}
                            filteredVessels={filteredVessels}
                            vesselsCountTotal={vesselsCountTotal}
                            vesselsCountShowed={vesselsCountShowed}
                            allVesselsChecked={allVesselsChecked}
                            setAllVesselsChecked={setAllVesselsChecked}
                            handleChange={handleChange}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <ShowOnMapButton
                            disabled={!(filteredVessels && filteredVessels.length)}
                            onClick={() => highLightOnMap()}>
                            Voir sur la carte
                        </ShowOnMapButton>
                        <DownloadButton
                            disabled={!(filteredVessels && filteredVessels.length)}
                            onClick={() => download()}>
                            Télécharger le tableau
                        </DownloadButton>
                    </Modal.Footer>
                </Modal>
            </Wrapper>
            <BackToVesselListButton
                showBackToVesselListButton={showBackToVesselListButton}
                onClick={() => goBackToVesselList()}
            >
                Revenir à la liste des navires
            </BackToVesselListButton>
            <DownloadVesselListModal
                isOpen={downloadVesselListModalIsOpen}
                setIsOpen={setDownloadVesselListModalIsOpen}
                filteredVessels={filteredVessels}
            />
        </>
  )
}

const DeleteZoneText = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
`
const CustomZone = styled.span`
  margin-left: 50px;
`

const ZoneSelected = styled.span`
  background: ${COLORS.grayBackground};
  border-radius: 2px;
  color: ${COLORS.textGray};
  margin-left: 0;
  font-size: 13px;
  padding: 0px 3px 0px 7px;
  vertical-align: top;
  height: 30px;
  display: inline-block;
`

const Wrapper = styled.div`
  animation: ${props => props.isShowed ? 'vessel-search-box-opening' : 'vessel-search-box-closing'} 0.2s ease forwards;

  @keyframes vessel-search-box-opening {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes vessel-search-box-closing {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
`

const BackToVesselListButton = styled.button`
  position: absolute;
  opacity: 0;
  top: 20px;
  left: auto;
  background: ${COLORS.grayDarkerThree};
  padding: 5px 12px 5px 12px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  border-radius: 2px;
  margin-left: -90px;
  animation: ${props => props.showBackToVesselListButton ? 'vessel-back-to-filter-button-opening' : 'vessel-back-to-filter-button-closing'} 0.2s ease forwards;

  @keyframes vessel-back-to-filter-button-opening {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes vessel-back-to-filter-button-closing {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  
  :hover, :focus {
    background: ${COLORS.grayDarkerThree};
  }
`

const ShowOnMapButton = styled.button`
  border: 1px solid ${COLORS.grayDarkerThree};
  padding: 5px 12px 5px 12px;
  margin: 20px 0 20px 0;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.grayDarker};
  }
`

const DownloadButton = styled.button`
  background: ${COLORS.grayDarkerThree};
  padding: 5px 12px 5px 12px;
  margin: 20px 20px 20px 10px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  
  :hover, :focus {
    background: ${COLORS.grayDarkerThree};
  }
`

const ZoneFilter = styled.div`
  display: inline-block;
  margin-right: 20px;
  margin-left: 10px;
  font-size: 13px;
  vertical-align: sub;
`

const TimeAgoSelect = styled.div`
  width: 120px;
  display: inline-block;
  margin-right: 20px;
  margin-left: 10px;
`

const Label = styled.span`
  font-size: 13px;
`

const FilterDesc = styled.span`
  font-size: 13px;
  margin-top: 7px;
  display: inline-block;
  vertical-align: sub;
`

const Filters = styled.div`
  color: #969696;
  font-size: 13px;
  margin-top: 15px;
  margin-bottom: 15px;
`

const Title = styled.div`
  font-size: 16px;
  color: #969696;
  font-weight: 500;
`

const VesselListIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${COLORS.grayDarkerThree};
  padding: 8px 0px 0 1px;
  top: 60px;
  z-index: 99;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  right: 10px;
  margin-top: 8px;
  
  animation: ${props => props.selectedVessel && !props.rightMenuIsOpen ? 'vessel-list-icon-closing' : 'vessel-list-icon-opening'} 0.3s ease forwards;
  
  @keyframes vessel-list-icon-opening {
    0%   {
      width: 5px;
      border-radius: 1px;
      right: 0;
     }
    100% {
      width: 40px;
      border-radius: 2px;
      right: 10px;
    }
  }

  @keyframes vessel-list-icon-closing {
    0% {
      width: 40px;
      border-radius: 2px;
      right: 10px;
    }
    100%   {
      width: 5px;
      border-radius: 1px;
      right: 0;
    }
  }

  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
  }
`

const Vessel = styled(VesselListSVG)`
  width: 25px;
  height: 25px;
  animation: ${props => !props.isTitle ? props.selectedVessel && !props.rightMenuIsOpen ? 'vessel-icon-hidden' : 'vessel-icon-visible' : null} 0.2s ease forwards;
  ${props => props.isTitle ? 'vertical-align: text-bottom;' : null}
  
  @keyframes vessel-icon-visible {
    0%   {
      opacity: 0;
     }
    100% {
      opacity: 1;
    }
  }

  @keyframes vessel-icon-hidden {
    0% {
      opacity: 1;
    }
    100%   {
      opacity: 0;
    }
  }
`

const BoxFilter = styled(BoxFilterSVG)`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 5px;
  vertical-align: text-bottom;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding-left: 7px;
`

const PolygonFilter = styled(PolygonFilterSVG)`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
  vertical-align: text-bottom;
`

export default VesselList
