import type { ReduxStateSyncOptions } from './types'

export const BROADCAST_CHANNEL_NAME = 'monitorfish-channel'

export const DEFAULT_OPTIONS: ReduxStateSyncOptions = {
  actionFilter: () => true
}

export enum MessageType {
  CheckForExistingMainWindow = 'CheckForExistingMainWindow',
  CheckForExistingSideWindow = 'CheckForExistingSideWindow',
  DeclareExistingMainWindow = 'DeclareExistingMainWindow',
  DeclareExistingSideWindow = 'DeclareExistingSideWindow',
  DestroyTab = 'DestroyTab',
  DispatchAction = 'DispatchAction',
  GetInitialState = 'GetInitialState',
  SendInitialState = 'SendInitialState'
}

export enum InternalActionType {
  InitializeStateFromOtherTab = '&_INITIALIZE_STATE_FROM_OTHER_TAB',
  SendStateToOtherTab = '&_SEND_STATE_TO_OTHER_TAB'
}

export enum TabType {
  FirstMainWindow = 'FirstMainWindow',
  FirstSideWindow = 'FirstSideWindow',
  OtherMainWindow = 'OtherMainWindow',
  OtherSideWindow = 'OtherSideWindow'
}
