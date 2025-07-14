import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'

import { Wrapper } from './Login'

export function Register() {
  return (
    <Wrapper>
      <Text>
        Merci de contacter{' '}
        <a href="mailto:cnsp-france@developpement-durable.gouv.fr?subject=Création de compte MonitorFish">
          cnsp-france@developpement-durable.gouv.fr
        </a>{' '}
        pour accéder à cette page.
      </Text>
      <ToastContainer />
    </Wrapper>
  )
}

const Text = styled.span`
  margin-top: 40vh;
`
