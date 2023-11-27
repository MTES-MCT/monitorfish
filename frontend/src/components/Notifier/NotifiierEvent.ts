import type { TypeOptions } from 'react-toastify'

export type NotifierEventDetail = {
  isDialogError: boolean
  isSideWindowError: boolean
  message: string
  type: TypeOptions
}

export class NotifierEvent extends CustomEvent<NotifierEventDetail> {
  constructor(message: string, type: TypeOptions, isDialogError: boolean, isSideWindowError: boolean = false) {
    super('NOTIFIER_EVENT', {
      detail: {
        isDialogError,
        isSideWindowError,
        message,
        type
      }
    })
  }
}
