import { useMemo } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { BeaconMalfunctionsResume } from './BeaconMalfunctionsResume'
import { CurrentBeaconMalfunction } from './CurrentBeaconMalfunction'
import { YearsToBeaconMalfunctionList } from './YearsToBeaconMalfunctionList'
import { COLORS } from '../../../../constants/constants'
import { getYearsToBeaconMalfunctions } from '../../../../domain/entities/beaconMalfunction'
import { setVesselBeaconMalfunctionsFromDate } from '../../../../domain/shared_slices/BeaconMalfunction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'

import type { Promisable } from 'type-fest'

type BeaconMalfunctionsResumeAndHistoryProps = {
  setIsCurrentBeaconMalfunctionDetails: (isCurrentBeaconMalfunctionDetails: boolean) => Promisable<void>
}
export function BeaconMalfunctionsResumeAndHistory({
  setIsCurrentBeaconMalfunctionDetails
}: BeaconMalfunctionsResumeAndHistoryProps) {
  const dispatch = useMainAppDispatch()

  const {
    loadingVesselBeaconMalfunctions,
    vesselBeaconMalfunctionsFromDate,
    vesselBeaconMalfunctionsResumeAndHistory
  } = useMainAppSelector(state => state.beaconMalfunction)

  /** @type {Object.<string, BeaconMalfunctionResumeAndDetails[]>} yearsToBeaconMalfunctions */
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
        <Body data-cy="vessel-malfunctions-resume">
          <CurrentBeaconMalfunction
            currentBeaconMalfunctionWithDetails={vesselBeaconMalfunctionsResumeAndHistory?.current}
            setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
          />
          <BeaconMalfunctionsResume vesselBeaconMalfunctionsResume={vesselBeaconMalfunctionsResumeAndHistory?.resume} />
          <YearsToBeaconMalfunctionList
            setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
            vesselBeaconMalfunctionsFromDate={vesselBeaconMalfunctionsFromDate}
            yearsToBeaconMalfunctions={yearsToBeaconMalfunctions}
          />
          <SeeMoreBackground>
            <SeeMore onClick={seeMore}>Afficher plus d&apos;avaries</SeeMore>
          </SeeMoreBackground>
        </Body>
      ) : (
        <FingerprintSpinner className="radar" color={COLORS.charcoal} size={100} />
      )}
    </>
  )
}

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