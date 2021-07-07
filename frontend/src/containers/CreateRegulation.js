import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../components/icons/Chevron_simple_gris.svg'
import { SelectPicker, Input } from 'rsuite'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import { setError } from '../domain/reducers/Global'

const CreateRegulation = () => {
  const dispatch = useDispatch()
  // useRef ?
  const [reglementationBlocList, setReglementationBlocList] = useState([])
  const [zoneThemeList, setZoneThemeList] = useState([])
  const [seaFrontList, setSeaFrontList] = useState([])

  const [selectedReglementationBloc, setSelectedReglementationBloc] = useState()
  const [selectedZoneTheme, setSelectedZoneTheme] = useState()
  const [selectedSeaFront, setSelectedSeaFront] = useState()
  const [nameZone, setNameZone] = useState()

  // à passer dans le state ?
  // Pourquoi un dispatch ici ?
  const getRegulatoryZones = () => {
    dispatch(getAllRegulatoryZonesByRegTerritory(dispatch))
      .then(response => {
        const {
          zoneThemeArray,
          reglementationArray,
          seaFrontArray
        } = response
        setSeaFrontList(formatData(seaFrontArray))
        setZoneThemeList(formatData(zoneThemeArray))
        setReglementationBlocList(formatData(reglementationArray))
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }

  useEffect(() => {
    getRegulatoryZones()
  }, [])

  const formatData = list => {
    const array = list.map(e => {
      const obj = {
        label: e,
        value: e
      }
      return obj
    })
    return array
  }

  return (
    <CreateRegulationWrapper>
      <Header>
        <LinkSpan><ChevronIcon/><Link>Revenir à la liste complète des zones</Link></LinkSpan>
        <Title>Saisir une nouvelle réglementation</Title>
      </Header>
      <Content>
        <Section>
          <SectionTitle>
            identification de la zone réglementaire
          </SectionTitle>
          <ContentLine>
            <Label>Ensemble règlementaire</Label>
            <SelectPicker
              style={{ width: 180, margin: '2px 10px 10px 0' }}
              searchable={false}
              placeholder=" Choisir un ensemble "
              value={selectedReglementationBloc}
              onChange={setSelectedReglementationBloc}
              data={reglementationBlocList}
            />
          </ContentLine>
          <ContentLine>
            <Label>Thématique de la zone</Label>
            <SelectPicker
              style={{ width: 180, margin: '2px 10px 10px 0' }}
              searchable={true}
              placeholder=" Choisir une thématique "
              value={selectedZoneTheme}
              onChange={setSelectedZoneTheme}
              data={zoneThemeList}
            />
          </ContentLine>
          <ContentLine>
            <Label>Nom de la zone</Label>
            <Input
              placeholder=''
              value={nameZone}
              onChange={setNameZone}
            />
          </ContentLine>
          <ContentLine>
            <Label>Secteur</Label>
            <SelectPicker
              style={{ width: 180, margin: '2px 10px 10px 0' }}
              searchable={true}
              placeholder=" Choisir une thématique "
              value={selectedSeaFront}
              onChange={setSelectedSeaFront}
              data={seaFrontList}
            />
          </ContentLine>
        </Section>
      </Content>
    </CreateRegulationWrapper>
  )
}

const CreateRegulationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 15px 45px 0px 45px;
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
`

const LinkSpan = styled.span`
  display: flex;
  flex-direction: row;
`

const Link = styled.a`
  text-decoration: underline;
  font: normal normal normal 13px;
  letter-spacing: 0px;
  color: ${COLORS.textGray};
`
const Title = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.textGray};
  text-transform: uppercase;

  left: 50%;
  position: fixed;
  margin-left: -168px;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(270deg);
  width: 16px;
  margin-right: 5px;
  margin-top: 5px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
`
const Section = styled.div`
  display: flex;
  flex-direction: column;
`
const SectionTitle = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.textGray};
  text-transform: uppercase;
  width: 100%;
  border-bottom: 1px solid ${COLORS.grayDarker};
`
const ContentLine = styled.div`
  display: flex;
`
const Label = styled.span`
  text-align: left;
  font: normal normal normal 13px;
  color: ${COLORS.textGray};
`

export default CreateRegulation
