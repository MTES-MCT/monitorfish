import { jest } from '@jest/globals'

export function getVesselsDummyCsv() {
  const mockCsvContent = 'CFR,Call Sign,Marquage externe\nFR114515646,FW658,EMFS'
  const file = new File([mockCsvContent], 'navires.csv', { type: 'text/csv' })

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
