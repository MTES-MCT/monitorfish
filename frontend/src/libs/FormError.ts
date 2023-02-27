export enum FormErrorCode {
  EMPTY_ARRAY = 'empty (array)',
  MISSING = 'missing',
  MISSING_OR_UNDEFINED = 'missing or undefined (or null)',
  TYPE_ARRAY = 'not an array (and should be)',
  UNDEFINED = 'undefined (or null)'
}

export class FormError<T extends Record<string, any>> extends Error {
  code: FormErrorCode
  key: keyof T

  constructor(formValues: Partial<T>, key: keyof T, code: FormErrorCode) {
    const controlledCode = code

    const message = `FormError: \`${String(key)}\` is ${controlledCode}. Value: \`${String(formValues[key])}\`.).`

    super(message)

    this.code = controlledCode
    this.key = key
  }
}
