import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as REGPaperSVG } from '../icons/reg_paper.svg'
import { ReactComponent as CloseIconSVG } from '../icons/Croix_grise.svg'
import { FingerprintSpinner } from 'react-epic-spinners'
import { getDateTime } from '../../utils'

const RegulatoryZoneMetadata = props => {
  const [gears, setGears] = useState([])
  const [prohibitedGears, setProhibitedGears] = useState([])
  const firstUpdate = useRef(true)
  const [regulatoryReferences, setRegulatoryReferences] = useState([])

  useEffect(() => {
    if (props.regulatoryZoneMetadata && props.gears) {
      firstUpdate.current = false

      setRegulatoryReferences(JSON.parse(props.regulatoryZoneMetadata.regulatoryReferences))

      if (!props.regulatoryZoneMetadata.gears) {
        setGears(null)
      } else {
        const gearCodesArray = props.regulatoryZoneMetadata.gears.replace(/ /g, '').split(',')
        const gears = gearCodesArray.map(gearCode => {
          const foundGear = props.gears.find(gear => gear.code === gearCode)
          return {
            name: foundGear ? foundGear.name : null,
            code: gearCode
          }
        })
        setGears(gears)
      }

      if (!props.regulatoryZoneMetadata.prohibitedGears) {
        setProhibitedGears(null)
      } else {
        const prohibitedGearCodesArray = props.regulatoryZoneMetadata.prohibitedGears.replace(/ /g, '').split(',')
        const prohibitedGears = prohibitedGearCodesArray.map(gearCode => {
          const foundGear = props.gears.find(gear => gear.code === gearCode)
          return {
            name: foundGear ? foundGear.name : null,
            code: gearCode
          }
        })
        setProhibitedGears(prohibitedGears)
      }
    }
  }, [props.gears, props.regulatoryZoneMetadata])

  const getTitle = regulatory => `${regulatory.layerName.replace(/[_]/g, ' ')} - ${regulatory.zone.replace(/[_]/g, ' ')}`

  return (
        <Wrapper
            firstUpdate={firstUpdate.current}
            regulatoryZoneMetadataPanelIsOpen={props.regulatoryZoneMetadataPanelIsOpen}
            layersSidebarIsOpen={props.layersSidebarIsOpen}
            regulatoryZoneMetadata={props.regulatoryZoneMetadata}
        >
            {
                props.regulatoryZoneMetadataPanelIsOpen && props.regulatoryZoneMetadata
                  ? <>
                        <Header>
                            <REGPaperIcon/>
                            <RegulatoryName title={getTitle(props.regulatoryZoneMetadata)}>
                                <Ellipsis>
                                    <Title>{getTitle(props.regulatoryZoneMetadata)}</Title>
                                </Ellipsis>
                            </RegulatoryName>
                            <CloseIcon onClick={() => props.callCloseRegulatoryZoneMetadata()}/>
                        </Header>
                        <Content>
                            {
                                props.regulatoryZoneMetadata.seafront ||
                                props.regulatoryZoneMetadata.region ||
                                props.regulatoryZoneMetadata.zone ||
                                props.regulatoryZoneMetadata.deposit
                                  ? <Zone>
                                      <Fields>
                                          <Body>
                                              <Field>
                                                  <Key>Façade</Key>
                                                  <Value>{props.regulatoryZoneMetadata.seafront ? props.regulatoryZoneMetadata.seafront : <NoValue>-</NoValue>}</Value>
                                              </Field>
                                              <Field>
                                                  <Key>Région</Key>
                                                  <Value>{props.regulatoryZoneMetadata.region ? props.regulatoryZoneMetadata.region : <NoValue>-</NoValue>}</Value>
                                              </Field>
                                              <Field>
                                                  <Key>Zone</Key>
                                                  <Value>{props.regulatoryZoneMetadata.zone ? props.regulatoryZoneMetadata.zone.replace(/[_]/g, ' ') : <NoValue>-</NoValue>}</Value>
                                              </Field>
                                              {
                                                  props.regulatoryZoneMetadata.deposit
                                                    ? <Field>
                                                        <Key>Gisement</Key>
                                                        <Value>{props.regulatoryZoneMetadata.deposit}</Value>
                                                    </Field>
                                                    : null

                                              }
                                          </Body>
                                      </Fields>
                                  </Zone>
                                  : null
                            }
                            {
                                props.regulatoryZoneMetadata.period ||
                                props.regulatoryZoneMetadata.openingDate ||
                                props.regulatoryZoneMetadata.closingDate ||
                                props.regulatoryZoneMetadata.state
                                  ? <Zone>
                                      <Fields>
                                          <Body>
                                              {
                                                  props.regulatoryZoneMetadata.period
                                                    ? <Field>
                                                        <Key>Période(s)</Key>
                                                        <Value>{props.regulatoryZoneMetadata.period}</Value>
                                                    </Field>
                                                    : null
                                              }
                                              {
                                                  props.regulatoryZoneMetadata.openingDate
                                                    ? <Field>
                                                        <Key>Dates d&apos;ouvertures</Key>
                                                        <Value>
                                                            <>
                                                                {getDateTime(props.regulatoryZoneMetadata.openingDate, true)}{' '}
                                                                <Gray>(UTC)</Gray>
                                                            </>
                                                        </Value>
                                                    </Field>
                                                    : null
                                              }
                                              {
                                                  props.regulatoryZoneMetadata.closingDate
                                                    ? <Field>
                                                        <Key>Dates de fermetures</Key>
                                                        <Value>
                                                            <>
                                                                {getDateTime(props.regulatoryZoneMetadata.closingDate, true)}{' '}
                                                                <Gray>(UTC)</Gray>
                                                            </>
                                                        </Value>
                                                    </Field>
                                                    : null
                                              }
                                              {/*
                                              // TODO Re-add the regulatory state when the field is fixed for all data
                                              {
                                                  props.regulatoryZoneMetadata.state ?
                                                    <Field>
                                                        <Key>État</Key>
                                                        <Value>{props.regulatoryZoneMetadata.state}</Value>
                                                    </Field> : null
                                              } */}
                                          </Body>
                                      </Fields>
                                  </Zone>
                                  : null
                            }
                            {
                                (gears && gears.length) ||
                                  (prohibitedGears && prohibitedGears.length) ||
                                  props.regulatoryZoneMetadata.technicalMeasures
                                  ? <ZoneWithLineBreak>
                                      {
                                          gears && gears.length
                                            ? <>
                                                <KeyWithLineBreak>Engin(s)</KeyWithLineBreak>
                                                {
                                                    gears.map(gear => {
                                                      return gear.name
                                                        ? <ValueWithLineBreak key={gear.code}>{gear.name} ({gear.code})</ValueWithLineBreak>
                                                        : <ValueWithLineBreak key={gear.code}>{gear.code}</ValueWithLineBreak>
                                                    })
                                                }
                                            </>
                                            : null
                                      }
                                      {
                                          prohibitedGears && prohibitedGears.length
                                            ? <>
                                                <KeyWithLineBreak>Engin(s) interdit(s)</KeyWithLineBreak>
                                                {
                                                    prohibitedGears.map(gear => {
                                                      return gear.name
                                                        ? <ValueWithLineBreak key={gear.code}>{gear.name} ({gear.code})</ValueWithLineBreak>
                                                        : <ValueWithLineBreak key={gear.code}>{gear.code}</ValueWithLineBreak>
                                                    })
                                                }
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.technicalMeasures
                                            ? <>
                                                <KeyWithLineBreak>Mesures techniques</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.technicalMeasures} </ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                  </ZoneWithLineBreak>
                                  : null
                            }
                            {
                                props.regulatoryZoneMetadata.species ||
                                props.regulatoryZoneMetadata.prohibitedSpecies ||
                                props.regulatoryZoneMetadata.size ||
                                props.regulatoryZoneMetadata.quantity ||
                                props.regulatoryZoneMetadata.bycatch ||
                                props.regulatoryZoneMetadata.rejections
                                  ? <ZoneWithLineBreak>
                                      {
                                          props.regulatoryZoneMetadata.species
                                            ? <>
                                                <KeyWithLineBreak>Espèce(s)</KeyWithLineBreak>
                                                {
                                                    props.regulatoryZoneMetadata.species.replace(/ /g, '').split(',').map(species => {
                                                      return <ValueWithLineBreak key={species}>{species}</ValueWithLineBreak>
                                                    })
                                                }
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.prohibitedSpecies
                                            ? <>
                                                <KeyWithLineBreak>Espèce(s) interdite(s)</KeyWithLineBreak>
                                                {
                                                    props.regulatoryZoneMetadata.prohibitedSpecies.replace(/ /g, '').split(',').map(species => {
                                                      return <ValueWithLineBreak key={species}>{species}</ValueWithLineBreak>
                                                    })
                                                }
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.size
                                            ? <>
                                                <KeyWithLineBreak>Tailles</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.size}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.quantity
                                            ? <>
                                                <KeyWithLineBreak>Quantités</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.quantity}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.bycatch
                                            ? <>
                                                <KeyWithLineBreak>Captures accessoires</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.bycatch} </ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.rejections
                                            ? <>
                                                <KeyWithLineBreak>Rejets</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.rejections} </ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                  </ZoneWithLineBreak>
                                  : null
                            }
                            {
                                props.regulatoryZoneMetadata.mandatoryDocuments ||
                                props.regulatoryZoneMetadata.obligations ||
                                props.regulatoryZoneMetadata.prohibitions ||
                                props.regulatoryZoneMetadata.permissions ||
                                (regulatoryReferences && regulatoryReferences.length)
                                  ? <ZoneWithLineBreak>
                                      {
                                          props.regulatoryZoneMetadata.mandatoryDocuments
                                            ? <>
                                                <KeyWithLineBreak>Documents obligatoires</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.mandatoryDocuments}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.obligations
                                            ? <>
                                                <KeyWithLineBreak>Autres obligations</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.obligations}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.prohibitions
                                            ? <>
                                                <KeyWithLineBreak>Interdictions</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.prohibitions}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          props.regulatoryZoneMetadata.permissions
                                            ? <>
                                                <KeyWithLineBreak>Autorisations</KeyWithLineBreak>
                                                <ValueWithLineBreak>{props.regulatoryZoneMetadata.permissions} </ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryReferences && regulatoryReferences.length
                                            ? <>
                                                <KeyWithLineBreak>Références réglementaires</KeyWithLineBreak>
                                                <ValueWithLineBreak>
                                                    <ul>
                                                        {
                                                            regulatoryReferences.map(regulatoryReference => {
                                                              return <Reference key={regulatoryReference.url}>
                                                                    <a target="_blank" href={regulatoryReference.url} rel="noreferrer">{regulatoryReference.reference}</a>
                                                                </Reference>
                                                            })
                                                        }
                                                    </ul>
                                                </ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                  </ZoneWithLineBreak>
                                  : null
                            }
                        </Content>
                    </>
                  : <FingerprintSpinner color={COLORS.background} className={'radar'} size={100}/>
            }
        </Wrapper>
  )
}

