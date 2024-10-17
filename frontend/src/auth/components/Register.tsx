import { ToastContainer } from 'react-toastify'

import { LoginBackground } from './Login'

export function Register() {
  return (
    <LoginBackground>
      Merci de contacter{' '}
      <a href="mailto:cnsp-france@developpement-durable.gouv.fr?subject=Création de compte MonitorFish">
        cnsp-france@developpement-durable.gouv.fr
      </a>{' '}
      pour accéder à cette page.
      <ToastContainer />
    </LoginBackground>
  )
}
