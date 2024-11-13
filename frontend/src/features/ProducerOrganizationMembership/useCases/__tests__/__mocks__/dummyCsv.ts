import { jest } from '@jest/globals'

export function getDummyCsv() {
  const mockCsvContent = 'CFR; ; ; ; ; ; ; ;Date; ; ;Organization\n12345; ; ; ; ; ; ; ;01/10/2024; ; ;Organization 1'
  const file = new File([mockCsvContent], 'export_adhesions.csv', { type: 'text/csv' })

  file.arrayBuffer = jest.fn(async () => {
    const buffer = new ArrayBuffer(mockCsvContent.length)
    const view = new Uint8Array(buffer)
    /* eslint-disable-next-line no-plusplus */
    for (let i = 0; i < mockCsvContent.length; i++) {
      view[i] = mockCsvContent.charCodeAt(i)
    }

    return buffer
  })

  return file
}
