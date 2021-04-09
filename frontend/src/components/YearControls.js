import React, { useEffect, useState } from 'react'
import styled from "styled-components";

import {COLORS} from "../constants/constants";
import { ReactComponent as ChevronIconSVG } from './icons/Chevron_simple_gris.svg'
import { ReactComponent as GyroGreenSVG } from './icons/Gyrophare_controles_vert.svg'
import { ReactComponent as GyroRedSVG } from './icons/Gyrophare_controles_rouge.svg'
import { getCoordinates, getDate } from '../utils'
import { WSG84_PROJECTION } from '../domain/entities/map'
import { controlType } from '../domain/entities/controls'

const YearControls = props => {
    const [isOpen, setIsOpen] = useState(false)
    const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)
    const [numberOfInfractions, setNumberOfInfractions] = useState(null)

    useEffect(() => {
        if(props.yearControls && props.yearControls.length) {
            let nextNumberOfInfractions = parseFloat(props.yearControls
              .reduce((accumulator, control) => {
                  return accumulator + control.infractions.length
              }, 0).toFixed(1))

            setNumberOfInfractions(nextNumberOfInfractions)
        }
    }, [props.yearControls])

    return props.yearControls ? <Row>
        <YearTitle isLastItem={props.isLastItem} isOpen={isOpen}>
            <Text isOpen={isOpen} title={props.year} onClick={() => setIsOpen(!isOpen)}>
                <ChevronIcon isOpen={isOpen}/>
                <Year>{props.year}</Year>
                <YearResume>
                    { props.yearControls.length } contrôle{ props.yearControls.length > 1 ? 's' : ''},
                    {' '}{ numberOfInfractions ? <>{numberOfInfractions} infractions <Red/></> : <>pas d'infraction <Green /></>}
                </YearResume>
            </Text>
        </YearTitle>
        <List
          isOpen={isOpen}
          name={props.yearControls.length ? props.yearControls[0].controlDatetimeUtc : props.year}>
            {
                props.yearControls.length ?
                  props.yearControls.map((control, index) => {
                      return <Control key={index} isLastItem={props.yearControls.length === index + 1}>
                          <Title>
                              {
                                  control.infractions && control.infractions.length ? <GyroRed /> : <GyroGreen />
                              }
                              CONTRÔLE DU { getDate(control.controlDatetimeUtc) }
                              {
                                  control.seizure ?
                                    <ResumeBox>
                                        <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
                                        <ResumeBoxText>Appréhension</ResumeBoxText>
                                    </ResumeBox> : null
                              }
                              {
                                  control.diversion ?
                                    <ResumeBox>
                                        <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
                                        <ResumeBoxText>Déroutement</ResumeBoxText>
                                    </ResumeBox> : null
                              }
                              {
                                  control.escortToQuay ?
                                    <ResumeBox>
                                        <ResumeBoxNumber isRed={true}>{1}</ResumeBoxNumber>
                                        <ResumeBoxText>Reconduite à quai</ResumeBoxText>
                                    </ResumeBox> : null
                              }
                          </Title>
                          <Key width={47}>Type</Key>
                          <SubValue>
                              { control.controlType }
                          </SubValue><br/>
                          <Key width={47}>Façade</Key>
                          <SubValue>
                            {control.facade ? <>{control.facade}</> : <NoValue>-</NoValue>}
                          </SubValue><br/>
                        {
                          (control.controlType === controlType.AERIAL) || (control.controlType === controlType.SEA) ?
                            <SubFields>
                                <SubField>
                                    <Key width={47}>Lat.</Key>
                                    <SubValue>{control.latitude ? <>{getCoordinates([control.latitude, control.longitude], WSG84_PROJECTION)[0]}</> : <NoValue>-</NoValue>}</SubValue>
                                </SubField><br/>
                                <SubField>
                                    <Key width={47}>Lon.</Key>
                                    <SubValue>{control.longitude ? <>{getCoordinates([control.latitude, control.longitude], WSG84_PROJECTION)[1]}</> : <NoValue>-</NoValue>}</SubValue>
                                </SubField>
                            </SubFields> : null
                        }
                          {
                              control.controlType === controlType.LAND ?
                                <>
                                    <Key width={47}>Port</Key>
                                    <SubValue>
                                        {control.portName ? <>{control.portName} ({control.portLocode})</> : control.portLocode}
                                    </SubValue>
                                </> : null
                          }
                          <SubFields>
                              <SubField>
                                  <Key width={47}>Admin.</Key>
                                  <SubValue>{control.controller && control.controller.administration ? <>{control.controller.administration}</> : <NoValue>-</NoValue>}</SubValue>
                              </SubField>
                              <SubField>
                                  <SubKey>Unité</SubKey>
                                  <SubValue>{control.controller && control.controller.controller ? <>{control.controller.controller}</> : <NoValue>-</NoValue>}</SubValue>
                              </SubField>
                          </SubFields>
                          <Key width={47}>Résultat</Key>
                          <SubValue>
                              { control.infractions && control.infractions.length ? `${control.infractions.length} infractions` : `pas d'infraction` }
                          </SubValue><br/>
                          {
                              control.seizure ?
                                <>
                                    <Key width={80}>Appréhension</Key>
                                    <SubValue>
                                        { control.seizureComment }
                                    </SubValue><br/>
                                    </> : null
                          }
                          <Key width={80}>Observations</Key>
                          <SubValue>
                              { control.postControlComments ? control.postControlComments : <NoValue>-</NoValue> }
                          </SubValue>
                          {
                              control.infractions && control.infractions.length ?
                                <Infractions>
                                {
                                  control.infractions.map((infraction, index) => {
                                    return <Infraction>
                                      <Line>
                                        <InfractionKey>infraction {index + 1}</InfractionKey>
                                        <InfractionValue>
                                          { infraction.infractionCategory }
                                        </InfractionValue>
                                      </Line>
                                      <Line>
                                        <InfractionKey>Description</InfractionKey>
                                        <InfractionValue>
                                          NATINF { infraction.natinfCode } - { infraction.infraction } - { infraction.regulation }
                                        </InfractionValue>
                                      </Line>
                                    </Infraction>
                                  })
                                }
                                </Infractions> : null
                          }
                        {
                          seeMoreIsOpen ?
                            <More>
                              <Key width={135}>Contrôle sur OM</Key>
                              <SubValue>
                                { control.missionOrder ? 'Oui' : 'Non' }
                              </SubValue><br/>
                              <Key width={135}>Navire ciblé</Key>
                              <SubValue>
                              { control.vesselTargeted ? 'Oui' : 'Non' }
                              </SubValue><br/>
                              <Key width={135}>Contrôle des engins</Key>
                              <SubValue>
                              { control.gearControls && control.gearControls.length ? 'Oui' : 'Non' }
                              </SubValue><br/>
                                {
                                    control.gearControls && control.gearControls.length ?
                                      control.gearControls.map((gear, index) => {
                                          return <Gear>
                                              <Key width={100}>Engin {index + 1}</Key>
                                              <SubValue>
                                                  {gear.gearName ? <>{gear.gearName} ({gear.gearCode})</> : gear.gearCode}
                                              </SubValue><br/>
                                              <SubFields>
                                                  <SubField>
                                                      <Key width={100}>Maillage déclaré</Key>
                                                      <SubValue>{gear.declaredMesh ? <>{gear.declaredMesh}</> : <NoValue>-</NoValue>}</SubValue>
                                                  </SubField>
                                                  <SubField>
                                                      <SubKey>Maillage mesuré</SubKey>
                                                      <SubValue>{gear.controledMesh ? <>{gear.controledMesh}</> : <NoValue>-</NoValue>}</SubValue>
                                                  </SubField>
                                              </SubFields>
                                          </Gear>
                                      }) : null
                                }
                              <Key width={135}>Contexte du contrôle</Key>
                              <SubValue>
                              { control.cooperative === false ? 'Coopératif' : 'Non coopératif' }
                              </SubValue>
                            </More> : null
                        }
                        <SeeMore onClick={() => setSeeMoreIsOpen(!seeMoreIsOpen)}>
                          Voir {seeMoreIsOpen ? 'moins' : 'plus'} de détails
                        </SeeMore>
                      </Control>
                  }) : null
            }
        </List>
    </Row> : null
}

