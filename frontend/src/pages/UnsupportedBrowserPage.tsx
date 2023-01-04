import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'

import { ReactComponent as AlertSVG } from '../features/icons/Picto_alerte.svg'

export function UnsupportedBrowserPage() {
  return (
    <Wrapper>
      <Alert>
        <AlertSVG />
        <br />
        <Text>
          <Title>
            Cette version de votre navigateur est trop ancienne, MonitorFish ne peut pas fonctionner correctement.
          </Title>
          <p>
            Merci d’utiliser une version de Firefox supérieure à la version 62, ou une version de Chrome supérieure à la
            version 69.
          </p>
        </Text>
      </Alert>

      <ToastContainer />
    </Wrapper>
  )
}

const Text = styled.span`
  width: 700px;
  display: inline-block;
`

const Title = styled.span`
  margin-top: 20px;
  margin-bottom: 15px;
  display: inline-block;
  font: normal normal bold 28px/31px Marianne;
`

const Alert = styled.div`
  text-align: center;
  font: normal normal medium 22px/31px Marianne;
  letter-spacing: 0px;
  color: #05065f;
  background: #cad2d3 0% 0% no-repeat padding-box;
  height: 100vh;
  width: 100vw;
  padding-top: 35vh;
`

const Wrapper = styled.div`
  font-size: 13px;
  text-align: center;
  width: 100vw;
  overflow: hidden;
`
