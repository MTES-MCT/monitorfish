export class ApiError extends Error {
  public type: 'API'

  constructor(message: string, err: any) {
    super(message)

    this.type = 'API'

    // eslint-disable-next-line no-console
    console.error(err)
  }
}
