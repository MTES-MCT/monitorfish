import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as REGPaperSVG } from '../icons/reg_paper.svg'
import { ReactComponent as CloseIconSVG } from '../icons/Croix_grise.svg'
import { FingerprintSpinner } from 'react-epic-spinners'
import { getDateTime } from '../../utils'
import closeRegulatoryZoneMetadata from '../../domain/use_cases/closeRegulatoryZoneMetadata'
import { useDispatch, useSelector } from 'react-redux'

const RegulatoryZoneMetadata = props => {
  const dispatch = useDispatch()
  const gears = useSelector(state => state.gear.gears)
  const {
    regulatoryZoneMetadata,
    regulatoryZoneMetadataPanelIsOpen
  } = useSelector(state => state.regulatory)

  const [formattedGears, setFormattedGears] = useState([])
  const [prohibitedGears, setProhibitedGears] = useState([])
  const firstUpdate = useRef(true)
  const [regulatoryReferences, setRegulatoryReferences] = useState([])

  useEffect(() => {
    if (regulatoryZoneMetadata && gears) {
      firstUpdate.current = false

      setRegulatoryReferences(JSON.parse(regulatoryZoneMetadata.regulatoryReferences))

      if (!regulatoryZoneMetadata.gears) {
        setFormattedGears(null)
      } else {
        const gearCodesArray = regulatoryZoneMetadata.gears.replace(/ /g, '').split(',')
        const nextGears = gearCodesArray.map(gearCode => {
          const foundGear = gears.find(gear => gear.code === gearCode)
          return {
            name: foundGear ? foundGear.name : null,
            code: gearCode
          }
        })
        setFormattedGears(nextGears)
      }

      if (!regulatoryZoneMetadata.prohibitedGears) {
        setProhibitedGears(null)
      } else {
        const prohibitedGearCodesArray = regulatoryZoneMetadata.prohibitedGears.replace(/ /g, '').split(',')
        const prohibitedGears = prohibitedGearCodesArray.map(gearCode => {
          const foundGear = gears.find(gear => gear.code === gearCode)
          return {
            name: foundGear ? foundGear.name : null,
            code: gearCode
          }
        })
        setProhibitedGears(prohibitedGears)
      }
    }
  }, [gears, regulatoryZoneMetadata])

  const getTitle = regulatory => `${regulatory.layerName.replace(/[_]/g, ' ')} - ${regulatory.zone.replace(/[_]/g, ' ')}`

  return (
          <>
            {
                regulatoryZoneMetadataPanelIsOpen && regulatoryZoneMetadata
                  ? <>
                        <Header>
                            <REGPaperIcon/>
                            <RegulatoryName title={getTitle(regulatoryZoneMetadata)}>
                                <Ellipsis>
                                    <Title>{getTitle(regulatoryZoneMetadata)}</Title>
                                </Ellipsis>
                            </RegulatoryName>
                            <CloseIcon onClick={() => dispatch(closeRegulatoryZoneMetadata())}/>
                        </Header>
                        <Content>
                            {
                                regulatoryZoneMetadata.seafront ||
                                regulatoryZoneMetadata.region ||
                                regulatoryZoneMetadata.zone ||
                                regulatoryZoneMetadata.deposit
                                  ? <Zone>
                                      <Fields>
                                          <Body>
                                              <Field>
                                                  <Key>Façade</Key>
                                                  <Value>{regulatoryZoneMetadata.seafront ? regulatoryZoneMetadata.seafront : <NoValue>-</NoValue>}</Value>
                                              </Field>
                                              <Field>
                                                  <Key>Région</Key>
                                                  <Value>{regulatoryZoneMetadata.region ? regulatoryZoneMetadata.region : <NoValue>-</NoValue>}</Value>
                                              </Field>
                                              <Field>
                                                  <Key>Zone</Key>
                                                  <Value>{regulatoryZoneMetadata.zone ? regulatoryZoneMetadata.zone.replace(/[_]/g, ' ') : <NoValue>-</NoValue>}</Value>
                                              </Field>
                                              {
                                                  regulatoryZoneMetadata.deposit
                                                    ? <Field>
                                                        <Key>Gisement</Key>
                                                        <Value>{regulatoryZoneMetadata.deposit}</Value>
                                                    </Field>
                                                    : null

                                              }
                                          </Body>
                                      </Fields>
                                  </Zone>
                                  : null
                            }
                            {
                                regulatoryZoneMetadata.period ||
                                regulatoryZoneMetadata.openingDate ||
                                regulatoryZoneMetadata.closingDate ||
                                regulatoryZoneMetadata.state
                                  ? <Zone>
                                      <Fields>
                                          <Body>
                                              {
                                                  regulatoryZoneMetadata.period
                                                    ? <Field>
                                                        <Key>Période(s)</Key>
                                                        <Value>{regulatoryZoneMetadata.period}</Value>
                                                    </Field>
                                                    : null
                                              }
                                              {
                                                  regulatoryZoneMetadata.openingDate
                                                    ? <Field>
                                                        <Key>Dates d&apos;ouvertures</Key>
                                                        <Value>
                                                            <>
                                                                {getDateTime(regulatoryZoneMetadata.openingDate, true)}{' '}
                                                                <Gray>(UTC)</Gray>
                                                            </>
                                                        </Value>
                                                    </Field>
                                                    : null
                                              }
                                              {
                                                  regulatoryZoneMetadata.closingDate
                                                    ? <Field>
                                                        <Key>Dates de fermetures</Key>
                                                        <Value>
                                                            <>
                                                                {getDateTime(regulatoryZoneMetadata.closingDate, true)}{' '}
                                                                <Gray>(UTC)</Gray>
                                                            </>
                                                        </Value>
                                                    </Field>
                                                    : null
                                              }
                                              {/*
                                              // TODO Re-add the regulatory state when the field is fixed for all data
                                              {
                                                  regulatoryZoneMetadata.state ?
                                                    <Field>
                                                        <Key>État</Key>
                                                        <Value>{regulatoryZoneMetadata.state}</Value>
                                                    </Field> : null
                                              } */}
                                          </Body>
                                      </Fields>
                                  </Zone>
                                  : null
                            }
                            {
                                (formattedGears && formattedGears.length) ||
                                  (prohibitedGears && prohibitedGears.length) ||
                                  regulatoryZoneMetadata.technicalMeasurements
                                  ? <ZoneWithLineBreak>
                                      {
                                          formattedGears && formattedGears.length
                                            ? <>
                                                <KeyWithLineBreak>Engin(s)</KeyWithLineBreak>
                                                {
                                                    formattedGears.map(gear => {
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
                                          regulatoryZoneMetadata.technicalMeasurements
                                            ? <>
                                                <KeyWithLineBreak>Mesures techniques</KeyWithLineBreak>
                                                <MarkdownValue>{regulatoryZoneMetadata.technicalMeasurements}</MarkdownValue>
                                            </>
                                            : null
                                      }
                                  </ZoneWithLineBreak>
                                  : null
                            }
                            {
                                regulatoryZoneMetadata.species ||
                                regulatoryZoneMetadata.prohibitedSpecies ||
                                regulatoryZoneMetadata.size ||
                                regulatoryZoneMetadata.quantity ||
                                regulatoryZoneMetadata.bycatch ||
                                regulatoryZoneMetadata.rejections
                                  ? <ZoneWithLineBreak>
                                      {
                                          regulatoryZoneMetadata.species
                                            ? <>
                                                <KeyWithLineBreak>Espèce(s)</KeyWithLineBreak>
                                                {
                                                    regulatoryZoneMetadata.species.replace(/ /g, '').split(',').map(species => {
                                                      return <ValueWithLineBreak key={species}>{species}</ValueWithLineBreak>
                                                    })
                                                }
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryZoneMetadata.prohibitedSpecies
                                            ? <>
                                                <KeyWithLineBreak>Espèce(s) interdite(s)</KeyWithLineBreak>
                                                {
                                                    regulatoryZoneMetadata.prohibitedSpecies.replace(/ /g, '').split(',').map(species => {
                                                      return <ValueWithLineBreak key={species}>{species}</ValueWithLineBreak>
                                                    })
                                                }
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryZoneMetadata.size
                                            ? <>
                                                <KeyWithLineBreak>Tailles</KeyWithLineBreak>
                                                <ValueWithLineBreak>{regulatoryZoneMetadata.size}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryZoneMetadata.quantity
                                            ? <>
                                                <KeyWithLineBreak>Quantités</KeyWithLineBreak>
                                                <ValueWithLineBreak>{regulatoryZoneMetadata.quantity}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryZoneMetadata.bycatch
                                            ? <>
                                                <KeyWithLineBreak>Captures accessoires</KeyWithLineBreak>
                                                <ValueWithLineBreak>{regulatoryZoneMetadata.bycatch} </ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryZoneMetadata.rejections
                                            ? <>
                                                <KeyWithLineBreak>Rejets</KeyWithLineBreak>
                                                <ValueWithLineBreak>{regulatoryZoneMetadata.rejections} </ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                  </ZoneWithLineBreak>
                                  : null
                            }
                            {
                                regulatoryZoneMetadata.mandatoryDocuments ||
                                regulatoryZoneMetadata.obligations ||
                                regulatoryZoneMetadata.prohibitions ||
                                regulatoryZoneMetadata.permissions ||
                                (regulatoryReferences && regulatoryReferences.length)
                                  ? <ZoneWithLineBreak>
                                      {
                                          regulatoryZoneMetadata.mandatoryDocuments
                                            ? <>
                                                <KeyWithLineBreak>Documents obligatoires</KeyWithLineBreak>
                                                <ValueWithLineBreak>{regulatoryZoneMetadata.mandatoryDocuments}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryZoneMetadata.obligations
                                            ? <>
                                                <KeyWithLineBreak>Autres obligations</KeyWithLineBreak>
                                                <ValueWithLineBreak>{regulatoryZoneMetadata.obligations}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryZoneMetadata.prohibitions
                                            ? <>
                                                <KeyWithLineBreak>Interdictions</KeyWithLineBreak>
                                                <ValueWithLineBreak>{regulatoryZoneMetadata.prohibitions}</ValueWithLineBreak>
                                            </>
                                            : null
                                      }
                                      {
                                          regulatoryZoneMetadata.permissions
                                            ? <>
                                                <KeyWithLineBreak>Autorisations</KeyWithLineBreak>
                                                <ValueWithLineBreak>{regulatoryZoneMetadata.permissions} </ValueWithLineBreak>
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
          </>
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

const MarkdownValue = styled(ReactMarkdown)`
  color: ${COLORS.grayDarkerThree};
  padding: 2px 5px 5px 0;
  line-height: normal;
  font-size: 13px;
  * {
    font-size: inherit;
    margin: 0px;
  }
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

export default RegulatoryZoneMetadata
