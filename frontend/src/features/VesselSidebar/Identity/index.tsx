import { getDate } from '@utils/getDate'
import countries from 'i18n-iso-countries'
import { useEffect, useMemo } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { showVessel } from '../../../domain/use_cases/vessel/showVessel'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

export function Identity() {
  const dispatch = useMainAppDispatch()
  const { loadingVessel, selectedVessel, selectedVesselIdentity, selectedVesselPositions } = useMainAppSelector(
    state => state.vessel
  )
  const gears = useMainAppSelector(state => state.gear.gears)

  const lastPosition = useMemo(() => {
    if (!selectedVesselPositions?.length) {
      return undefined
    }

    return selectedVesselPositions[selectedVesselPositions.length - 1]
  }, [selectedVesselPositions])

  const showLicenceExpirationDate = licenceExpirationDate => getDate(licenceExpirationDate)

  const vesselGears = useMemo(() => {
    if (!gears || !selectedVessel?.declaredFishingGears) {
      return []
    }

    return selectedVessel.declaredFishingGears.map(declaredGearCode => {
      const foundGear = gears.find(gear => gear.code === declaredGearCode)

      return {
        code: declaredGearCode,
        name: foundGear ? foundGear.name : null
      }
    })
  }, [gears, selectedVessel])

  useEffect(() => {
    if (!lastPosition && !selectedVessel && !loadingVessel && selectedVesselIdentity) {
      dispatch(showVessel(selectedVesselIdentity, false, true))
    }
  }, [dispatch, lastPosition, selectedVessel, loadingVessel, selectedVesselIdentity])

  function getVesselOrLastPositionProperty(propertyName) {
    if (selectedVessel && selectedVessel[propertyName]) {
      return selectedVessel[propertyName]
    }
    if (lastPosition && lastPosition[propertyName]) {
      return lastPosition[propertyName]
    }

    return <NoValue>-</NoValue>
  }

  return !loadingVessel ? (
    <Body>
      <Zone>
        <Fields>
          <TableBody>
            <Field>
              <Key>CFR</Key>
              <Value>{getVesselOrLastPositionProperty('internalReferenceNumber')}</Value>
            </Field>
            <Field>
              <Key>MMSI</Key>
              <Value>{getVesselOrLastPositionProperty('mmsi')}</Value>
            </Field>
            <Field>
              <Key>Balise n°</Key>
              <Value>{getVesselOrLastPositionProperty('beaconNumber')}</Value>
            </Field>
          </TableBody>
        </Fields>
        <Fields>
          <TableBody>
            <Field>
              <Key>Marquage ext.</Key>
              <Value>{getVesselOrLastPositionProperty('externalReferenceNumber')}</Value>
            </Field>
            <Field>
              <Key>Call Sign (IRCS)</Key>
              <Value>{getVesselOrLastPositionProperty('ircs')}</Value>
            </Field>
            <Field>
              <Key />
              <Value />
            </Field>
          </TableBody>
        </Fields>
      </Zone>
      <Zone>
        <Fields>
          <TableBody>
            <Field>
              <Key>Nationalité</Key>
              <TrimmedValue>
                {selectedVessel?.flagState && countries.getName(selectedVessel?.flagState, 'fr') ? (
                  countries.getName(selectedVessel?.flagState, 'fr')
                ) : (
                  <NoValue>-</NoValue>
                )}
              </TrimmedValue>
            </Field>
            <Field>
              <Key>Quartier</Key>
              <TrimmedValue>
                {selectedVessel?.district ? (
                  <>
                    {selectedVessel?.district}{' '}
                    {selectedVessel?.districtCode ? <>({selectedVessel?.districtCode})</> : ''}
                  </>
                ) : (
                  <NoValue>-</NoValue>
                )}
              </TrimmedValue>
            </Field>
            <Field>
              <Key>Port d&apos;attache</Key>
              <TrimmedValue>
                {selectedVessel?.registryPort ? selectedVessel?.registryPort : <NoValue>-</NoValue>}
              </TrimmedValue>
            </Field>
          </TableBody>
        </Fields>
        <Fields>
          <TableBody>
            <Field>
              <Key>Taille</Key>
              <Value>
                {selectedVessel?.length ? selectedVessel?.length : <NoValue>-</NoValue>} x{' '}
                {selectedVessel?.width ? selectedVessel?.width : <NoValue>-</NoValue>}
              </Value>
            </Field>
            <Field>
              <Key>Jauge</Key>
              <Value>{selectedVessel?.gauge ? <>{selectedVessel?.gauge} GT</> : <NoValue>-</NoValue>}</Value>
            </Field>
            <Field>
              <Key>Moteur</Key>
              <Value>{selectedVessel?.power ? <>{selectedVessel?.power} kW</> : <NoValue>-</NoValue>}</Value>
            </Field>
          </TableBody>
        </Fields>
      </Zone>
      <Zone>
        <Fields>
          <TableBody>
            <Field>
              <Key>Type de navire</Key>
              <Value>{selectedVessel?.vesselType ? selectedVessel?.vesselType : <NoValue>-</NoValue>}</Value>
            </Field>
            <Field>
              <Key>Catégorie de navigation</Key>
              <Value>{selectedVessel?.sailingCategory ? selectedVessel?.sailingCategory : <NoValue>-</NoValue>}</Value>
            </Field>
            <Field>
              <Key>Genre de navigation</Key>
              <Value>{selectedVessel?.sailingType ? selectedVessel?.sailingType : <NoValue>-</NoValue>}</Value>
            </Field>
            <Field>
              <Key />
            </Field>
            <Field>
              <Key>Engins de pêche déclarés (PME)</Key>
              <Value data-cy="vessel-identity-gears">
                {vesselGears ? (
                  vesselGears.map(gear =>
                    gear.name ? (
                      <ValueWithLineBreak key={gear.code}>
                        {gear.name} ({gear.code})
                      </ValueWithLineBreak>
                    ) : (
                      <ValueWithLineBreak key={gear.code}>{gear.code}</ValueWithLineBreak>
                    )
                  )
                ) : (
                  <NoValue>-</NoValue>
                )}
              </Value>
            </Field>
            <Field>
              <Key />
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
                {selectedVessel?.navigationLicenceExpirationDate ? (
                  <>
                    Exp le {showLicenceExpirationDate(selectedVessel?.navigationLicenceExpirationDate)}
                    {new Date(selectedVessel?.navigationLicenceExpirationDate).getTime() >= Date.now() ? (
                      <LicenceActive />
                    ) : (
                      <LicenceExpired />
                    )}
                  </>
                ) : (
                  <NoValue>-</NoValue>
                )}
              </Value>
            </Field>
            <Field>
              <Key>Coordonnées propriétaire</Key>
              <Value>
                <PersonalData>
                  {selectedVessel?.proprietorName ? (
                    <>
                      {selectedVessel?.proprietorName}
                      <span>
                        {selectedVessel?.proprietorPhones ? (
                          <>
                            <br />
                            {selectedVessel?.proprietorPhones.join(', ')}
                          </>
                        ) : (
                          ''
                        )}
                      </span>
                      {selectedVessel?.proprietorEmails ? (
                        <>
                          <br />
                          {selectedVessel?.proprietorEmails.join(', ')}
                        </>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    <NoPersonalData>-</NoPersonalData>
                  )}
                </PersonalData>
              </Value>
            </Field>
            <Field>
              <Key>Coordonnées armateur</Key>
              <Value>
                <PersonalData>
                  {selectedVessel?.operatorName ? (
                    <>
                      {selectedVessel?.operatorName}
                      <span>
                        {selectedVessel?.operatorPhones ? (
                          <>
                            <br />
                            {selectedVessel?.operatorPhones.join(', ')}
                          </>
                        ) : (
                          ''
                        )}
                      </span>
                      {selectedVessel?.operatorEmails ? (
                        <>
                          <br />
                          {selectedVessel?.operatorEmails.join(', ')}
                        </>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    <NoPersonalData>-</NoPersonalData>
                  )}
                </PersonalData>
              </Value>
            </Field>
            <Field>
              <Key>Contact navire</Key>
              <Value>
                <PersonalData>
                  {selectedVessel?.vesselPhones ?? selectedVessel?.vesselEmails ? (
                    <>
                      {selectedVessel?.vesselPhones ? (
                        <>
                          {selectedVessel?.vesselPhones.join(', ')}
                          <br />
                        </>
                      ) : (
                        ''
                      )}
                      {selectedVessel?.vesselEmails ? <>{selectedVessel?.vesselEmails.join(', ')}</> : ''}
                    </>
                  ) : (
                    <NoPersonalData>-</NoPersonalData>
                  )}
                </PersonalData>
              </Value>
            </Field>
          </TableBody>
        </Fields>
      </Zone>
    </Body>
  ) : (
    <FingerprintSpinner className="radar" color={COLORS.charcoal} size={100} />
  )
}

const ValueWithLineBreak = styled.div`
  color: ${p => p.theme.color.gunMetal};
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
  background-color: #8cc61f;
  border-radius: 50%;
  display: inline-block;
`

const LicenceExpired = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #e1000f;
  border-radius: 50%;
  display: inline-block;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  background: ${p => p.theme.color.white};
  display: flex;
  flex-wrap: wrap;
  margin: 5px 5px 10px;
  padding: 10px 20px;
  text-align: left;

  > table:not(:first-child) {
    margin-left: 25px;
  }
`

const Fields = styled.table`
  padding: 10px 5px 5px 20px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${p => p.theme.color.slateGray};
  flex: initial;
  display: inline-block;
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
  color: ${p => p.theme.color.gunMetal};
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
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`

const NoPersonalData = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
`

const PersonalData = styled.div`
  line-height: inherit;
  font-size: 13px !important;
  margin-top: -5px;
`
