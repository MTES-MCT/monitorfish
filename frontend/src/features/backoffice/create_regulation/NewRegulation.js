import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import getAllRegulatoryLayersByRegTerritory from '../../../domain/use_cases/getAllRegulatoryLayersByRegTerritory'
import {
  RegulationGeometryLine,
  RegulationLawTypeLine,
  RegulationLayerZoneLine,
  RegulationRegionLine,
  RegulationSeaFrontLine,
  RegulationTopicLine,
  RegulatoryTextSection,
  UpcomingRegulationModal
} from './'
import BaseMap from '../../map/BaseMap'

// A déplacer ?
import { setRegulatoryGeometryToPreview } from '../../../domain/shared_slices/Regulatory'
import getGeometryWithoutRegulationReference from '../../../domain/use_cases/getGeometryWithoutRegulationReference'

import { formatDataForSelectPicker } from '../../../utils'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { Footer, FooterButton, Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import { setSelectedRegulation } from '../Regulation.slice'
import GML from 'ol/format/GML'
import WFS from 'ol/format/WFS'
import Feature from 'ol/Feature'
import { GEOSERVER_URL } from '../../../api/fetch'

const CreateRegulation = ({ title }) => {
  const isEdition = true
  const dispatch = useDispatch()
  const {
    regulatoryTopics,
    regulatoryLawTypes,
    seaFronts,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

  const { isModalOpen } = useSelector(state => state.regulation)

  /** @type {string} */
  const [selectedRegulationLawType, setSelectedRegulationLawType] = useState()
  /** @type {string} */
  const [selectedRegulationTopic, setSelectedRegulationTopic] = useState()
  /** @type {string} */
  const [nameZone, setNameZone] = useState()
  /** @type {string} */
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  /** @type {[String]} */
  const [selectedRegionList, setSelectedRegionList] = useState([])
  /** @type {string} */
  const [regulationLawType, setRegulationLawType] = useState('')
  /** @type {[regulatoryText]} */
  const [regulatoryTextList, setRegulatoryTextList] = useState([{}])
  /** @type {[GeoJSONGeometry]} geometryObjectList */
  const [geometryObjectList, setGeometryObjectList] = useState([])
  /** @type {GeoJSONGeometry} selectedGeometry */
  const [selectedGeometryId, setSelectedGeometry] = useState()
  const [showRegulatoryPreview, setShowRegulatoryPreview] = useState(false)
  /** @type {[Number]} geometryIdList */
  const geometryIdList = useMemo(() => geometryObjectList ? formatDataForSelectPicker(Object.keys(geometryObjectList)) : [])

  useEffect(() => {
    if (regulatoryTopics && regulatoryLawTypes && seaFronts) {
      dispatch(getAllRegulatoryLayersByRegTerritory())
    }
    const newRegulation = {
      regulatoryText: [],
      upcomingRegulation: [{}]
    }
    getGeometryObjectList()
    dispatch(setSelectedRegulation(newRegulation))
  }, [])

  useEffect(() => {
    if (isEdition && regulatoryZoneMetadata) {
      initForm()
    }
  }, [isEdition, regulatoryZoneMetadata])

  const initForm = () => {
    setSelectedRegulationLawType(`${regulatoryZoneMetadata.lawType} / ${regulatoryZoneMetadata.seafront}`)
    setSelectedRegulationTopic(regulatoryZoneMetadata.topic)
    setNameZone(regulatoryZoneMetadata.zone)
    setSelectedRegionList(regulatoryZoneMetadata.region.split(', '))
    setSelectedSeaFront(regulatoryZoneMetadata.seafront)
    setRegulatoryTextList(JSON.parse(regulatoryZoneMetadata.regulatoryReferences))
    setSelectedGeometry(regulatoryZoneMetadata.id)
  }

  useEffect(() => {
    if (geometryObjectList && selectedGeometryId && showRegulatoryPreview) {
      dispatch(setRegulatoryGeometryToPreview(geometryObjectList[selectedGeometryId] ? geometryObjectList[selectedGeometryId] : regulatoryZoneMetadata.geometry))
    }
  }, [selectedGeometryId, geometryObjectList, showRegulatoryPreview])

  const getGeometryObjectList = () => {
    dispatch(getGeometryWithoutRegulationReference())
      .then(geometryListAsObject => {
        if (geometryListAsObject !== undefined) {
          setGeometryObjectList(geometryListAsObject)
        }
      })
  }

  const createOrUpdateRegulation = () => {
    // TODO : Check form values
    /** if (regulatoryTextHasMissingValue) {
      console.log('one value is missing somewhere ! ')
    } */

    // TODO Move to a use_case
    const formatWFS = new WFS()
    const formatGML = new GML({
      featureType: 'monitorfish:regulatory_areas',
      srsName: 'EPSG:4326'
    })
    const feature = new Feature({
      layer_name: selectedRegulationTopic
    })
    feature.setId(`regulatory_areas.${selectedGeometryId}`)

    const xs = new XMLSerializer()
    const update = formatWFS.writeTransaction(null, [feature], null, formatGML)
    const payload = xs.serializeToString(update)

    fetch(`${GEOSERVER_URL}/geoserver/wfs`, {
      method: 'POST',
      mode: 'no-cors',
      dataType: 'xml',
      processData: false,
      contentType: 'text/xml',
      body: payload.replace('feature:', '')
    }).then(r => console.log(r))
  }

  const saveAsDraft = () => {
    console.log('saveAsDraft')
  }

  return (
    <>
    <Wrapper>
      <CreateRegulationWrapper>
        <Body>
          <Header>
            <LinkSpan><ChevronIcon/>
              <BackLink to={'/backoffice'}>Revenir à la liste complète des zones</BackLink>
            </LinkSpan>
            <HeaderTitle>{title}</HeaderTitle>
            <Span />
          </Header>
          <ContentWrapper>
            <Content>
              <Section>
                <SectionTitle>
                  identification de la zone réglementaire
                </SectionTitle>
                <RegulationLawTypeLine
                  setSelectedValue={setSelectedRegulationLawType}
                  selectedValue={selectedRegulationLawType}
                  selectData={formatDataForSelectPicker(regulatoryLawTypes)}
                  reglementationBlocName={regulationLawType}
                  setReglementationBlocName={setRegulationLawType}
                />
                <RegulationTopicLine
                  selectedRegulationTopic={selectedRegulationTopic}
                  setSelectedRegulationTopic={setSelectedRegulationTopic}
                  zoneThemeList={formatDataForSelectPicker(regulatoryTopics)}
                />
                <RegulationLayerZoneLine
                  nameZone={nameZone}
                  setNameZone={setNameZone}
                />
                <RegulationSeaFrontLine
                  selectedSeaFront={selectedSeaFront}
                  setSelectedSeaFront={setSelectedSeaFront}
                  seaFrontList={formatDataForSelectPicker(seaFronts)}
                />
                <RegulationRegionLine
                  setSelectedRegionList={setSelectedRegionList}
                  selectedRegionList={selectedRegionList}
                />
                <RegulationGeometryLine
                  setSelectedGeometry={setSelectedGeometry}
                  geometryIdList={geometryIdList}
                  selectedGeometry={selectedGeometryId}
                  setShowRegulatoryPreview={setShowRegulatoryPreview}
                  showRegulatoryPreview={showRegulatoryPreview}
                />
              </Section>
            </Content>
            <Content>
              <RegulatoryTextSection
                regulatoryTextList={regulatoryTextList}
                setRegulatoryTextList={setRegulatoryTextList}
                source={'regulation'}
              />
            </Content>
          </ContentWrapper>
        </Body>
        <Footer>
          <FooterButton>
            <ValidateButton
              disabled={false}
              isLast={false}
              onClick={createOrUpdateRegulation}
            >
              Créer la réglementation
            </ValidateButton>
            <CancelButton
              disabled={false}
              isLast={false}
              onClick={saveAsDraft}
            >
              Enregistrer un brouillon
            </CancelButton>
          </FooterButton>
        </Footer>
      </CreateRegulationWrapper>
    { showRegulatoryPreview && <BaseMap />}
    </Wrapper>
    {isModalOpen && <UpcomingRegulationModal />}
    </>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const Body = styled.div`
  height: calc(100vh - 75px);
  overflow-y: scroll;
`

const Header = styled.div`
  display: flex;
  margin: 15px 27px;
`

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex: 2;
  flex-direction: column;
  padding: 11px 27px 11px 27px;
  background-color: ${COLORS.background};
  height: 100vh;
`

const LinkSpan = styled.span`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  cursor: pointer;
`

const Span = styled.span`
  flex: 1;
`

const BackLink = styled(Link)`
  text-decoration: underline;
  font: normal normal normal 13px;
  letter-spacing: 0px;
  color: ${COLORS.slateGray}!important;
  align-self: center;
  &:visited {
    color: ${COLORS.slateGray}!important;
  }
`

const HeaderTitle = styled.span`
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.slateGray};
  text-transform: uppercase;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(270deg);
  width: 16px;
  margin-right: 5px;
  margin-top: 5px;
`

const ContentWrapper = styled.div`
  padding: 40px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
`

export default CreateRegulation
