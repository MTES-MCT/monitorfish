import type { ReduxStateSyncOptions } from './types'

export const BROADCAST_CHANNEL_NAME = 'monitorfish-channel'

export const DEFAULT_OPTIONS: ReduxStateSyncOptions = {
  actionFilter: () => true
}

export enum MessageType {
  DestroyTab = 'DestroyTab',
  DispatchAction = 'DispatchAction',
  GetInitialState = 'GetInitialState',
  SendInitialState = 'SendInitialState'
}

export enum InternalActionType {
  InitializeStateFromOtherTab = '&_INITIALIZE_STATE_FROM_OTHER_TAB',
  SendStateToOtherTab = '&_SEND_STATE_TO_OTHER_TAB'
}
