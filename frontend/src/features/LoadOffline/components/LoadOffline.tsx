import { Accent, Button, Icon, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useMemo, useState } from 'react'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import { Progress } from 'rsuite'
import styled from 'styled-components'

import { isCypress } from '../../../utils/isCypress'
import { CACHED_REQUEST_SIZE, UPDATE_CACHE } from '../../../workers/constants'
import { useGetServiceWorker } from '../../../workers/hooks/useGetServiceWorker'
import { fetchAllFromServiceWorkerByChunk, getZoomToRequestPaths } from '../utils'

/**
 * This is used to reduce the number of tiles added in cache during the e2e test
 */
const IS_CYPRESS = isCypress()
const CYPRESS_TEST_TOTAL_DOWNLOAD_REQUESTS = 31 // Calculated using `getListOfPath()`

const BYTE_TO_MEGA_BYTE_FACTOR = 0.000001
const TOTAL_DOWNLOAD_REQUESTS = IS_CYPRESS ? CYPRESS_TEST_TOTAL_DOWNLOAD_REQUESTS : 55728 // Calculated using `getListOfPath()`
const INTERVAL_REFRESH_MS = 5000
const DOWNLOAD_CHUNK_SIZE = 10

export function LoadOffline() {
  const { serviceWorker } = useGetServiceWorker()
  const [cachedRequestsLength, setCachedRequestsLength] = useState(0)
  const [usage, setUsage] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [isRegulationsUpdated, setIsRegulationsUpdated] = useState<boolean>(false)

  const percent = ((cachedRequestsLength * 100) / TOTAL_DOWNLOAD_REQUESTS).toFixed(1)

  useEffect(() => {
    getStorage()
    const intervalId = setInterval(() => {
      getStorage()
    }, INTERVAL_REFRESH_MS)

    navigator.serviceWorker.addEventListener('message', async event => {
      if (event.data.type === CACHED_REQUEST_SIZE) {
        setCachedRequestsLength(event.data.data)
      }

      if (event.data.type === UPDATE_CACHE) {
        if (event.data.data) {
          // eslint-disable-next-line no-console
          console.error(event.data.data)

          return
        }
        setIsRegulationsUpdated(true)
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

  const updateRegulations = () => {
    serviceWorker?.postMessage(UPDATE_CACHE)
  }

  const downloadAll = async () => {
    const zoomToRequestPaths = getZoomToRequestPaths()
    const zoomToRequestPathsToDownload = IS_CYPRESS ? zoomToRequestPaths.slice(0, 6) : zoomToRequestPaths

    setIsDownloading(true)
    await fetchAllFromServiceWorkerByChunk(zoomToRequestPathsToDownload, DOWNLOAD_CHUNK_SIZE, cachedRequestsLength)
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

  const remainingMinutes = useMemo(() => {
    const remainingRequests = (TOTAL_DOWNLOAD_REQUESTS - cachedRequestsLength) / DOWNLOAD_CHUNK_SIZE

    return (remainingRequests / 60).toFixed(1)
  }, [cachedRequestsLength])

  return (
    <>
      <LoadBox>
        <Title>Préchargement</Title>
        <p>Cette page permet de télécharger les fonds de cartes de MonitorFish.</p>
        {(isDownloading || parseInt(percent, 10) > 0) && (
          <StyledProgress percent={parseFloat(percent)} status={getStatus()} strokeWidth={10} />
        )}
        {!isDownloading && parseInt(percent, 10) < 100 && (
          <StyledButton accent={Accent.PRIMARY} Icon={Icon.Download} onClick={downloadAll}>
            Télécharger
          </StyledButton>
        )}
        {isDownloading && (
          <>
            <FulfillingBouncingCircleSpinner className="loader" color={THEME.color.white} size={30} />
            <p>{remainingMinutes} minutes restantes</p>
          </>
        )}
        {parseInt(percent, 10) >= 100 && <p>Toutes les données ont été chargées.</p>}
        <Line />
        <StyledButton
          accent={Accent.PRIMARY}
          Icon={isRegulationsUpdated ? Icon.Check : Icon.Reset}
          onClick={updateRegulations}
        >
          {isRegulationsUpdated ? 'Données réglementaires à jour' : 'Mettre à jour les données réglementaires'}
        </StyledButton>
      </LoadBox>
      <span data-cy="load-offline-downloaded-tiles">
        {cachedRequestsLength} tuiles sauvegardées ({usage} MB)
      </span>
    </>
  )
}

const Line = styled.hr`
  margin-top: 24px;
`

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
  margin-bottom: 12px;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.7);

  .loader {
    margin-left: auto;
    margin-right: auto;
    margin-top: 18px;
    margin-bottom: 6px;
  }
`

const StyledProgress = styled(Progress.Line)`
  margin-top: 24px;
`
