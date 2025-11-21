import { FlatKeyValue } from '@features/Vessel/components/VesselSidebar/components/common/FlatKeyValue'
import { FlatTwoColumnKeyValue } from '@features/Vessel/components/VesselSidebar/components/common/FlatTwoColumnKeyValue'
import { VesselContactToUpdateForm } from '@features/Vessel/components/VesselSidebar/components/VesselContactToUpdateForm'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, FingerprintLoader, THEME } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { useMemo } from 'react'
import styled from 'styled-components'

import { getDate } from '../../../../../utils'

export function VesselIdentity() {
  const loadingVessel = useMainAppSelector(state => state.vessel.loadingVessel)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
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
      <FlatKeyValue
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
      <FlatKeyValue
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
      <FlatKeyValue
        column={[
          {
            key: 'Organisation de producteurs',
            value: selectedVessel?.producerOrganization
              ? `${selectedVessel?.producerOrganization?.organizationName} (depuis le ${selectedVessel?.producerOrganization?.joiningDate})`
              : undefined
          },
          {
            key: 'Coordonnées propriétaire',
            value: (!!selectedVessel?.proprietorName ||
              !(selectedVessel?.proprietorPhones?.length === 0) ||
              !(selectedVessel?.proprietorEmails?.length === 0)) && (
              <>
                <ValueWithLineBreak>{selectedVessel?.proprietorName}</ValueWithLineBreak>
                {selectedVessel?.proprietorPhones?.map(proprietorPhone => (
                  <ValueWithLineBreak>{proprietorPhone}</ValueWithLineBreak>
                ))}
                {!!selectedVessel?.proprietorEmails && (
                  <ValueWithLineBreak>{selectedVessel?.proprietorEmails.join(', ')}</ValueWithLineBreak>
                )}
              </>
            )
          },
          {
            key: 'Coordonnées armateur',
            value: (!!selectedVessel?.operatorName ||
              !(selectedVessel?.operatorPhones?.length === 0) ||
              !!selectedVessel?.operatorEmail) && (
              <>
                <ValueWithLineBreak>{selectedVessel?.operatorName}</ValueWithLineBreak>
                {selectedVessel?.operatorPhones?.map(operatorPhone => (
                  <ValueWithLineBreak>{operatorPhone}</ValueWithLineBreak>
                ))}
                {!!selectedVessel?.operatorEmail && (
                  <ValueWithLineBreak>{selectedVessel?.operatorEmail}</ValueWithLineBreak>
                )}
              </>
            )
          },
          {
            hasMultipleLines: true,
            key: 'Coordonnées patron',
            value: (!!selectedVessel?.bossName || !!selectedVessel?.bossAddress) && (
              <>
                {!!selectedVessel?.bossName && <ValueWithLineBreak>{selectedVessel?.bossName}</ValueWithLineBreak>}
                {!!selectedVessel?.bossAddress && (
                  <ValueWithLineBreak>{selectedVessel?.bossAddress}</ValueWithLineBreak>
                )}
              </>
            )
          },
          {
            hasMultipleLines: true,
            key: 'Contact navire',
            value: (!(selectedVessel?.vesselPhones?.length === 0) || !(selectedVessel?.vesselEmails.length === 0)) && (
              <>
                {selectedVessel?.vesselPhones?.map(vesselPhone => (
                  <ValueWithLineBreak>{vesselPhone}</ValueWithLineBreak>
                ))}
                {selectedVessel?.vesselEmails?.map(vesselEmail => (
                  <ValueWithLineBreak>{vesselEmail}</ValueWithLineBreak>
                ))}
              </>
            )
          }
        ]}
        keyWidth={200}
      />
      <VesselContactToUpdateForm vesselId={selectedVessel?.vesselId} />
    </Body>
  ) : (
    <FingerprintLoader className="radar" color={THEME.color.charcoal} />
  )
}

const ValueWithLineBreak = styled.div`
  font-size: 13px;
`

const Body = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;

  > *:not(:last-child):not(:first-child) {
    margin-top: 8px;
  }
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
