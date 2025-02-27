import { ConfirmationModal } from '@components/ConfirmationModal'
import { MapPropertyTrigger } from '@features/commonComponents/MapPropertyTrigger'
import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { MapBox } from '@features/Map/constants'
import { layerActions } from '@features/Map/layer.slice'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTracking } from '@hooks/useTracking'
import { Accent, Button, Icon, Level, MapMenuDialog } from '@mtes-mct/monitor-ui'
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { UserAccountContext } from '../../../context/UserAccountContext'
import { setRightMapBoxOpened } from '../../../domain/shared_slices/Global'
import { DELETE_CACHE } from '../../../workers/constants'
import { useGetServiceWorker } from '../../../workers/hooks/useGetServiceWorker'
import { registerServiceWorker } from '../../../workers/registerServiceWorker'
import { unregisterServiceWorker } from '../../../workers/unregisterServiceWorker'

const MARGIN_TOP = 428
const BYTE_TO_MEGA_BYTE_FACTOR = 0.000001

export function Account() {
  const dispatch = useMainAppDispatch()
  const { trackEvent } = useTracking()
  const { serviceWorker } = useGetServiceWorker()
  const userAccount = useContext(UserAccountContext)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const isBaseMapCachedLocally = useMainAppSelector(state => state.layer.isBaseMapCachedLocally)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.ACCOUNT)

  const [usage, setUsage] = useState<string>('0')
  const [isUnregisterCacheConfirmationModalOpen, setIsUnregisterCacheConfirmationModalOpen] = useState(false)
  const [isRegisterCacheConfirmationModalOpen, setIsRegisterCacheConfirmationModalOpen] = useState(false)

  const openOrClose = () => {
    dispatch(setRightMapBoxOpened(rightMapBoxOpened === MapBox.ACCOUNT ? undefined : MapBox.ACCOUNT))
  }

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage: nextUsage }) => {
        if (nextUsage) {
          setUsage((nextUsage * BYTE_TO_MEGA_BYTE_FACTOR).toFixed(1))
        }
      })
    }
  }, [isRendered])

  const deleteCache = () => {
    serviceWorker?.postMessage(DELETE_CACHE)

    dispatch(
      addMainWindowBanner({
        children: 'Les cartes téléchargées ont bien été réinitialisées.',
        closingDelay: 2000,
        isClosable: true,
        isFixed: true,
        level: Level.SUCCESS,
        withAutomaticClosing: true
      })
    )
    trackEvent({
      action: 'Réinitialisation des cartes sauvegardées en local',
      category: 'CACHE',
      name: userAccount.email ?? ''
    })
  }

  const toggleCacheBaseMap = (isCached: boolean) => {
    if (!isCached) {
      setIsUnregisterCacheConfirmationModalOpen(true)

      return
    }

    setIsRegisterCacheConfirmationModalOpen(true)
  }

  const confirmActivateCacheBaseMap = () => {
    trackEvent({
      action: 'Activation de la sauvegarde des cartes en local',
      category: 'CACHE',
      name: userAccount.email ?? ''
    })
    registerServiceWorker()
    dispatch(layerActions.setIsBaseMapCachedLocally(true))
    setIsRegisterCacheConfirmationModalOpen(false)
    dispatch(
      addMainWindowBanner({
        children: 'Stockage des cartes en local activé.',
        closingDelay: 2000,
        isClosable: true,
        isFixed: true,
        level: Level.SUCCESS,
        withAutomaticClosing: true
      })
    )
  }

  const confirmDeactivateCacheBaseMap = () => {
    trackEvent({
      action: 'Dé-activation de la sauvegarde des cartes en local',
      category: 'CACHE',
      name: userAccount.email ?? ''
    })
    unregisterServiceWorker()
    dispatch(layerActions.setIsBaseMapCachedLocally(false))

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <Wrapper>
      {isRendered && (
        <MapMenuDialogWrapper $hideBoxShadow $isOpen={isOpened} data-cy="map-account-box">
          <StyledContainer>
            <MapMenuDialog.Header>
              <MapMenuDialog.Title>Mon compte</MapMenuDialog.Title>
            </MapMenuDialog.Header>
            <MapMenuDialog.Body>
              {userAccount.email ?? 'Vous n’êtes pas connecté avec Cerbère'}
              <StyledButton accent={Accent.SECONDARY} Icon={Icon.Logout} isFullWidth onClick={userAccount.logout}>
                Se déconnecter
              </StyledButton>
              {isBaseMapCachedLocally && (
                <>
                  <hr />
                  Taille des cartes téléchargées : {usage} Mo
                </>
              )}
            </MapMenuDialog.Body>
            {userAccount.email && (
              <StyledFooter>
                <MapPropertyTrigger
                  booleanProperty={isBaseMapCachedLocally}
                  booleanVerbs={['Ne pas télécharger', 'Télécharger']}
                  Icon={Icon.MapLayers}
                  text="les cartes en local"
                  updateBooleanProperty={toggleCacheBaseMap}
                />
                <MapPropertyTrigger
                  booleanProperty={false}
                  booleanVerbs={['', 'Réinitialiser']}
                  disabled={!serviceWorker}
                  Icon={Icon.Reset}
                  text="les cartes téléchargées"
                  updateBooleanProperty={deleteCache}
                />
              </StyledFooter>
            )}
          </StyledContainer>
        </MapMenuDialogWrapper>
      )}
      <MapToolButton
        Icon={Icon.Account}
        isActive={isOpened}
        onClick={openOrClose}
        style={{ top: MARGIN_TOP }}
        title="Mon compte"
      />
      {isUnregisterCacheConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Désactiver"
          message={
            <>
              <p>Êtes-vous sûr de désactiver le téléchargement des cartes en local ?</p>
              <p>
                <i>
                  L&apos;application sera rechargée après confirmation, vous pouvez perdre votre travail en cours. Si la
                  deuxième fenêtre est ouverte, il faudra la fermer manuellement.
                </i>
              </p>
            </>
          }
          onCancel={() => setIsUnregisterCacheConfirmationModalOpen(false)}
          onConfirm={confirmDeactivateCacheBaseMap}
          title="Téléchargement des cartes"
        />
      )}
      {isRegisterCacheConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Activer et recharger"
          message={
            <>
              <p>Êtes-vous sûr d&apos;activer le téléchargement des cartes en local ?</p>
              <p>
                <i>
                  L&apos;application sera rechargée après confirmation, vous pouvez perdre votre travail en cours. Si la
                  deuxième fenêtre est ouverte, il faudra la fermer manuellement.
                </i>
              </p>
            </>
          }
          onCancel={() => setIsRegisterCacheConfirmationModalOpen(false)}
          onConfirm={confirmActivateCacheBaseMap}
          title="Téléchargement des cartes"
        />
      )}
    </Wrapper>
  )
}

const StyledButton = styled(Button)`
  margin-top: 14px;
`

const StyledContainer = styled(MapMenuDialog.Container)`
  margin-right: unset;
`

const StyledFooter = styled(MapMenuDialog.Footer)`
  padding: 0;
  gap: 0;
`

const Wrapper = styled.div`
  transition: all 0.2s;
  left: 10px;

  * {
    box-sizing: border-box;
  }
`

const MapMenuDialogWrapper = styled(MapToolBox)`
  top: ${MARGIN_TOP}px;
`