const More = styled.div`
  margin-top: 10px;
`

const Gear = styled.div`
  margin-left: 10px;
`

const SeeMore = styled.a`
  margin-top: 10px;
  display: block;
  text-decoration: underline;
  font-size: 13px;
  color: ${COLORS.textGray};
  cursor: pointer;
`

const Line = styled.tr`
  border: none;
`

const Infractions = styled.table`
  margin-top: 10px;
  border: none;
  padding: 0;
  overflow: hidden !important;
`

const Infraction = styled.div`
  margin-top: 5px;
`

const ResumeBoxText = styled.span`
  color: ${COLORS.grayDarkerThree};
  margin: 0 10px 0 5px;
  font-weight: medium;
`

const ResumeBoxNumber = styled.span`
  background: ${props => props.isRed ? COLORS.red : COLORS.grayDarkerThree };
  color: ${COLORS.grayBackground};
  border-radius: 11px;
  height: 16px;
  display: inline-block;
  line-height: 15px;
  width: 16px;
  text-align: center;
  font-weight: bolder;
  margin: 3px 0 0 4px;
`

const ResumeBox = styled.span`
  background: ${COLORS.grayLighter};
  border-radius: 11px;
  font-size: 13px;
  height: 22px;
  display: inline-block;
  margin: 8px 15px 10px 10px;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: bolder;
  margin-bottom: 5px;
`

