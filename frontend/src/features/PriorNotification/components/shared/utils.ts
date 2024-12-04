export function getSendButtonTitle({ isInvalidated, isPriorNotificationFormDirty }): string | undefined {
  switch (true) {
    case isInvalidated:
      return "Le préavis est invalidé, il n'est plus possible de le modifier ni de le diffuser."

    case isPriorNotificationFormDirty:
      return 'Veuillez enregistrer les modifications en cours avant de diffuser le préavis.'

    default:
      return undefined
  }
}
