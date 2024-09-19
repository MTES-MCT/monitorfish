import { createId } from '@paralleldrive/cuid2'
import { omit } from 'lodash'

import { BROADCAST_CHANNEL_NAME, DEFAULT_OPTIONS, InternalActionType, MessageType } from './constants'
import { initializeStateFromOtherTab, sendStateToOtherTab, stampAction } from './utils'

import type { InternalAction, Message, ReduxStateSyncOptions, StampedAction } from './types'
import type { MainAppDispatch } from '@store'
import type { Action } from 'redux'

class ReduxStateSync {
  #channel: BroadcastChannel
  #dispatch: MainAppDispatch | undefined
  #isSynced: boolean
  #tabId: string
  #tabs: Record<string, boolean>

  constructor() {
    this.#channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
    this.#isSynced = false
    this.#tabId = createId()
    this.#tabs = {}

    this.#channel.onmessage = this.#handleBroadcastChannelMessage.bind(this)

    window.addEventListener('beforeunload', () => {
      this.#channel.postMessage({
        tabId: this.#tabId,
        type: MessageType.DestroyTab
      } satisfies Message)
    })
  }

  createStateSyncMiddleware = (options: Partial<ReduxStateSyncOptions>) => {
    const controlledOptions = { ...DEFAULT_OPTIONS, ...options }

    return ({ dispatch, getState }) =>
      next =>
      (action: Action | InternalAction | StampedAction) => {
        if (!this.#dispatch) {
          this.#dispatch = dispatch

          this.#channel.postMessage({
            tabId: this.#tabId,
            type: MessageType.GetInitialState
          } satisfies Message)
        }

        if ('$id' in action) {
          if (action.$isReduxStateSyncAction) {
            if (action.type === InternalActionType.SendStateToOtherTab) {
              this.#channel.postMessage({
                state: omit(getState(), '_persist'),
                tabId: this.#tabId,
                type: MessageType.SendInitialState
              } satisfies Message)
            }
          }

          return next(action)
        }

        const stampedAction = stampAction(action, this.#tabId)

        if (controlledOptions.actionFilter(stampedAction)) {
          this.#channel.postMessage({
            stampedAction,
            tabId: this.#tabId,
            type: MessageType.DispatchAction
          } satisfies Message)
        }

        return next(stampedAction)
      }
  }

  #handleBroadcastChannelMessage(event: MessageEvent<Message>) {
    const message = event.data

    switch (message.type) {
      case MessageType.GetInitialState:
        if (!this.#tabs[message.tabId]) {
          this.#tabs[message.tabId] = true

          this.#dispatch!(sendStateToOtherTab(message.tabId))
        }

        return

      case MessageType.SendInitialState:
        if (!this.#isSynced && message.state) {
          this.#isSynced = true

          this.#dispatch!(initializeStateFromOtherTab(message.tabId, message.state))
        }

        return

      case MessageType.DispatchAction:
        if (message.stampedAction) {
          this.#dispatch!(message.stampedAction)
        }

        // eslint-disable-next-line no-useless-return
        return

      case MessageType.DestroyTab:
        delete this.#tabs[message.tabId]

        // eslint-disable-next-line no-useless-return
        return

      default:
        break
    }
  }
}

export const reduxStateSync = new ReduxStateSync()

export const withReduxStateSync = appReducer => (state, action: Action | InternalAction) => {
  if ('payload' in action && action.type === InternalActionType.InitializeStateFromOtherTab) {
    return appReducer(action.payload, action)
  }

  return appReducer(state, action)
}