const Reference = styled.li`
  list-style-type: "→";
  padding-left: 10px;
  font-size: 13px;
`

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const RegulatoryName = styled.span`
  padding: unset;
  margin: unset;
  line-height: initial;
`

const Ellipsis = styled.span`
  max-width: 290px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  display: inline-block;
`

const Header = styled.div`
  color: ${COLORS.grayDarkerThree};
  margin-left: 6px;
  text-align: left;
  height: 1.5em;
`

const Content = styled.div`
  border-radius: 2px;
  color: ${COLORS.grayDarker};
  background: ${COLORS.background};
  margin-top: 6px;
  min-height: 370px;
  overflow-y: auto;
  max-height: 85vh;
`

const Title = styled.span`
  margin-top: 2px;
  margin-left: 12px;
  font-size: 13px;
}
`

const REGPaperIcon = styled(REGPaperSVG)`
  width: 20px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  float: right;
  margin-right: 7px;
  margin-top: 5px;
  cursor: pointer;
`

const Body = styled.tbody``

const Zone = styled.div`
  margin: 0;
  padding: 10px 5px 9px 16px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid ${COLORS.grayDarker};
`

const ZoneWithLineBreak = styled.div`
  margin: 0;
  padding: 10px 5px 9px 16px;
  text-align: left;
  display: block;
  border-bottom: 1px solid ${COLORS.grayDarker};
`

