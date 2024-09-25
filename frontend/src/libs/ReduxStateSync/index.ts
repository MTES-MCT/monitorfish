import { createId } from '@paralleldrive/cuid2'
import { omit } from 'lodash'

import { BROADCAST_CHANNEL_NAME, DEFAULT_OPTIONS, InternalActionType, MessageType } from './constants'
import { initializeStateFromOtherTab, sendStateToOtherTab, stampAction } from './utils'

import type { InternalAction, Message, ReduxStateSyncOptions, StampedAction } from './types'
import type { MainAppDispatch } from '@store'
import type { Action } from 'redux'
import type { AnyObject } from 'yup'

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

  createStateSyncMiddleware(options: Partial<ReduxStateSyncOptions>) {
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
          if (action.type === InternalActionType.SendStateToOtherTab) {
            this.#channel.postMessage({
              state: omit(getState(), '_persist'),
              tabId: this.#tabId,
              type: MessageType.SendInitialState
            } satisfies Message)
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

    // When another tab asks us to send our current Redux Store state
    switch (message.type) {
      case MessageType.GetInitialState:
        // we check that we haven't already sent it
        if (!this.#tabs[message.tabId]) {
          this.#tabs[message.tabId] = true

          // and we send it to the other tab
          this.#dispatch!(sendStateToOtherTab(message.tabId))
        }

        return

      // When another tab sends us their current Redux Store state
      // (because we asked for it via `MessageType.GetInitialState`)
      case MessageType.SendInitialState:
        // we check that we haven't already received it
        if (!this.#isSynced && message.state) {
          this.#isSynced = true

          // and we initialize our Redux Store state with the one we received
          this.#dispatch!(initializeStateFromOtherTab(message.tabId, message.state))
        }

        return

      // When another tab has an action dispatched to their Redux Store state,
      case MessageType.DispatchAction:
        if (message.stampedAction) {
          // we dispatch it to our Redux Store state to keep it synchronized
          this.#dispatch!(message.stampedAction)
        }

        return

      // When another tab gets closed,
      case MessageType.DestroyTab:
        // we delete it from our tabs list
        delete this.#tabs[message.tabId]

        // eslint-disable-next-line no-useless-return
        return

      default:
        break
    }
  }
}

export const reduxStateSync = new ReduxStateSync()

export const withReduxStateSync = appReducer => (state: AnyObject, action: Action | InternalAction) => {
  if ('payload' in action && action.type === InternalActionType.InitializeStateFromOtherTab) {
    return appReducer(
      {
        ...state,
        ...action.payload
      },
      action
    )
  }

  return appReducer(state, action)
}
