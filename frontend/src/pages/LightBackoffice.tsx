import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'

import { LoadOffline } from '../features/LoadOffline/components/LoadOffline'
import { registerServiceWorker } from '../workers/registerServiceWorker'

export function LightBackoffice() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <Wrapper>
      <LoadOffline />
      <ToastContainer />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  color: white;
  font-size: 13px;
  text-align: center;
  width: 100vw;
  padding-top: 35vh;
  height: 100vh;
  overflow: hidden;
`
