import { FlatKeyValue } from '@features/VesselSidebar/common/FlatKeyValue'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { BeaconMalfunctionsResume } from './BeaconMalfunctionsResume'
import { CurrentBeaconMalfunction } from './CurrentBeaconMalfunction'
import { YearsToBeaconMalfunctionList } from './YearsToBeaconMalfunctionList'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { getYearsToBeaconMalfunctions } from '../../../../domain/entities/beaconMalfunction'
import { setVesselBeaconMalfunctionsFromDate } from '../../../../domain/shared_slices/BeaconMalfunction'
import { getDateTime } from '../../../../utils'

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

  return (
    <>
      {!loadingVesselBeaconMalfunctions ? (
        <Body data-cy="vessel-equipments">
          <Columns>
            <StyledFlatKeyValue
              column={[
                {
                  key: 'N° balise VMS',
                  value: selectedVessel?.beacon.beaconNumber
                },
                {
                  key: 'Type de balise',
                  value: selectedVessel?.beacon.isCoastal ? 'Côtier' : 'Satellitaire'
                },
                {
                  key: 'Date de loggage',
                  value:
                    !!selectedVessel?.beacon.loggingDatetimeUtc && getDateTime(selectedVessel.beacon.loggingDatetimeUtc)
                }
              ]}
            />
            <StyledFlatKeyValue
              column={[
                {
                  key: 'Statut JPE',
                  value: selectedVessel?.logbookEquipmentStatus
                },
                {
                  key: 'Équipé e-Sacapt',
                  value: selectedVessel?.hasLogbookEsacapt ? 'Oui' : 'Non'
                },
                {
                  key: 'Équipé VisioCaptures',
                  value: selectedVessel?.hasVisioCaptures ? 'Oui' : 'Non'
                }
              ]}
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
              <SeeMoreBackground>
                <SeeMore onClick={seeMore}>Afficher plus d&apos;avaries</SeeMore>
              </SeeMoreBackground>
            </>
          )}
        </Body>
      ) : (
        <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
      )}
    </>
  )
}

const Columns = styled.div`
  display: flex;
  margin-bottom: 10px;
`

const StyledFlatKeyValue = styled(FlatKeyValue)`
  margin: 5px 5px 0px;
  margin-top: 10px;
  width: 235px;
`

const SeeMoreBackground = styled.div`
  background: ${p => p.theme.color.white};
  margin: 0px 5px 10px 5px;
  padding: 5px 0 5px 0;
`

const SeeMore = styled.div`
  border: 1px solid ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gunMetal};
  padding: 5px 10px 5px 10px;
  width: max-content;
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  user-select: none;
  background: ${p => p.theme.color.white};
`

const Body = styled.div`
  padding: 0 5px 1px 5px;
  overflow-x: hidden;
  max-height: 700px;
`
