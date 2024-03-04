import { getLocalStorageState } from '../utils'

export const useGetInLocalStorage = (localStorageKey: string) => getLocalStorageState({}, localStorageKey) || {}