const Fields = styled.table`
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  padding: unset;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const KeyWithLineBreak = styled.div`
  color: ${COLORS.grayDarkerTwo};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 6px 10px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: 400;
`

const ValueWithLineBreak = styled.div`
  color: ${COLORS.grayDarkerThree};
  padding: 2px 5px 5px 0;
  line-height: normal;
  font-size: 13px;
`

const Key = styled.th`
  color: ${COLORS.grayDarkerTwo};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 6px 10px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: 400;
`

const Value = styled.td`
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-size: 13px;
`

const NoValue = styled.span`
  color: ${COLORS.grayDarkerTwo};
  font-weight: 300;
  line-height: normal;
  font-size: 13px;
  display: block;
`

const Wrapper = styled.div`
    border-radius: 2px;
    width: 350px;
    position: absolute;
    display: block;
    color: ${COLORS.grayDarkerThree};
    text-decoration: none;
    background-color: ${COLORS.gray};
    padding: 0;
    margin-left: -30px;
    margin-top: 45px;
    top: 0px;
    opacity: 0;
    z-index: -1;
    min-height: 100px;
    max-height: calc(100vh - 50px);
    padding: 10px;
    
    animation: ${props => (props.firstUpdate && !props.regulatoryZoneMetadataPanelIsOpen) ? '' : props.regulatoryZoneMetadataPanelIsOpen ? 'regulatory-metadata-box-opening' : 'regulatory-metadata-box-closing'} 0.5s ease forwards;
    
    @keyframes regulatory-metadata-box-opening-with-margin {
        0%   { min-height: 100px; opacity: 0; margin-left: -30px;   }
        100% { min-height: 400px; opacity: 1; margin-left: 356px; }
    }
    
    @keyframes regulatory-metadata-box-closing-with-margin {
        0% { min-height: 400px; opacity: 1; margin-left: 371px; }
        100%   { min-height: 100px; opacity: 0; margin-left: -30px;   }
    }
       
    @keyframes regulatory-metadata-box-opening {
        0%   { min-height: 100px; opacity: 0; margin-left: -30px;   }
        100% { min-height: 400px; opacity: 1; margin-left: 356px; }
    }
    
    @keyframes regulatory-metadata-box-closing {
        0% { min-height: 400px; opacity: 1; margin-left: 361px; }
        100%   { min-height: 100px; opacity: 0; margin-left: -30px;   }
    }
`

export default RegulatoryZoneMetadata