const NoValue = styled.span`
  color: ${COLORS.grayDarkerTwo};
  font-weight: 300;
  line-height: normal;
`

const SubFields = styled.div`
  display: flex;
`

const SubField = styled.div`
  flex: 1 1 0;
`

const Control = styled.div`
  width: -moz-available;
  width: -webkit-fill-available;
  padding: 10px 10px 10px 20px;
  ${props => !props.isLastItem ? `border-bottom: 1px solid ${COLORS.gray};` : null}
`

const SubKey = styled.span`
  font-size: 13px;
  color: ${COLORS.textGray};
  margin-right: 10px;
`

const Key = styled.span`
  font-size: 13px;
  color: ${COLORS.textGray};
  margin-right: 10px;
  width: ${props => props.width ? props.width : '47'}px;
  display: inline-block;
`

const InfractionKey = styled.th`
  font-size: 13px;
  color: ${COLORS.textGray};
  margin-right: 10px;
  width: 80px;
  display: inline-block;
  border: none;
  background: none;
  font-weight: normal;
`

const InfractionValue = styled.th`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin-right: 10px;
  flex: initial;
  display: inline-block;
  margin: 0;
  background: none;
  font-weight: normal;
  width: 350px;
  white-space: break-spaces;
  vertical-align: top;
  padding-top: 4px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin-right: 10px;
`

const Red = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #E1000F;
  border-radius: 50%;
  display: inline-block;
`

const Green = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #8CC63F;
  border-radius: 50%;
  display: inline-block;
`

const GyroGreen = styled(GyroGreenSVG)`
  width: 16px;
  margin: 10px 10px 0 0;
  vertical-align: sub;
`

const GyroRed = styled(GyroRedSVG)`
  width: 16px;
  margin: 10px 10px 0 0;
  vertical-align: sub;
`

const Year = styled.span`
  color: ${COLORS.textGray};
  font-size: 16px;
`

const YearResume = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  margin-left: 15px;
  vertical-align: text-bottom;
`

const YearTitle = styled.span`
  padding: 7px 5px 5px 20px;
  width: 100%;
  display: flex;
  user-select: none;
  cursor: pointer;
  ${props => !props.isOpen ? null : `border-bottom: 1px solid ${COLORS.gray};`}
  ${props => !props.isLastItem ? `border-bottom: 1px solid ${COLORS.gray};` : null}
`

const Row = styled.div`
  margin: 0;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  margin: 0;
  background: ${COLORS.background};
  color: ${COLORS.grayDarkerThree};
  border-bottom: 1px solid ${COLORS.gray};
  line-height: 1.9em;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 14px;
  margin-right: 10px;
  margin-top: 9px;
  float: right;
  
  animation: ${props => props.isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing'} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-layer-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

const List = styled.div`
  height: 0;
  overflow: hidden;
  opacity: 0;
  animation: ${props => props.isOpen ? `list-controls-opening` : `list-controls-closing`} 0.2s ease forwards;

  @keyframes list-controls-opening {
    0%   { opacity: 0; height: 0; }
    100% { opacity: 1; height: inherit; }
  }

  @keyframes list-controls-closing {
    0%   { opacity: 1; height: inherit; }
    100% { opacity: 0; height: 0; }
  }
`

const Text = styled.div`
  color: ${COLORS.textGray};
  font-size: 13px;
  font-weight: 500;
  width: 95%;
  cursor: pointer;
`

export default YearControls
