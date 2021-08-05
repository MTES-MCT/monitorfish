import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as REGPaperSVG } from '../../icons/reg_paper_dark.svg'
import { ReactComponent as AlertSVG } from '../../icons/Picto_alerte.svg'
import { FingerprintSpinner } from 'react-epic-spinners'
import { getDateTime } from '../../../utils'
import closeRegulatoryZoneMetadata from '../../../domain/use_cases/closeRegulatoryZoneMetadata'
import { useDispatch, useSelector } from 'react-redux'
import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'

const RegulatoryLayerZoneMetadata = () => {
  const dispatch = useDispatch()
  const gears = useSelector(state => state.gear.gears)
  const {
    regulatoryZoneMetadata,
    regulatoryZoneMetadataPanelIsOpen
  } = useSelector(state => state.regulatory)
  const { healthcheckTextWarning } = useSelector(state => state.global)

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

  const getTitle = regulatory => regulatory
    ? `${regulatory.topic.replace(/[_]/g, ' ')} - ${regulatory.zone.replace(/[_]/g, ' ')}`
    : ''

  return (
    <Wrapper
      healthcheckTextWarning={healthcheckTextWarning}
      regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}>
      {
        regulatoryZoneMetadataPanelIsOpen
          ? regulatoryZoneMetadata
            ? <>
              <Header>
                <REGPaperIcon/>
                <RegulatoryZoneName title={getTitle(regulatoryZoneMetadata)}>
                  {getTitle(regulatoryZoneMetadata)}
                </RegulatoryZoneName>
                <CloseIcon onClick={() => dispatch(closeRegulatoryZoneMetadata())}/>
              </Header>
              <Warning>
                <WarningIcon/>
                Travail en cours, bien vérifier dans Légipêche la validité de la référence et des infos réglementaires
              </Warning>
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
                            <Value data-cy={'regulatory-layers-metadata-seafront'}>{regulatoryZoneMetadata.seafront
                              ? regulatoryZoneMetadata.seafront
                              : <NoValue>-</NoValue>}</Value>
                          </Field>
                          <Field>
                            <Key>Région</Key>
                            <Value>{regulatoryZoneMetadata.region
                              ? regulatoryZoneMetadata.region
                              : <NoValue>-</NoValue>}</Value>
                          </Field>
                          <Field>
                            <Key>Zone</Key>
                            <Value>{regulatoryZoneMetadata.zone
                              ? regulatoryZoneMetadata.zone.replace(/[_]/g, ' ')
                              : <NoValue>-</NoValue>}</Value>
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
                                  ? <ValueWithLineBreak data-cy={'regulatory-layers-metadata-gears'} key={gear.code}>{gear.name} ({gear.code})</ValueWithLineBreak>
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
                    ? <ZoneWithLineBreak isLast>
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
                                      <a target="_blank" href={regulatoryReference.url}
                                         rel="noreferrer">{regulatoryReference.reference}</a>
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
          : null
      }
    </Wrapper>
  )
}

const Wrapper = styled.div`
  border-radius: 2px;
  width: 400px;
  display: block;
  color: ${COLORS.charcoal};
  background-color: ${COLORS.gainsboro};
  opacity: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 1 : 0};
  z-index: -1;
  padding: 0;
  min-height: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 400 : 0}px;
  transition: all 0.5s;
`

const Reference = styled.li`
  list-style-type: "→";
  padding-left: 10px;
  font-size: 13px;
`

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

const RegulatoryZoneName = styled.span`
  flex: 1;
  line-height: initial;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  margin-left: 5px;
  margin-right: 5px;
`

const Header = styled.div`
  color: ${COLORS.gunMetal};
  margin-left: 6px;
  text-align: left;
  height: 40px;
  display: flex;
  font-weight: 500;
  font-size: 15px;
  align-items: center;
  justify-content: center;
`

const Content = styled.div`
  border-radius: 2px;
  color: ${COLORS.lightGray};
  background: ${COLORS.background};
  overflow-y: auto;
  max-height: 72vh;
`

const Warning = styled.div`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  background: ${COLORS.orange};
  display: flex;
  text-align: left;
  font: normal normal bold 13px/18px Marianne;
  padding: 10px;
`

const WarningIcon = styled(AlertSVG)`
  width: 30px;
  flex: 57px;
  height: 30px;
  margin: 4px 10px 0px 0;
`

const REGPaperIcon = styled(REGPaperSVG)`
  margin-left: 3px;
  width: 25px;
`

const Body = styled.tbody``

const Zone = styled.div`
  margin: 0;
  padding: 10px 5px 9px 16px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid ${COLORS.lightGray};
`

const ZoneWithLineBreak = styled.div`
  margin: 0;
  padding: 10px 5px 9px 16px;
  text-align: left;
  display: block;
  ${props => !props.isLast ? `border-bottom: 1px solid ${COLORS.lightGray};` : null}
  
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
  color: ${COLORS.gunMetal};
  padding: 2px 5px 5px 0;
  line-height: normal;
  font-size: 13px;
  font-weight: 500;
`

const MarkdownValue = styled(ReactMarkdown)`
  color: ${COLORS.gunMetal};
  padding: 2px 5px 5px 0;
  line-height: normal;
  font-size: 13px;
  font-weight: 500;
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
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-size: 13px;
  font-weight: 500;
`

const NoValue = styled.span`
  color: ${COLORS.grayDarkerTwo};
  font-weight: 300;
  line-height: normal;
  font-size: 13px;
  display: block;
`

export default RegulatoryLayerZoneMetadata
