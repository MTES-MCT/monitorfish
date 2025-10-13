import styled from 'styled-components'

import { LoginBackground } from './Login'

export function Register() {
  return (
    <LoginBackground>
      <Text>
        Merci de contacter{' '}
        <a href="mailto:cnsp-france@developpement-durable.gouv.fr?subject=Création de compte MonitorFish">
          cnsp-france@developpement-durable.gouv.fr
        </a>{' '}
        pour accéder à cette page.
      </Text>
    </LoginBackground>
  )
}

const Text = styled.span`
  margin-top: 40vh;
`
