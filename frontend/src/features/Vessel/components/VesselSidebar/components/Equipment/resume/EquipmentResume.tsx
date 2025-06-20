import { SidebarLoadMoreYears } from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { FlatKeyValue } from '@features/Vessel/components/VesselSidebar/components/common/FlatKeyValue'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, FingerprintLoader, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { BeaconMalfunctionsResume } from './BeaconMalfunctionsResume'
import { CurrentBeaconMalfunction } from './CurrentBeaconMalfunction'
import { YearsToBeaconMalfunctionList } from './YearsToBeaconMalfunctionList'
import { useIsSuperUser } from '../../../../../../../auth/hooks/useIsSuperUser'
import { setVesselBeaconMalfunctionsFromDate } from '../../../../../../../domain/shared_slices/BeaconMalfunction'
import { getDateTime } from '../../../../../../../utils'
import { getYearsToBeaconMalfunctions } from '../../../../../../BeaconMalfunction/utils'

import type { Promisable } from 'type-fest'

type BeaconMalfunctionsResumeAndHistoryProps = {
  setIsCurrentBeaconMalfunctionDetails: (isCurrentBeaconMalfunctionDetails: boolean) => Promisable<void>
}
export function EquipmentResume({ setIsCurrentBeaconMalfunctionDetails }: BeaconMalfunctionsResumeAndHistoryProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()

  const loadingVesselBeaconMalfunctions = useMainAppSelector(
    state => state.beaconMalfunction.loadingVesselBeaconMalfunctions
  )
  const vesselBeaconMalfunctionsFromDate = useMainAppSelector(
    state => state.beaconMalfunction.vesselBeaconMalfunctionsFromDate
  )
  const vesselBeaconMalfunctionsResumeAndHistory = useMainAppSelector(
    state => state.beaconMalfunction.vesselBeaconMalfunctionsResumeAndHistory
  )
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)

  const yearsToBeaconMalfunctions = useMemo(() => {
    if (!vesselBeaconMalfunctionsResumeAndHistory?.history) {
      return {}
    }

    return getYearsToBeaconMalfunctions(
      vesselBeaconMalfunctionsFromDate,
      vesselBeaconMalfunctionsResumeAndHistory.history
    )
  }, [vesselBeaconMalfunctionsResumeAndHistory?.history, vesselBeaconMalfunctionsFromDate])

  const seeMore = () => {
    const nextDate = new Date(vesselBeaconMalfunctionsFromDate.getTime())
    nextDate.setMonth(nextDate.getMonth() - 12)

    dispatch(setVesselBeaconMalfunctionsFromDate(nextDate))
  }

  const beaconType = useMemo(() => {
    if (selectedVessel?.beacon?.isCoastal === undefined) {
      return undefined
    }

    return selectedVessel.beacon.isCoastal ? 'Côtier' : 'Satellitaire'
  }, [selectedVessel?.beacon?.isCoastal])

  return (
    <>
      {!loadingVesselBeaconMalfunctions ? (
        <Body data-cy="vessel-equipments">
          <Columns>
            <StyledFlatKeyValue
              column={[
                {
                  key: 'N° balise VMS',
                  value: selectedVessel?.beacon?.beaconNumber
                },
                {
                  key: 'Type de balise',
                  value: beaconType
                },
                {
                  hasMultipleLines: true,
                  key: 'Date loggage',
                  value:
                    !!selectedVessel?.beacon?.loggingDatetimeUtc &&
                    getDateTime(selectedVessel.beacon.loggingDatetimeUtc)
                }
              ]}
              keyWidth={110}
              valueEllipsisedForWidth={110}
            />
            <StyledFlatKeyValue
              column={[
                {
                  key: 'Statut JPE',
                  value: selectedVessel?.logbookEquipmentStatus
                },
                {
                  key: 'Logiciel JPE',
                  value: selectedVessel?.logbookSoftware ?? '-'
                },
                {
                  key: 'E-Sacapt',
                  value: selectedVessel?.hasLogbookEsacapt ? 'Oui' : 'Non'
                },
                {
                  key: 'VisioCaptures',
                  value: selectedVessel?.hasVisioCaptures ? 'Oui' : 'Non'
                }
              ]}
              valueEllipsisedForWidth={110}
            />
          </Columns>
          {isSuperUser && (
            <>
              <CurrentBeaconMalfunction
                currentBeaconMalfunctionWithDetails={vesselBeaconMalfunctionsResumeAndHistory?.current}
                setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
              />
              <BeaconMalfunctionsResume
                vesselBeaconMalfunctionsResume={vesselBeaconMalfunctionsResumeAndHistory?.resume}
              />
              <YearsToBeaconMalfunctionList
                setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
                vesselBeaconMalfunctionsFromDate={vesselBeaconMalfunctionsFromDate}
                yearsToBeaconMalfunctions={yearsToBeaconMalfunctions}
              />
              <SidebarLoadMoreYears>
                <Button accent={Accent.SECONDARY} onClick={seeMore}>
                  Afficher plus d&apos;avaries
                </Button>
              </SidebarLoadMoreYears>
            </>
          )}
        </Body>
      ) : (
        <FingerprintLoader className="radar" color={THEME.color.charcoal} />
      )}
    </>
  )
}

const Columns = styled.div`
  display: flex;
  margin-bottom: 10px;
`

const StyledFlatKeyValue = styled(FlatKeyValue)`
  width: 240px;
`

const Body = styled.div``
