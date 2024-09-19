import { MessageType, type InternalActionType } from './constants'

import type { Action, ActionCreator as ReduxActionCreator } from 'redux'
import type { AnyObject } from 'yup'

export type InternalActionCreator = ReduxActionCreator<InternalAction>

export interface ReduxStateSyncOptions {
  actionFilter: (action: Action) => boolean
}

export type Message = {
  stampedAction?: StampedAction
  state?: AnyObject
  tabId: string
  type: MessageType
}

export type InternalAction = Action<InternalActionType> & {
  $id: string
  $isReduxStateSyncAction: true
  $tabId: string
  payload?: AnyObject
}

export type StampedAction = Action & {
  $id: string
  $isReduxStateSyncAction: false
  $tabId: string
}
