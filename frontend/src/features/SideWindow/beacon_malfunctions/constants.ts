import { getOptionsFromLabelledEnum } from '../../../utils/getOptionsFromLabelledEnum'

export enum BeaconMalFunctionSubMenuFilter {
  MALFUNCTIONING = 'Avaries VMS en cours'
}

export const BEACON_MALFUNCTION_LIST_SUB_MENU = getOptionsFromLabelledEnum(BeaconMalFunctionSubMenuFilter)
