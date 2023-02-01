export class FormError<T extends Record<string, any>> extends Error {
  key: keyof T

  constructor(formValues: T, key: keyof T) {
    const message = `FormError: \`${String(key)}\` is invalid (value: \`${String(formValues[key])}\`).`

    super(message)

    this.key = key
  }
}
