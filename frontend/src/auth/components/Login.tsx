import { Button } from '@mtes-mct/monitor-ui'
import { type AuthContextProps, useAuth } from 'react-oidc-context'
import { Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'

import { ROUTER_PATHS } from '../../paths'
import { LoadingSpinnerWall } from '../../ui/LoadingSpinnerWall'
import { getOIDCConfig } from '../getOIDCConfig'
import { useGetCurrentUserAuthorizationQueryOverride } from '../hooks/useGetCurrentUserAuthorizationQueryOverride'

export function Login() {
  const { IS_OIDC_ENABLED } = getOIDCConfig()
  // `| undefined` because it's undefined if the OIDC is disabled which is the case for Cypress tests
  const auth = useAuth() as AuthContextProps | undefined
  const { isLoading, isSuccess } = useGetCurrentUserAuthorizationQueryOverride({
    skip: !auth?.isAuthenticated
  })

  if (!IS_OIDC_ENABLED) {
    return <div>OIDC is disabled</div>
  }

  if (auth?.isAuthenticated && isSuccess) {
    return <Navigate to={ROUTER_PATHS.home} />
  }

  switch (auth?.activeNavigator) {
    case 'signinSilent':
      return (
        <LoginBackground>
          <div>
            <LoadingSpinnerWall isVesselShowed />
            Connexion en cours...
          </div>
        </LoginBackground>
      )
    case 'signoutRedirect':
      return (
        <LoginBackground>
          <div>Déconnexion en cours...</div>
        </LoginBackground>
      )
    default:
      break
  }

  return (
    <LoginBackground>
      {auth?.isLoading || isLoading ? (
        <LoadingSpinnerWall isVesselShowed />
      ) : (
        <div>
          <Head>MonitorFish</Head>

          <Button onClick={() => auth?.signinRedirect()} title="Se connecter avec Cerbère">
            Se connecter avec Cerbère
          </Button>
          <Warning>
            <WarningHeader>Vous accédez à une application réservée aux services de l&apos;Etat.</WarningHeader>
            <br />
            <br />
            Rappels législatifs : <br />
            Conformément à l&apos;art. L121-6 du Code de la fonction publique : &quot;l&apos;agent public est tenu au
            secret professionnel dans le respect des articles 226-13 et 226-14 du code pénal&quot;. Conformément à
            l&apos;article 226-13 du Code pénal : &quot;La révélation d&apos;une information à caractère secret par une
            personne qui en est dépositaire est punie d&apos;un an d&apos;emprisonnement et de 15 000&euro;
            d&apos;amende&quot;.
          </Warning>
          <Footer>Centre National de Surveillance des Pêches (CNSP) – CROSS Etel</Footer>
        </div>
      )}
      {auth?.error && <div>Oops... {auth.error?.message}</div>}
      <ToastContainer />
    </LoginBackground>
  )
}

const Warning = styled.p`
  max-width: 600px;
  font-style: italic;
  bottom: 120px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: #8aa4bd;
  padding: 32px;
`

const WarningHeader = styled.span`
  font-weight: 900;
  font-size: 16px;
`

const Head = styled.div`
  margin-bottom: 16px;
  font-size: 32px;
  font-weight: 800;
  color: ${p => p.theme.color.gunMetal};
`

const Footer = styled.div`
  bottom: 16px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: #8aa4bd;
  padding: 8px;
`

export const LoginBackground = styled.div`
  font-size: 13px;
  text-align: center;
  width: 100vw;
  padding-top: 40vh;
  height: 100vh;
  overflow: hidden;

  background: url('landing_background.png') no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
`
