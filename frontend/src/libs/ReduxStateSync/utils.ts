import { createId } from '@paralleldrive/cuid2'

import { InternalActionType } from './constants'

import type { InternalAction, StampedAction } from './types'
import type { Action } from 'redux'
import type { AnyObject } from 'yup'

export const sendStateToOtherTab = (tabId: string): InternalAction => ({
  $id: createId(),
  $isReduxStateSyncAction: true,
  $tabId: tabId,
  type: InternalActionType.SendStateToOtherTab
})

export const initializeStateFromOtherTab = (tabId: string, state: AnyObject): InternalAction => ({
  $id: createId(),
  $isReduxStateSyncAction: true,
  $tabId: tabId,
  payload: state,
  type: InternalActionType.InitializeStateFromOtherTab
})

export function stampAction(action: Action, tabId: string): StampedAction {
  return {
    ...action,
    $id: createId(),
    $isReduxStateSyncAction: false,
    $tabId: tabId
  }
}
