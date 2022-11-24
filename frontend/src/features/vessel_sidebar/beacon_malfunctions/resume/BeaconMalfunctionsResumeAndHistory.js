import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { useDispatch, useSelector } from 'react-redux'
import { FingerprintSpinner } from 'react-epic-spinners'
import { setVesselBeaconMalfunctionsFromDate } from '../../../../domain/shared_slices/BeaconMalfunction'
import { YearsToBeaconMalfunctionList } from './YearsToBeaconMalfunctionList'
import BeaconMalfunctionsResume from './BeaconMalfunctionsResume'
import CurrentBeaconMalfunction from './CurrentBeaconMalfunction'
import { getYearsToBeaconMalfunctions } from '../../../../domain/entities/beaconMalfunction'

const BeaconMalfunctionsResumeAndHistory = props => {
  const dispatch = useDispatch()
  const {
    setIsCurrentBeaconMalfunctionDetails
  } = props

  const {
    /** @type {VesselBeaconMalfunctionsResumeAndHistory || null} */
    vesselBeaconMalfunctionsResumeAndHistory,
    /** @type {Date} */
    vesselBeaconMalfunctionsFromDate,
    loadingVesselBeaconMalfunctions
  } = useSelector(state => state.beaconMalfunction)

  /** @type {Object.<string, BeaconMalfunctionResumeAndDetails[]>} yearsToBeaconMalfunctions */
  const yearsToBeaconMalfunctions = useMemo(() => {
    let nextYearsToBeaconMalfunctions
    if (vesselBeaconMalfunctionsResumeAndHistory?.history) {
      nextYearsToBeaconMalfunctions = getYearsToBeaconMalfunctions(vesselBeaconMalfunctionsFromDate, vesselBeaconMalfunctionsResumeAndHistory.history)
    }
    return nextYearsToBeaconMalfunctions
  }, [vesselBeaconMalfunctionsResumeAndHistory?.history, vesselBeaconMalfunctionsFromDate])

  function seeMore () {
    const nextDate = new Date(vesselBeaconMalfunctionsFromDate.getTime())
    nextDate.setMonth(nextDate.getMonth() - 12)

    dispatch(setVesselBeaconMalfunctionsFromDate(nextDate))
  }

  return <>
    {
      !loadingVesselBeaconMalfunctions
        ? <Body data-cy={'vessel-malfunctions-resume'}>
          <CurrentBeaconMalfunction
            currentBeaconMalfunctionWithDetails={vesselBeaconMalfunctionsResumeAndHistory?.current}
            setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
          />
          <BeaconMalfunctionsResume vesselBeaconMalfunctionsResume={vesselBeaconMalfunctionsResumeAndHistory?.resume}/>
          <YearsToBeaconMalfunctionList
            yearsToBeaconMalfunctions={yearsToBeaconMalfunctions}
            vesselBeaconMalfunctionsFromDate={vesselBeaconMalfunctionsFromDate}
            setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
          />
          <SeeMoreBackground>
            <SeeMore onClick={seeMore}>
              Afficher plus d&apos;avaries
            </SeeMore>
          </SeeMoreBackground>
        </Body>
        : <FingerprintSpinner color={COLORS.charcoal} className={'radar'} size={100}/>
    }
  </>
}

const SeeMoreBackground = styled.div`
  background: ${COLORS.white};
  margin: 0px 5px 10px 5px;
  padding: 5px 0 5px 0;
`

const SeeMore = styled.div`
  border: 1px solid ${COLORS.charcoal};
  color: ${COLORS.gunMetal};
  padding: 5px 10px 5px 10px;
  width: max-content;
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  user-select: none;
  background: ${COLORS.white};
`

const Body = styled.div`
  padding: 0 5px 1px 5px;
  overflow-x: hidden;
  max-height: 700px;
`

export default BeaconMalfunctionsResumeAndHistory
