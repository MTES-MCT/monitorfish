export class ApiError extends Error {
  constructor(message: string, err: any) {
    super(message)

    // eslint-disable-next-line no-console
    console.error(err)
  }
}
