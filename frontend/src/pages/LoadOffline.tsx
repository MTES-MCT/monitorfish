import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { Progress } from 'rsuite'
import styled from 'styled-components'

import { CACHED_REQUEST_SIZE } from '../workers/constants'
import { useGetServiceWorker } from '../workers/hooks/useGetServiceWorker'
import { registerServiceWorker } from '../workers/registerServiceWorker'
import { fetchAllByChunk, getListOfPath } from '../workers/utils'

const BYTE_TO_MEGA_BYTE_FACTOR = 0.000001
const MAX_LOADED_REQUESTS = 14724
const INTERVAL_REFRESH_MS = 5000

export function LoadOffline() {
  const { serviceWorker } = useGetServiceWorker()
  const [cachedRequestsLength, setCachedRequestsLength] = useState(0)
  const [usage, setUsage] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const percent = ((cachedRequestsLength * 100) / MAX_LOADED_REQUESTS).toFixed(1)

  useEffect(() => {
    registerServiceWorker()

    getStorage()
    const intervalId = setInterval(() => {
      getStorage()
    }, INTERVAL_REFRESH_MS)

    navigator.serviceWorker.addEventListener('message', async event => {
      if (event.data.type === CACHED_REQUEST_SIZE) {
        setCachedRequestsLength(event.data.data)
      }
    })

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const getStorage = () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage: nextUsage }) => {
        if (nextUsage) {
          setUsage((nextUsage * BYTE_TO_MEGA_BYTE_FACTOR).toFixed(1))
        }
      })
    }
  }

  const downloadAll = async () => {
    const zoomToPaths = getListOfPath()
    const chunkSize = 10

    setIsDownloading(true)
    await fetchAllByChunk(zoomToPaths, chunkSize)
    setIsDownloading(false)
  }

  useEffect(() => {
    if (!serviceWorker) {
      return undefined
    }

    serviceWorker?.postMessage(CACHED_REQUEST_SIZE)
    const intervalId = setInterval(() => {
      serviceWorker?.postMessage(CACHED_REQUEST_SIZE)
    }, INTERVAL_REFRESH_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [serviceWorker])

  const getStatus = () => {
    if (parseInt(percent, 10) > 99) {
      return 'success'
    }

    return 'active'
  }

  return (
    <Wrapper>
      <LoadBox>
        <Title>Préchargement (mode navigation)</Title>
        <p>
          Cette page permet de télécharger les fonds de cartes et les données lourdes de MonitorFish, avant de passer
          sur une connexion Internet satellitaire.
        </p>
        {(isDownloading || parseInt(percent, 10) > 1) && (
          <StyledProgress percent={parseFloat(percent)} status={getStatus()} strokeWidth={10} />
        )}
        {!isDownloading && (
          <StyledButton accent={Accent.PRIMARY} Icon={Icon.Download} onClick={downloadAll}>
            Télécharger
          </StyledButton>
        )}
        {isDownloading && <p>Téléchargement en cours</p>}
        {parseInt(percent, 10) > 95 && <p>Toutes les données ont été chargées.</p>}
      </LoadBox>
      {cachedRequestsLength} tuiles sauvegardées (utilisation de {usage} MB)
      <br />
      <ToastContainer />
    </Wrapper>
  )
}

const StyledButton = styled(Button)`
  margin-top: 12px;
`

const Title = styled.h1`
  font-size: 20px;
  margin-bottom: 24px;

  .Element-IconBox {
    vertical-align: sub;
  }
`

const LoadBox = styled.div`
  width: 500px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 24px;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.7);
`

const StyledProgress = styled(Progress.Line)`
  margin-top: 24px;
`

const Wrapper = styled.div`
  color: white;
  font-size: 13px;
  text-align: center;
  width: 100vw;
  padding-top: 35vh;
  height: 100vh;
  overflow: hidden;

  background: url('landing_background.png') no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
`
