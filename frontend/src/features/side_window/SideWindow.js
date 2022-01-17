import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import SideWindowMenu from './SideWindowMenu'
import { sideWindowMenu } from '../../domain/entities/sideWindow'
import { AlertsSubMenu } from '../../domain/entities/alerts'
import SideWindowSubMenu from './SideWindowSubMenu'
import Alerts from './alerts/Alerts'
import { BeaconStatusesSubMenu } from './beacon_statuses/beaconStatuses'
import BeaconStatusesBoard from './beacon_statuses/BeaconStatusesBoard'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import { COLORS } from '../../constants/constants'
import { renderRowExpanded } from './alerts/tableCells'
import { usePrevious } from '../../hooks/usePrevious'
import BeaconStatusDetails from './beacon_statuses/BeaconStatusDetails'
import { beaconStatusesStub } from '../../stubs/beaconStatusStub'
import { batch, useDispatch, useSelector } from 'react-redux'
import { closeSideWindow, setSideWindowAsOpen } from '../../domain/shared_slices/Global'
import NewWindow from 'react-new-window'
import { resetFocusOnAlert } from '../../domain/shared_slices/Alert'
import SideWindowSubMenuLink from './SideWindowSubMenuLink'

const SideWindow = () => {
  const {
    openedSideWindowTab
  } = useSelector(state => state.global)
  const {
    beaconStatuses
  } = useSelector(state => state.beaconStatus)
  const dispatch = useDispatch()
  const [isPreloading, setIsPreloading] = useState(true)
  const previousOpenedSideWindowTab = usePrevious(openedSideWindowTab)
  const [selectedSubMenu, setSelectedSubMenu] = useState(openedSideWindowTab === sideWindowMenu.ALERTS.code
    ? AlertsSubMenu.MEMN
    : BeaconStatusesSubMenu.MALFUNCTIONING)
  const [isOverlayed, setIsOverlayed] = useState(false)

  /**
   * /!\
   * We must preload these components to add the associated `styled-component` styles to the DOM,
   * as they are normally loaded in lazy mode.
   * With this trick, the `react-new-window` module (we use with `<NewWindow/>` component located in `AlertsMapButton.js`)
   * can copy the styles using `document.styleSheets` as they are found in the DOM
   **/
  useEffect(() => {
    if (openedSideWindowTab) {
      dispatch(setSideWindowAsOpen())

      setTimeout(() => {
        setIsPreloading(false)
      }, 1000)
    }
  }, [openedSideWindowTab])

  useEffect(() => {
    if (openedSideWindowTab === previousOpenedSideWindowTab) {
      return
    }

    if (selectedSubMenu) {
      switch (openedSideWindowTab) {
        case sideWindowMenu.BEACON_STATUSES.code: {
          setSelectedSubMenu(BeaconStatusesSubMenu.MALFUNCTIONING)
          break
        }
        case sideWindowMenu.ALERTS.code: {
          setSelectedSubMenu(AlertsSubMenu.MEMN)
          break
        }
      }
    }
  }, [openedSideWindowTab, setSelectedSubMenu])

  /**
   * /!\
   * The components to preload so we got the associated styles
   **/
  function getComponentsForPreloading () {
    return <NotVisible hidden={true}>
      <Alerts
        selectedSubMenu={AlertsSubMenu.NAMOSA}
        setSelectedSubMenu={setSelectedSubMenu}
      />
      <BeaconStatusesBoard/>
      {renderRowExpanded()}
      <SideWindowSubMenu
        selectedMenu={sideWindowMenu.ALERTS}
        selectedSubMenu={AlertsSubMenu.NAMOSA}
        setSelectedSubMenu={setSelectedSubMenu}
      />
      <SideWindowSubMenuLink
        number={4}
        menu={BeaconStatusesSubMenu.MALFUNCTIONING}
        isSelected={false}
      />
      {
        beaconStatusesStub.map(beaconStatusStub =>
          <BeaconStatusDetails
            key={beaconStatusStub.beaconStatus.id}
            beaconStatus={beaconStatusStub.beaconStatus}
            comments={beaconStatusStub.comments}
            actions={beaconStatusStub.actions}
          />)
      }
      <BeaconStatusesBoardGrayOverlay isOverlayed={true}/>
    </NotVisible>
  }

  return <>{openedSideWindowTab
    ? <NewWindow
      copyStyles
      name={'MonitorFish'}
      title={'MonitorFish'}
      features={{ scrollbars: true, width: '1500px', height: '1200px' }}
      onUnload={() => {
        batch(() => {
          dispatch(closeSideWindow())
          dispatch(resetFocusOnAlert())
        })
      }}
    >
      <Wrapper>
        <SideWindowMenu
          selectedMenu={openedSideWindowTab}
        />
        <SideWindowSubMenu
          beaconStatuses={beaconStatuses}
          selectedMenu={openedSideWindowTab}
          selectedSubMenu={selectedSubMenu}
          setSelectedSubMenu={setSelectedSubMenu}
        />
        {
          isPreloading
            ? getComponentsForPreloading()
            : null
        }
        <BeaconStatusesBoardGrayOverlay
          isOverlayed={isOverlayed}
          onClick={() => setIsOverlayed(false)}
        />
        {
          isPreloading
            ? <Loading>
              <FulfillingBouncingCircleSpinner
                color={COLORS.grayShadow}
                className={'update-vessels'}
                size={100}/>
              <Text data-cy={'first-loader'}>Chargement...</Text>
            </Loading>
            : <>
              {
                openedSideWindowTab === sideWindowMenu.ALERTS.code &&
                <Alerts
                  selectedSubMenu={selectedSubMenu}
                  setSelectedSubMenu={setSelectedSubMenu}
                />
              }
              {
                openedSideWindowTab === sideWindowMenu.BEACON_STATUSES.code &&
                <BeaconStatusesBoard
                  setIsOverlayed={setIsOverlayed}
                  isOverlayed={isOverlayed}
                />
              }
            </>
        }
      </Wrapper>
    </NewWindow>
    : null
  }
  </>
}

export const BeaconStatusesBoardGrayOverlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: ${props => props.isOverlayed ? 0.5 : 0};
  background: ${COLORS.charcoal};
  z-index: ${props => props.isOverlayed ? 11 : -9999};
`

const Loading = styled.div`
  margin-top: 350px;
  margin-left: 550px;
`

const Text = styled.span`
  margin-top: 10px;
  font-size: 13px;
  color: ${COLORS.grayShadow};
  bottom: -17px;
  position: relative;
`

const NotVisible = styled.div`
  opacity: 0;
`

const Wrapper = styled.div`
  display: flex;
`

export default SideWindow
