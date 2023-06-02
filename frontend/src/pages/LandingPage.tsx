import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'

import { LoadingSpinnerWall } from '../ui/LoadingSpinnerWall'

export type LandingPageProps = {
  hasInsufficientRights?: boolean
}
export function LandingPage({ hasInsufficientRights }: LandingPageProps) {
  return (
    <Wrapper>
      {hasInsufficientRights ? (
        <>
          Merci de contacter{' '}
          <a href="mailto:monitor@beta.gouv.fr?subject=Création de compte MonitorFish">monitor@beta.gouv.fr</a> pour
          accéder à MonitorFish avec Cerbère.
        </>
      ) : (
        <LoadingSpinnerWall isVesselShowed />
      )}
      <ToastContainer />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  color: white;
  font-size: 13px;
  text-align: center;
  width: 100vw;
  padding-top: 43vh;
  height: 100vh;
  overflow: hidden;

  background: url('landing_background.png') no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
`
