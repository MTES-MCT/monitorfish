import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { FlatKeyValue } from '@features/Vessel/components/VesselSidebar/common/FlatKeyValue'
import { FlatTwoColumnKeyValue } from '@features/Vessel/components/VesselSidebar/common/FlatTwoColumnKeyValue'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, THEME } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { showVessel } from '../../../../domain/use_cases/vessel/showVessel'
import { getDate } from '../../../../utils'

export function VesselIdentity() {
  const dispatch = useMainAppDispatch()
  const loadingVessel = useMainAppSelector(state => state.vessel.loadingVessel)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const gears = useMainAppSelector(state => state.gear.gears)

  const lastPosition = useMemo(() => {
    if (!selectedVesselPositions?.length) {
      return undefined
    }

    return selectedVesselPositions[selectedVesselPositions.length - 1]
  }, [selectedVesselPositions])

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

    return undefined
  }

  const isNavigationLicenceExpired = () => {
    if (!selectedVessel?.navigationLicenceExpirationDate) {
      return undefined
    }
    const now = customDayjs()

    return customDayjs(selectedVessel.navigationLicenceExpirationDate).isBefore(now)
  }

  const isNavigationLicenceExtensionDateExpired = () => {
    if (!selectedVessel?.navigationLicenceExtensionDate) {
      return undefined
    }
    const now = customDayjs()

    return customDayjs(selectedVessel.navigationLicenceExtensionDate).isBefore(now)
  }

  return !loadingVessel ? (
    <Body>
      <FlatTwoColumnKeyValue
        firstColumn={[
          {
            key: 'CFR',
            value: getVesselOrLastPositionProperty('internalReferenceNumber')
          },
          {
            key: 'MMSI',
            value: getVesselOrLastPositionProperty('mmsi')
          },
          {
            key: 'Balise n°',
            value: selectedVessel?.beacon?.beaconNumber
          }
        ]}
        secondColumn={[
          {
            key: 'Marquage ext.',
            value: getVesselOrLastPositionProperty('externalReferenceNumber')
          },
          {
            key: 'Call Sign (IRCS)',
            value: getVesselOrLastPositionProperty('ircs')
          }
        ]}
      />
      <FlatTwoColumnKeyValue
        firstColumn={[
          {
            key: 'Nationalité',
            value: selectedVessel?.flagState ? countries.getName(selectedVessel?.flagState, 'fr') : undefined
          },
          {
            key: 'Quartier',
            value: selectedVessel?.district
              ? `${selectedVessel?.district} ${!!selectedVessel?.districtCode && `(${selectedVessel?.districtCode})`}`
              : undefined
          },
          {
            key: "Port d'attache",
            value: selectedVessel?.registryPort
          }
        ]}
        secondColumn={[
          {
            key: 'Taille',
            value: `${selectedVessel?.length ?? '-'} x ${selectedVessel?.width ?? '-'}`
          },
          {
            key: 'Jauge',
            value: selectedVessel?.gauge ? `${selectedVessel?.gauge} GT` : undefined
          },
          {
            key: 'Moteur',
            value: selectedVessel?.power ? `${selectedVessel?.power} kW` : undefined
          }
        ]}
      />
      <StyledFlatKeyValue
        column={[
          {
            key: 'Type de navire',
            value: selectedVessel?.vesselType
          },
          {
            key: 'Catégorie de navigation',
            value: selectedVessel?.sailingCategory
          },
          {
            key: 'Genre de navigation',
            value: selectedVessel?.sailingType
          },
          {
            key: 'Engins de pêche déclarés (PME)',
            value: (
              <>
                {vesselGears?.map(gear =>
                  gear.name ? (
                    <ValueWithLineBreak key={gear.code}>
                      {gear.name} ({gear.code})
                    </ValueWithLineBreak>
                  ) : (
                    <ValueWithLineBreak key={gear.code}>{gear.code}</ValueWithLineBreak>
                  )
                )}
              </>
            )
          }
        ]}
        keyWidth={200}
      />
      <StyledFlatKeyValue
        column={[
          {
            key: 'Etat du permis de navigation',
            value: selectedVessel?.navigationLicenceStatus
          },
          {
            key: "Date d'expiration",
            value: selectedVessel?.navigationLicenceExpirationDate ? (
              <>
                {getDate(selectedVessel?.navigationLicenceExpirationDate)}
                {selectedVessel?.navigationLicenceExtensionDate === undefined &&
                  isNavigationLicenceExpired() === true && (
                    <>
                      {' '}
                      <LicenceExpired />
                    </>
                  )}
                {selectedVessel?.navigationLicenceExtensionDate === undefined &&
                  isNavigationLicenceExpired() === false && (
                    <>
                      {' '}
                      <LicenceActive />
                    </>
                  )}
              </>
            ) : undefined
          },
          {
            key: 'Date de prorogation',
            value: selectedVessel?.navigationLicenceExtensionDate ? (
              <>
                {getDate(selectedVessel?.navigationLicenceExtensionDate)}
                {isNavigationLicenceExtensionDateExpired() === true && (
                  <>
                    {' '}
                    <LicenceExpired />
                  </>
                )}
                {isNavigationLicenceExtensionDateExpired() === false && (
                  <>
                    {' '}
                    <LicenceActive />
                  </>
                )}
              </>
            ) : undefined
          }
        ]}
        keyWidth={200}
      />
      <StyledFlatKeyValue
        column={[
          {
            key: 'Organisation de producteurs',
            value: selectedVessel?.producerOrganization
              ? `${selectedVessel?.producerOrganization?.organizationName} (depuis le ${selectedVessel?.producerOrganization?.joiningDate})`
              : undefined
          },
          {
            key: 'Coordonnées propriétaire',
            value: (
              <>
                <ValueWithLineBreak>{selectedVessel?.proprietorName}</ValueWithLineBreak>
                {!!selectedVessel?.proprietorPhones && (
                  <ValueWithLineBreak>{selectedVessel?.proprietorPhones.join(', ')}</ValueWithLineBreak>
                )}
                {!!selectedVessel?.proprietorEmails && (
                  <ValueWithLineBreak>{selectedVessel?.proprietorEmails.join(', ')}</ValueWithLineBreak>
                )}
              </>
            )
          },
          {
            key: 'Coordonnées armateur',
            value: (
              <>
                <ValueWithLineBreak>{selectedVessel?.operatorName}</ValueWithLineBreak>
                {!!selectedVessel?.operatorPhones && (
                  <ValueWithLineBreak>{selectedVessel?.operatorPhones.join(', ')}</ValueWithLineBreak>
                )}
                {!!selectedVessel?.operatorEmail && (
                  <ValueWithLineBreak>{selectedVessel?.operatorEmail}</ValueWithLineBreak>
                )}
              </>
            )
          },
          {
            hasMultipleLines: true,
            key: 'Contact navire',
            value: (
              <>
                {!!selectedVessel?.vesselPhones && (
                  <ValueWithLineBreak>{selectedVessel?.vesselPhones.join(', ')}</ValueWithLineBreak>
                )}
                {!!selectedVessel?.vesselEmails && (
                  <ValueWithLineBreak>{selectedVessel?.vesselEmails.join(', ')}</ValueWithLineBreak>
                )}
              </>
            )
          }
        ]}
        keyWidth={200}
      />
    </Body>
  ) : (
    <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
  )
}

const StyledFlatKeyValue = styled(FlatKeyValue)`
  margin: 10px 5px 0;
  width: 480px;
`

const ValueWithLineBreak = styled.div`
  font-size: 13px;
`

const Body = styled.div`
  padding: 5px 5px 10px 5px;
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
