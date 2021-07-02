import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../components/icons/Chevron_simple_gris.svg'
import SelectPicker from 'rsuite/lib/SelectPicker'

const CreateRegulation = () => {
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
            <Label>Label</Label>
            <SelectPicker
              style={{ width: 70, margin: '2px 10px 10px 0' }}
              searchable={false}
              placeholder="x heures..."
              value={}
              onChange={}
              data={}
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

const DropDownMenu = styled.div``

export default CreateRegulation
