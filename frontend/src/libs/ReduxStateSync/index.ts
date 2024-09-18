import { BroadcastChannel, type BroadcastChannelOptions } from 'broadcast-channel'

import type { AnyObject } from '@mtes-mct/monitor-ui'
import type { MainAppDispatch } from '@store'

let lastUuid = 0
export const GET_INIT_STATE = '&_GET_INIT_STATE'
export const SEND_INIT_STATE = '&_SEND_INIT_STATE'
export const RECEIVE_INIT_STATE = '&_RECEIVE_INIT_STATE'
export const INIT_MESSAGE_LISTENER = '&_INIT_MESSAGE_LISTENER'

const BROADCAST_CHANNEL_NAME = 'monitorfish-channel'

interface ReduxStateSyncOptions {
  actionFilter: (action: { type: string }) => boolean
  broadcastChannelOptions: BroadcastChannelOptions
  prepareState: <State extends AnyObject>(state: State) => State
  receiveState: <State extends AnyObject>(_prevState: State, nextState: State) => State
}

const DEFAULT_OPTIONS: ReduxStateSyncOptions = {
  actionFilter: () => true,
  broadcastChannelOptions: {},
  prepareState: state => state,
  receiveState: (_prevState, nextState) => nextState
}

const getIniteState = () => ({ type: GET_INIT_STATE })
const sendIniteState = () => ({ type: SEND_INIT_STATE })
const receiveIniteState = state => ({ payload: state, type: RECEIVE_INIT_STATE })
const initListener = () => ({ type: INIT_MESSAGE_LISTENER })

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
}

function guid() {
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

// generate current window unique id
export const WINDOW_STATE_SYNC_ID = guid()
// export for test
export function generateUuidForAction(action) {
  const stampedAction = action
  stampedAction.$uuid = guid()
  stampedAction.$wuid = WINDOW_STATE_SYNC_ID

  return stampedAction
}

function MessageListener(
  this: any,
  {
    actionFilter,
    channel,
    dispatch
  }: {
    actionFilter: (action: { type: string }) => boolean
    channel: BroadcastChannel
    dispatch: MainAppDispatch
  }
) {
  let isSynced = false
  const tabs = {}
  this.handleOnMessage = stampedAction => {
    // Ignore if this action is triggered by this window
    if (stampedAction.$wuid === WINDOW_STATE_SYNC_ID) {
      return
    }
    // IE bug https://stackoverflow.com/questions/18265556/why-does-internet-explorer-fire-the-window-storage-event-on-the-window-that-st
    if (stampedAction.type === RECEIVE_INIT_STATE) {
      return
    }
    // ignore other values that saved to localstorage.
    if (stampedAction.$uuid && stampedAction.$uuid !== lastUuid) {
      if (stampedAction.type === GET_INIT_STATE && !tabs[stampedAction.$wuid]) {
        tabs[stampedAction.$wuid] = true
        dispatch(sendIniteState())
      } else if (stampedAction.type === SEND_INIT_STATE && !tabs[stampedAction.$wuid]) {
        if (!isSynced) {
          isSynced = true
          dispatch(receiveIniteState(stampedAction.payload))
        }
      } else if (actionFilter(stampedAction)) {
        lastUuid = stampedAction.$uuid
        dispatch(
          Object.assign(stampedAction, {
            $isSync: true
          })
        )
      }
    }
  }
  this.messageChannel = channel
  this.messageChannel.onmessage = this.handleOnMessage
}

export const createStateSyncMiddleware = (options: Partial<ReduxStateSyncOptions>) => {
  const controlledOptions = { ...DEFAULT_OPTIONS, ...options }

  const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME, controlledOptions.broadcastChannelOptions)
  const prepareState = options.prepareState ?? controlledOptions.prepareState
  let messageListener = null

  return ({ dispatch, getState }) =>
    next =>
    action => {
      if (!messageListener) {
        messageListener = new MessageListener({
          actionFilter: controlledOptions.actionFilter,
          channel,
          dispatch
        })
      }

      if (action && !action.$uuid) {
        const stampedAction = generateUuidForAction(action)
        lastUuid = stampedAction.$uuid
        try {
          if (action.type === SEND_INIT_STATE) {
            if (getState()) {
              stampedAction.payload = prepareState(getState())

              channel.postMessage(stampedAction)
            }

            return next(action)
          }

          if (controlledOptions.actionFilter(stampedAction) || action.type === GET_INIT_STATE) {
            channel.postMessage(stampedAction)
          }
        } catch (e) {
          console.error("Your browser doesn't support cross tab communication")
        }
      }

      return next(
        Object.assign(action, {
          $isSync: typeof action.$isSync === 'undefined' ? false : action.$isSync
        })
      )
    }
}

// eslint-disable-next-line max-len
export const createReduxStateSync =
  (appReducer, receiveState = DEFAULT_OPTIONS.receiveState) =>
  (state, action) => {
    let initState = state
    if (action.type === RECEIVE_INIT_STATE) {
      initState = receiveState(state, action.payload)
    }

    return appReducer(initState, action)
  }

// init state with other tab's state
export const withReduxStateSync = createReduxStateSync

export const initStateWithPrevTab = ({ dispatch }) => {
  dispatch(getIniteState())
}

/*
if don't dispath any action, the store.dispath will not be available for message listener.
therefor need to trigger an empty action to init the messageListener.

however, if already using initStateWithPrevTab, this function will be redundant
*/
export const initMessageListener = ({ dispatch }) => {
  dispatch(initListener())
}
