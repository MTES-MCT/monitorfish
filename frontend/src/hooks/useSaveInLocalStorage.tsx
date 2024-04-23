import { getLocalStorageState } from '@utils/getLocalStorageState'

export const useGetInLocalStorage = (localStorageKey: string) => getLocalStorageState({}, localStorageKey) || {}
