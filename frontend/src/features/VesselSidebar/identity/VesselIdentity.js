import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import countries from 'i18n-iso-countries'
import { getDate } from '../../../utils'
import { vesselsAreEquals } from '../../../domain/entities/vessel/vessel'
import { useSelector } from 'react-redux'
import { FingerprintSpinner } from 'react-epic-spinners'

const VesselIdentity = () => {
  const {
    loadingVessel,
    selectedVessel,
    selectedVesselPositions
  } = useSelector(state => state.vessel)
  const gears = useSelector(state => state.gear.gears)

  const [vesselGears, setVesselGears] = useState([])
  const [vessel, setVessel] = useState(null)
  const [lastPosition, setLastPosition] = useState(null)

  useEffect(() => {
    if (selectedVessel) {
      if (selectedVesselPositions?.length) {
        setLastPosition(selectedVesselPositions[selectedVesselPositions.length - 1])
      } else {
        if (!vesselsAreEquals(selectedVessel, vessel)) {
          setLastPosition(null)
        }
      }

      setVessel(selectedVessel)
    }
  }, [selectedVessel])

  const showLicenceExpirationDate = licenceExpirationDate => {
    return getDate(licenceExpirationDate)
  }

  useEffect(() => {
    if (gears && selectedVessel && selectedVessel.declaredFishingGears) {
      const nextVesselGears = selectedVessel.declaredFishingGears.map(declaredGearCode => {
        const foundGear = gears.find(gear => gear.code === declaredGearCode)
        return {
          name: foundGear ? foundGear.name : null,
          code: declaredGearCode
        }
      })

      setVesselGears(nextVesselGears)
    } else {
      setVesselGears([])
    }
  }, [gears, selectedVessel])

  function getVesselOrLastPositionProperty (propertyName) {
    if (vessel && vessel[propertyName]) {
      return vessel[propertyName]
    } else if (lastPosition && lastPosition[propertyName]) {
      return lastPosition[propertyName]
    } else {
      return <NoValue>-</NoValue>
    }
  }

  return (!loadingVessel
    ? <Body>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>CFR</Key>
                <Value>
                  {
                    getVesselOrLastPositionProperty('internalReferenceNumber')
                  }
                </Value>
              </Field>
              <Field>
                <Key>MMSI</Key>
                <Value>{
                  getVesselOrLastPositionProperty('mmsi')
                }</Value>
              </Field>
              <Field>
                <Key>Balise n°</Key>
                <Value>
                  {
                    getVesselOrLastPositionProperty('beaconNumber')
                  }
                </Value>
              </Field>
            </TableBody>
          </Fields>
          <Fields>
            <TableBody>
              <Field>
                <Key>Marquage ext.</Key>
                <Value>
                  {
                    getVesselOrLastPositionProperty('externalReferenceNumber')
                  }
                </Value>
              </Field>
              <Field>
                <Key>Call Sign (IRCS)</Key>
                <Value>
                  {
                    getVesselOrLastPositionProperty('ircs')
                  }
                </Value>
              </Field>
              <Field>
                <Key/>
                <Value/>
              </Field>
            </TableBody>
          </Fields>
        </Zone>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Nationalité</Key>
                <TrimmedValue>{vessel?.flagState && countries.getName(vessel?.flagState, 'fr')
                  ? countries.getName(vessel?.flagState, 'fr')
                  : <NoValue>-</NoValue>}</TrimmedValue>
              </Field>
              <Field>
                <Key>Quartier</Key>
                <TrimmedValue>{vessel?.district
                  ? <>{vessel?.district} {vessel?.districtCode ? <>({vessel?.districtCode})</> : ''}</>
                  : <NoValue>-</NoValue>}</TrimmedValue>
              </Field>
              <Field>
                <Key>Port d&apos;attache</Key>
                <TrimmedValue>{vessel?.registryPort ? vessel?.registryPort : <NoValue>-</NoValue>}</TrimmedValue>
              </Field>
            </TableBody>
          </Fields>
          <Fields>
            <TableBody>
              <Field>
                <Key>Taille</Key>
                <Value>
                  {vessel?.length ? vessel?.length : <NoValue>-</NoValue>} x {vessel?.width
                    ? vessel?.width
                    : <NoValue>-</NoValue>}
                </Value>
              </Field>
              <Field>
                <Key>Jauge</Key>
                <Value>{vessel?.gauge ? <>{vessel?.gauge} GT</> : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Moteur</Key>
                <Value>{vessel?.power ? <>{vessel?.power} kW</> : <NoValue>-</NoValue>}</Value>
              </Field>
            </TableBody>
          </Fields>
        </Zone>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Type de navire</Key>
                <Value>{vessel?.vesselType ? vessel?.vesselType : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Catégorie de navigation</Key>
                <Value>{vessel?.sailingCategory ? vessel?.sailingCategory : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Genre de navigation</Key>
                <Value>{vessel?.sailingType ? vessel?.sailingType : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key/>
              </Field>
              <Field>
                <Key>Engins de pêche déclarés (PME)</Key>
                <Value data-cy={'vessel-identity-gears'}>
                  {
                    vesselGears
                      ? vesselGears.map(gear => {
                        return gear.name
                          ? <ValueWithLineBreak key={gear.code}>{gear.name} ({gear.code})</ValueWithLineBreak>
                          : <ValueWithLineBreak key={gear.code}>{gear.code}</ValueWithLineBreak>
                      })
                      : <NoValue>-</NoValue>
                  }
                </Value>
              </Field>
              <Field>
                <Key/>
              </Field>
            </TableBody>
          </Fields>
        </Zone>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Permis de navigation</Key>
                <Value>
                  {
                    vessel?.navigationLicenceExpirationDate
                      ? <>
                        Exp le {showLicenceExpirationDate(vessel?.navigationLicenceExpirationDate)}
                        {new Date(vessel?.navigationLicenceExpirationDate) >= Date.now()
                          ? <LicenceActive/>
                          : <LicenceExpired/>}
                      </>
                      : <NoValue>-</NoValue>
                  }

                </Value>
              </Field>
              <Field>
                <Key>Coordonnées propriétaire</Key>
                <Value>
                  <PersonalData>
                    {vessel?.proprietorName
                      ? <>
                        {vessel?.proprietorName}
                        <span>{vessel?.proprietorPhones ? <><br/>{vessel?.proprietorPhones.join(', ')}</> : ''}</span>
                        {vessel?.proprietorEmails ? <><br/>{vessel?.proprietorEmails.join(', ')}</> : ''}
                      </>
                      : <NoPersonalData>-</NoPersonalData>
                    }
                  </PersonalData>
                </Value>
              </Field>
              <Field>
                <Key>Coordonnées armateur</Key>
                <Value>
                  <PersonalData>
                    {vessel?.operatorName
                      ? <>
                        {vessel?.operatorName}
                        <span>{vessel?.operatorPhones ? <><br/>{vessel?.operatorPhones.join(', ')}</> : ''}</span>
                        {vessel?.operatorEmail ? <><br/>{vessel?.operatorEmail}</> : ''}
                      </>
                      : <NoPersonalData>-</NoPersonalData>
                    }
                  </PersonalData>
                </Value>
              </Field>
              <Field>
                <Key>Contact navire</Key>
                <Value>
                  <PersonalData>
                    {vessel?.vesselPhones || vessel?.vesselEmails
                      ? <>
                        {vessel?.vesselPhones ? <>{vessel?.vesselPhones.join(', ')}<br/></> : ''}
                        {vessel?.vesselEmails ? <>{vessel?.vesselEmails.join(', ')}</> : ''}
                      </>
                      : <NoPersonalData>-</NoPersonalData>
                    }
                  </PersonalData>
                </Value>
              </Field>
            </TableBody>
          </Fields>
        </Zone>
      </Body>
    : <FingerprintSpinner color={COLORS.charcoal} className={'radar'} size={100}/>
  )
}

const ValueWithLineBreak = styled.div`
  color: ${COLORS.gunMetal};
  padding: 2px 5px 5px 0;
  line-height: normal;
  font-size: 13px;
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
`

const LicenceActive = styled.span`
  height: 8px;
  margin-left: 5px;
  width: 8px;
  background-color: #8CC61F;
  border-radius: 50%;
  display: inline-block;
`

const LicenceExpired = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #E1000F;
  border-radius: 50%;
  display: inline-block;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
`

const Fields = styled.table`
  padding: 10px 5px 5px 20px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const TrimmedValue = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 120px;
  font-weight: 500;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

const NoPersonalData = styled.div`
  color: ${COLORS.slateGray};
  font-weight: 300;
`

const PersonalData = styled.div`
  line-height: inherit;
  font-size: 13px !important;
  margin-top: -5px;
`

export default VesselIdentity
